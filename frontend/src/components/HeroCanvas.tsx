import { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════
   HERO CANVAS — ambient WebGL haze

   A single full-screen quad running one fragment shader: drifting
   fractal noise tinted with the brand red, plus a soft light that
   follows the pointer. It sits behind the hero content and composites
   with mix-blend-mode: screen, so its black regions vanish and only
   the glow reads.

   Deliberately hand-written WebGL rather than a 3D library — the whole
   effect is one draw call per frame and adds no dependency weight to
   a page that has to stay fast.

   It fails soft in every direction: no WebGL context, a shader that
   will not compile, reduced-motion or a small screen all simply render
   nothing, and the hero looks exactly as it did before.
   ═══════════════════════════════════════════════ */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  float t = u_time * 0.035;

  // Two noise fields drifting against each other read as slow smoke.
  float n1 = fbm(p * 2.1 + vec2(t, -t * 0.55));
  float n2 = fbm(p * 3.4 - vec2(t * 0.7, t * 0.3));
  float haze = smoothstep(0.34, 0.95, n1 * 0.65 + n2 * 0.45);

  vec3 red = vec3(0.86, 0.15, 0.15);
  vec3 col = red * haze * 0.20;

  // Pointer light
  vec2 m = vec2(u_mouse.x * aspect, u_mouse.y);
  float d = distance(p, m);
  col += red * smoothstep(0.62, 0.0, d) * 0.13;

  // Keep the frame edges dark so the effect never fights the layout.
  float vig = smoothstep(1.15, 0.28, distance(uv, vec2(0.5)));
  col *= vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function HeroCanvas({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = ref.current;
    if (!canvas) return;

    const gl = (canvas.getContext('webgl', { antialias: false, alpha: false, depth: false }) ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // Two triangles covering clip space.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_res');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');

    // Half resolution is plenty for a soft blur-like field and keeps
    // the fragment cost negligible on high-DPI displays.
    const dpr = () => Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;

    const resize = () => {
      const scale = dpr();
      const w = Math.max(1, Math.floor(canvas.clientWidth * scale));
      const h = Math.max(1, Math.floor(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    let mx = 0.5, my = 0.5;
    let tx = 0.5, ty = 0.5;
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = 1 - (e.clientY - r.top) / r.height;
    };

    let frame = 0;
    let visible = true;
    const started = performance.now();

    const render = () => {
      frame = requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      resize();
      mx += (tx - mx) * 0.045;   // pointer light trails the cursor
      my += (ty - my) * 0.045;
      gl.uniform1f(uTime, (performance.now() - started) / 1000);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    // Stop drawing entirely once the hero is scrolled past.
    const io = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0 }
    );
    io.observe(canvas);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('resize', resize);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={ref} className="pm-hero-canvas" aria-hidden />;
}
