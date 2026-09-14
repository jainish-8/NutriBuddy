import React, { useRef, useState, useEffect, useCallback } from 'react';
import './dock.css';

/**
 * Calculates Gaussian magnification scale factor based on pixel distance from cursor.
 * Formula: scale = (magnification − 1) × exp(−d² / (2 × distance²)) + 1
 */
function getGaussianScale(d, magnification, distance) {
  if (distance <= 0) return 1;
  const exponent = -Math.pow(d, 2) / (2 * Math.pow(distance, 2));
  return (magnification - 1) * Math.exp(exponent) + 1;
}

/**
 * Dock Component
 * macOS-style animated dock with Gaussian neighbor icon magnification driven by spring physics.
 * 
 * @param {Object} props
 * @param {Array<{ icon: React.ReactNode, label: string, href?: string, onClick?: () => void }>} props.items
 * @param {number} [props.magnification=2.2] Maximum scale factor under the cursor
 * @param {number} [props.distance=100] Pixel radius from cursor for neighbor magnification
 * @param {number} [props.iconSize=48] Base icon size in pixels
 * @param {number} [props.gap=12] Gap between icons in pixels
 * @param {boolean} [props.alwaysShowLabels=false] If true, labels display beneath icons instead of on hover
 * @param {{ stiffness?: number, damping?: number, mass?: number }} [props.springOptions] Spring dynamics
 * @param {string} [props.className=""] Extra CSS classes for the container
 */
export function Dock({
  items = [],
  magnification = 2.2,
  distance = 100,
  iconSize = 48,
  gap = 12,
  alwaysShowLabels = false,
  springOptions = { stiffness: 300, damping: 22, mass: 0.5 },
  className = ''
}) {
  const containerRef = useRef(null);
  const iconRefs = useRef([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Springs state array: { currentScale, targetScale, velocity }
  const springsRef = useRef([]);
  const rafId = useRef(null);
  const isHoveringDock = useRef(false);

  // Keep iconRefs and springsRef aligned with items length
  useEffect(() => {
    springsRef.current = items.map((_, i) => springsRef.current[i] || {
      currentScale: 1,
      targetScale: 1,
      velocity: 0
    });
  }, [items]);

  // Spring physics solver running on requestAnimationFrame
  const runSpringAnimation = useCallback(() => {
    if (rafId.current) return;

    const stiffness = springOptions?.stiffness ?? 300;
    const damping = springOptions?.damping ?? 22;
    const mass = springOptions?.mass ?? 0.5;
    const dt = 1 / 60; // 60fps standard physics delta step

    const step = () => {
      let isMoving = false;

      for (let i = 0; i < items.length; i++) {
        const spring = springsRef.current[i];
        const el = iconRefs.current[i];
        if (!spring) continue;

        // Hooke's Law Spring Force + Viscous Drag Force
        const displacement = spring.currentScale - spring.targetScale;
        const springForce = -stiffness * displacement;
        const dampingForce = -damping * spring.velocity;
        const acceleration = (springForce + dampingForce) / mass;

        spring.velocity += acceleration * dt;
        spring.currentScale += spring.velocity * dt;

        // Check settling threshold
        if (Math.abs(spring.velocity) > 0.0005 || Math.abs(spring.currentScale - spring.targetScale) > 0.0005) {
          isMoving = true;
        } else {
          spring.currentScale = spring.targetScale;
          spring.velocity = 0;
        }

        // Direct DOM transform mutation (zero React re-renders during 60/120fps animation)
        if (el) {
          el.style.transform = `scale(${spring.currentScale})`;
        }
      }

      if (isMoving) {
        rafId.current = requestAnimationFrame(step);
      } else {
        rafId.current = null;
      }
    };

    rafId.current = requestAnimationFrame(step);
  }, [items.length, springOptions]);

  // Handle cursor moving across the dock container
  const handleMouseMove = useCallback((e) => {
    isHoveringDock.current = true;
    const cursorX = e.clientX;

    for (let i = 0; i < items.length; i++) {
      const el = iconRefs.current[i];
      if (!el || !springsRef.current[i]) continue;

      const rect = el.getBoundingClientRect();
      const iconCenterX = rect.left + rect.width / 2;
      const d = Math.abs(cursorX - iconCenterX);

      springsRef.current[i].targetScale = getGaussianScale(d, magnification, distance);
    }

    runSpringAnimation();
  }, [items.length, magnification, distance, runSpringAnimation]);

  // Handle cursor leaving the dock container
  const handleMouseLeave = useCallback(() => {
    isHoveringDock.current = false;
    setHoveredIndex(null);

    for (let i = 0; i < items.length; i++) {
      if (springsRef.current[i]) {
        springsRef.current[i].targetScale = 1;
      }
    }

    runSpringAnimation();
  }, [items.length, runSpringAnimation]);

  // Clean up rAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <div className="unlumen-dock-wrapper">
      <nav
        ref={containerRef}
        className={`unlumen-dock-container ${className}`.trim()}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          gap: `${gap}px`,
          padding: `${Math.max(8, Math.round(iconSize * 0.2))}px ${Math.max(12, Math.round(iconSize * 0.28))}px`,
          height: `${iconSize + Math.max(16, Math.round(iconSize * 0.4))}px`
        }}
        aria-label="Application Dock"
        role="toolbar"
      >
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const Component = item.href ? 'a' : 'button';
          const commonProps = {
            ref: (el) => { iconRefs.current[index] = el; },
            className: 'unlumen-dock-item',
            style: {
              width: `${iconSize}px`,
              height: `${iconSize}px`
            },
            onMouseEnter: () => setHoveredIndex(index),
            onMouseLeave: () => {
              if (hoveredIndex === index) setHoveredIndex(null);
            },
            title: item.label,
            'aria-label': item.label
          };

          if (item.href) {
            commonProps.href = item.href;
          } else {
            commonProps.type = 'button';
            commonProps.onClick = item.onClick;
          }

          return (
            <Component key={item.label || index} {...commonProps}>
              {/* Tooltip on hover (Mac-style pill above icon with 150ms ease) */}
              {!alwaysShowLabels && (
                <div
                  className={`unlumen-dock-tooltip ${isHovered ? 'is-visible' : ''}`}
                  role="tooltip"
                  aria-hidden={!isHovered}
                >
                  {item.label}
                </div>
              )}

              {/* Icon Content (Emoji, Lucide SVG, or custom React node) */}
              <div className="unlumen-dock-icon-inner">
                {typeof item.icon === 'string' ? (
                  <span style={{ fontSize: `${Math.round(iconSize * 0.52)}px`, lineHeight: 1 }}>
                    {item.icon}
                  </span>
                ) : (
                  item.icon
                )}
              </div>

              {/* Label beneath icon (when alwaysShowLabels is true) */}
              {alwaysShowLabels && (
                <span className="unlumen-dock-bottom-label">
                  {item.label}
                </span>
              )}
            </Component>
          );
        })}
      </nav>
    </div>
  );
}

export default Dock;
