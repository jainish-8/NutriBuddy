import { useEffect, useRef, useState } from 'react';

/**
 * useScrollReveal — triggers a CSS class when an element enters the viewport.
 * @param {object} options
 *   threshold  — how much of the element must be visible (0–1, default 0.12)
 *   delay      — ms delay before animation fires (default 0)
 *   once       — only fire once (default true)
 */
export function useScrollReveal({ threshold = 0.12, delay = 0, once = true } = {}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setRevealed(true), delay);
          } else {
            setRevealed(true);
          }
          if (once) observer.unobserve(el);
        } else if (!once) {
          setRevealed(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay, once]);

  return { ref, revealed };
}

/**
 * Reveal — a wrapper component that applies scroll-triggered animation.
 * Usage:
 *   <Reveal preset="fadeUp" delay={100}>
 *     <YourComponent />
 *   </Reveal>
 */
export function Reveal({
  children,
  preset = 'fadeUp',
  delay = 0,
  threshold = 0.1,
  style = {},
  className = '',
}) {
  const { ref, revealed } = useScrollReveal({ threshold, delay });

  const baseStyles = {
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    willChange: 'opacity, transform',
  };

  const presets = {
    fadeUp: {
      hidden:   { opacity: 0, transform: 'translateY(36px)' },
      revealed: { opacity: 1, transform: 'translateY(0px)' },
    },
    fadeDown: {
      hidden:   { opacity: 0, transform: 'translateY(-24px)' },
      revealed: { opacity: 1, transform: 'translateY(0px)' },
    },
    fadeLeft: {
      hidden:   { opacity: 0, transform: 'translateX(-36px)' },
      revealed: { opacity: 1, transform: 'translateX(0px)' },
    },
    fadeRight: {
      hidden:   { opacity: 0, transform: 'translateX(36px)' },
      revealed: { opacity: 1, transform: 'translateX(0px)' },
    },
    scaleUp: {
      hidden:   { opacity: 0, transform: 'scale(0.88)' },
      revealed: { opacity: 1, transform: 'scale(1)' },
    },
    fade: {
      hidden:   { opacity: 0, transform: 'none' },
      revealed: { opacity: 1, transform: 'none' },
    },
  };

  const p = presets[preset] || presets.fadeUp;
  const stateStyle = revealed ? p.revealed : p.hidden;

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...baseStyles, ...stateStyle, ...style }}
    >
      {children}
    </div>
  );
}
