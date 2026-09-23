import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/* ═══════════════════════════════════════════════
   LAYER SCROLL
   Scroll-driven stacked panels. Each panel pins at the top of the
   viewport while the next one rises from the bottom of the viewport
   and covers it. The vertical movement is document scroll itself
   (1:1, no easing, no timers), so forward/reverse/fast/slow scrolling,
   trackpads and wheels all behave identically.

   Only the secondary depth cues (the outgoing panel receding) are
   driven by a scroll-progress motion value.
   ═══════════════════════════════════════════════ */

const DESKTOP_QUERY = '(min-width: 901px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const readEnabled = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(DESKTOP_QUERY).matches &&
  !window.matchMedia(REDUCED_MOTION_QUERY).matches;

/** True only where the stacked-layer experience is appropriate (desktop, motion allowed). */
export const useLayerScrollEnabled = () => {
  const [enabled, setEnabled] = useState(readEnabled);
  useEffect(() => {
    const queries = [window.matchMedia(DESKTOP_QUERY), window.matchMedia(REDUCED_MOTION_QUERY)];
    const onChange = () => setEnabled(readEnabled());
    queries.forEach(q => q.addEventListener('change', onChange));
    onChange();
    return () => queries.forEach(q => q.removeEventListener('change', onChange));
  }, []);
  return enabled;
};

type LayerPanelProps = {
  children: ReactNode;
  /** Anchor id — rendered on a zero-height marker so #hash links stay accurate. */
  id?: string;
  /** Later panels must sit above earlier ones. */
  zIndex: number;
  /** Opaque fill so the panel fully hides the layer beneath it. */
  background?: string;
  /** Off → renders as a plain section in normal document flow (mobile / reduced motion). */
  enabled: boolean;
  /** This panel rises over something, so it casts a shadow on the panel below. */
  raised?: boolean;
  /** A later panel covers this one, so it recedes slightly as that happens. */
  recede?: boolean;
};

export default function LayerPanel({
  children, id, zIndex, background = 'var(--bg)', enabled, raised = false, recede = false,
}: LayerPanelProps) {
  const ref = useRef<HTMLElement>(null);

  // 0 → the next panel's top edge is at the bottom of the viewport (covering starts)
  // 1 → the next panel's top edge is at the top of the viewport (fully covered)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['end end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.97]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.22]);

  // Entrance: 0 → this panel's top edge is still at the bottom of the viewport,
  // 1 → it has arrived at the top. Drives the cues that make the panel read as a
  // physical slab sliding over the one beneath rather than a swapped background.
  const { scrollYProgress: entryProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start start'],
  });
  // The leading edge is rounded while travelling and squares off once seated.
  const radius = useTransform(entryProgress, [0, 0.85, 1], [30, 6, 0]);
  // Content drifts up slightly slower than the panel itself — cheap parallax depth.
  const contentY = useTransform(entryProgress, [0, 1], [56, 0]);

  // A panel taller than the viewport must scroll through completely before it pins,
  // otherwise its lower part could never be read. Sticking it to a negative offset
  // parks it bottom-aligned instead of top-aligned. Measured, never hard-coded.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!enabled) { el.style.removeProperty('--layer-top'); return; }

    let frame = 0;
    const measure = () => {
      const overflow = el.offsetHeight - window.innerHeight;
      el.style.setProperty('--layer-top', overflow > 0 ? `${-Math.round(overflow)}px` : '0px');
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };

    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [enabled]);

  // The anchor id lives on a zero-height marker in normal flow, never on the
  // sticky panel: a pinned element already reports top: 0, so a #hash jump to it
  // from inside the stack would not scroll anywhere.
  const anchor = id ? <div id={id} className="layer-scroll-anchor" aria-hidden /> : null;

  if (!enabled) return <>{anchor}<section ref={ref}>{children}</section></>;

  return (
    <>
      {anchor}
      <section ref={ref} className="layer-scroll-section" style={{ zIndex }}>
        <motion.div
          className={`layer-scroll-sticky${raised ? ' layer-scroll-sticky--raised' : ''}${recede ? ' layer-scroll-sticky--recede' : ''}`}
          style={{
            '--layer-bg': background,
            scale: recede ? scale : undefined,
            // Only a panel that rises over another needs a rounded leading edge.
            borderTopLeftRadius: raised ? radius : undefined,
            borderTopRightRadius: raised ? radius : undefined,
          } as React.CSSProperties}
        >
          {raised
            ? <motion.div className="layer-scroll-content" style={{ y: contentY }}>{children}</motion.div>
            : children}
          {recede && <motion.div className="layer-scroll-scrim" style={{ opacity: scrimOpacity }} aria-hidden />}
        </motion.div>
      </section>
    </>
  );
}
