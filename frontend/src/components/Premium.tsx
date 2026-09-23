import {
  ReactNode, useEffect, useRef, useState, CSSProperties,
} from 'react';
import { motion, useInView, useScroll, useSpring, useTransform } from 'framer-motion';

/* ═══════════════════════════════════════════════
   PREMIUM INTERACTION PRIMITIVES

   Small, composable pieces used by the public pages. Three rules
   hold everywhere in this file:

   1. Nothing here changes markup semantics — each piece wraps
      children, it never replaces them.
   2. Every effect is gated on a fine pointer with motion allowed.
      Touch, keyboard and reduced-motion users get the plain layout.
   3. Nothing transforms the scroll container. The layered panels
      rely on native position: sticky, and a transformed ancestor
      would silently break it.
   ═══════════════════════════════════════════════ */

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const DESKTOP = '(min-width: 901px)';

const matches = (q: string) =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(q).matches;

/** True when rich pointer-driven motion is appropriate. */
export const usePremiumEnabled = () => {
  const read = () => matches(FINE_POINTER) && matches(DESKTOP) && !matches(REDUCED_MOTION);
  const [on, setOn] = useState(read);
  useEffect(() => {
    const queries = [FINE_POINTER, DESKTOP, REDUCED_MOTION].map(q => window.matchMedia(q));
    const onChange = () => setOn(read());
    queries.forEach(q => q.addEventListener('change', onChange));
    onChange();
    return () => queries.forEach(q => q.removeEventListener('change', onChange));
  }, []);
  return on;
};

/* ───────────────────────────────────────────────
   SMOOTH SCROLL

   Inertial wheel scrolling. Implemented by easing the real document
   scroll position (window.scrollTo), never by translating a wrapper —
   that is what keeps position: sticky, useScroll and anchor offsets
   all working exactly as before.

   Set SMOOTH_SCROLL to false in HomePage to disable it wholesale.
   ─────────────────────────────────────────────── */

/** Walks up from the event target looking for something that scrolls itself. */
const insideScrollable = (start: EventTarget | null, deltaY: number) => {
  let node = start as HTMLElement | null;
  while (node && node !== document.body && node !== document.documentElement) {
    if (node.nodeType === 1) {
      const style = getComputedStyle(node);
      const scrolls = /(auto|scroll|overlay)/.test(style.overflowY);
      const canScroll = node.scrollHeight > node.clientHeight + 1;
      if (scrolls && canScroll) {
        const atTop = node.scrollTop <= 0;
        const atEnd = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
        // Only defer while the inner element can still absorb the delta.
        if (!((deltaY < 0 && atTop) || (deltaY > 0 && atEnd))) return true;
      }
      if (node.tagName === 'TEXTAREA') return true;
    }
    node = node.parentElement;
  }
  return false;
};

export function SmoothScroll({ enabled, damping = 0.11 }: { enabled: boolean; damping?: number }) {
  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    // CSS smooth scrolling would fight the easing below.
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    let target = window.scrollY;
    let current = window.scrollY;
    let running = false;
    let frame = 0;

    const limit = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const tick = () => {
      const delta = target - current;
      if (Math.abs(delta) < 0.4) {
        current = target;
        window.scrollTo({ top: current, behavior: 'instant' as ScrollBehavior });
        running = false;
        return;
      }
      current += delta * damping;
      window.scrollTo({ top: current, behavior: 'instant' as ScrollBehavior });
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      current = window.scrollY;
      frame = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;               // pinch-zoom / browser zoom
      if (insideScrollable(e.target, e.deltaY)) return;  // let inner scrollers win
      e.preventDefault();
      // deltaMode 1 = lines, 2 = pages
      const scale = e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? window.innerHeight : 1;
      target = Math.min(Math.max(target + e.deltaY * scale, 0), limit());
      start();
    };

    // Anchor clicks ride the same easing instead of jumping.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link) return;
      const id = link.getAttribute('href')!.slice(1);
      if (!id) return;
      const dest = document.getElementById(id);
      if (!dest) return;
      e.preventDefault();
      const top = dest.getBoundingClientRect().top + window.scrollY;
      target = Math.min(Math.max(top, 0), limit());
      start();
      history.replaceState(null, '', `#${id}`);
    };

    // Keyboard, scrollbar dragging and programmatic scrolls stay native;
    // this just keeps our target in sync so the next wheel event resumes
    // from wherever the page actually is.
    const onScroll = () => { if (!running) { target = window.scrollY; current = target; } };
    const onResize = () => { target = Math.min(target, limit()); };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      root.style.scrollBehavior = previousBehavior;
    };
  }, [enabled, damping]);

  return null;
}

/* ───────────────────────────────────────────────
   CUSTOM CURSOR
   A dot that tracks exactly and a ring that lags behind it. The ring
   swells over anything interactive.
   ─────────────────────────────────────────────── */
export function CustomCursor({ enabled }: { enabled: boolean }) {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add('pm-cursor-active');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let frame = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    };
    const interactive = 'a, button, input, select, textarea, [role="button"], [data-cursor="hover"]';
    const onOver = (e: MouseEvent) => {
      const hit = (e.target as HTMLElement | null)?.closest?.(interactive);
      ring.current?.classList.toggle('is-hover', !!hit);
    };
    const onDown = () => ring.current?.classList.add('is-down');
    const onUp = () => ring.current?.classList.remove('is-down');
    const onLeave = () => {
      if (dot.current) dot.current.style.opacity = '0';
      if (ring.current) ring.current.style.opacity = '0';
    };
    const onEnter = () => {
      if (dot.current) dot.current.style.opacity = '1';
      if (ring.current) ring.current.style.opacity = '1';
    };

    const tick = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      cancelAnimationFrame(frame);
      document.body.classList.remove('pm-cursor-active');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={dot} className="pm-cursor-dot" aria-hidden />
      <div ref={ring} className="pm-cursor-ring" aria-hidden />
    </>
  );
}

/* ───────────────────────────────────────────────
   SCROLL PROGRESS
   ─────────────────────────────────────────────── */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 });
  return <motion.div className="pm-progress" style={{ scaleX }} aria-hidden />;
}

/* ───────────────────────────────────────────────
   REVEAL GATE

   Every reveal in this file starts from a hidden state, which makes a
   missed observer callback indistinguishable from broken content. This
   hook removes that failure mode: alongside useInView it runs a plain
   geometry check, so if the observer never reports — unsupported, the
   element measured zero-size at observe time, an ancestor clipped it out
   of the root, or it was already past the viewport on load — the content
   still appears as soon as it is genuinely on screen.

   It reveals on real visibility, never on a blind timer, so the scroll
   choreography is unchanged when the observer works normally.
   ─────────────────────────────────────────────── */
const useRevealed = (ref: React.RefObject<HTMLElement | null>, margin = '-8%') => {
  const inView = useInView(ref as never, { once: true, margin: margin as never });
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (inView || fallback) return;
    const check = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // On screen, or already scrolled past — either way it must be visible.
      if (r.top < window.innerHeight * 0.98 && r.bottom > 0) setFallback(true);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    // Catches late layout shifts (images loading, fonts swapping) that move
    // an element into view without any scroll event.
    const poll = window.setInterval(check, 600);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      window.clearInterval(poll);
    };
  }, [inView, fallback, ref]);

  return inView || fallback;
};

/* ───────────────────────────────────────────────
   SPLIT TEXT
   Word-by-word rise. Splitting on whitespace keeps Kannada
   (and any other script) intact — no per-character slicing.
   ─────────────────────────────────────────────── */
export function SplitText({
  children, className = '', stagger = 0.045, as: Tag = 'span',
}: {
  children: string;
  className?: string;
  stagger?: number;
  as?: 'span' | 'h1' | 'h2' | 'h3';
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useRevealed(ref, '-12%');
  const words = String(children ?? '').split(/(\s+)/);

  return (
    <Tag
      ref={ref as never}
      className={`pm-split ${inView ? 'in-view' : ''} ${className}`}
    >
      {words.map((word, i) =>
        /^\s+$/.test(word)
          ? <span key={i}> </span>
          : (
            <span className="pm-split-word" key={i}>
              <span style={{ transitionDelay: `${(i / 2) * stagger}s` }}>{word}</span>
            </span>
          )
      )}
    </Tag>
  );
}

/* ───────────────────────────────────────────────
   REVEAL — mask wipe for any block
   ─────────────────────────────────────────────── */
export function Reveal({
  children, delay = 0, className = '', style,
}: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useRevealed(ref);
  return (
    <div
      ref={ref}
      className={`pm-reveal ${inView ? 'in-view' : ''} ${className}`}
      style={{ transitionDelay: `${delay}s`, ...style }}
    >
      {children}
    </div>
  );
}

/* ───────────────────────────────────────────────
   PARALLAX — subtle vertical drift against scroll
   ─────────────────────────────────────────────── */
export function Parallax({
  children, distance = 60, enabled = true, className = '',
}: { children: ReactNode; distance?: number; enabled?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const smooth = useSpring(y, { stiffness: 120, damping: 30, mass: .4 });
  if (!enabled) return <div className={className}>{children}</div>;
  return <motion.div ref={ref} className={className} style={{ y: smooth }}>{children}</motion.div>;
}

/* ───────────────────────────────────────────────
   MAGNETIC — element leans toward the cursor
   ─────────────────────────────────────────────── */
export function Magnetic({
  children, strength = 0.32, enabled = true, className = '',
}: { children: ReactNode; strength?: number; enabled?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 18, mass: .5 });
  const y = useSpring(0, { stiffness: 220, damping: 18, mass: .5 });

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * strength);
      y.set((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => { x.set(0); y.set(0); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled, strength, x, y]);

  if (!enabled) return <span className={className}>{children}</span>;
  return (
    <motion.div ref={ref} className={className} style={{ x, y, display: 'inline-block' }}>
      {children}
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   TILT — perspective depth on hover
   ─────────────────────────────────────────────── */
export function Tilt({
  children, max = 7, enabled = true, className = '',
}: { children: ReactNode; max?: number; enabled?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      ry.set(px * max * 2);
      rx.set(-py * max * 2);
    };
    const onLeave = () => { rx.set(0); ry.set(0); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled, max, rx, ry]);

  if (!enabled) return <div className={className}>{children}</div>;
  return (
    <div className="pm-tilt-scene">
      <motion.div
        ref={ref}
        className={`pm-tilt ${className}`}
        style={{ rotateX: rx, rotateY: ry }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   COUNT UP — stats tick to their value when scrolled into view
   ─────────────────────────────────────────────── */
export function CountUp({ value, duration = 1400 }: { value: string | number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const [shown, setShown] = useState<string | number>(0);

  const numeric = typeof value === 'number' ? value : parseInt(String(value).replace(/\D/g, ''), 10);
  const isNumeric = Number.isFinite(numeric);

  useEffect(() => {
    // Non-numeric placeholders (the seeded "XX") are shown verbatim.
    if (!inView || !isNumeric) { if (!isNumeric) setShown(value); return; }
    if (matches(REDUCED_MOTION)) { setShown(numeric); return; }
    let frame = 0;
    const started = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(numeric * eased));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, numeric, isNumeric, value, duration]);

  return <span ref={ref} className="pm-stat">{shown}</span>;
}
