import React from 'react';
import './dock.css';

/**
 * Premium Floating Dock Component (Part 2)
 *
 * Structure:
 *  - Outer wrapper: Fixed at bottom 0, full width, gradient background, pointer-events: none
 *  - Inner dock pill: Pointer-events: all, frosted glass, 28px radius, shadow
 *  - Each dock item: flex 1, column, 3px gap, 36x36 icon container, 9.5px label, 4px active pip dot
 */
export function Dock({
  items = [],
  className = '',
  style = {}
}) {
  return (
    <div className="nb-dock-wrapper" role="toolbar" aria-label="Application Navigation Dock">
      <nav
        className={`nb-dock-pill ${className}`.trim()}
        style={style}
      >
        {items.map((item, index) => {
          const isActive = Boolean(item.isActive);
          const Component = item.href ? 'a' : 'button';
          const commonProps = {
            className: `nb-dock-item ${isActive ? 'is-active' : ''} ${item.className || ''}`.trim(),
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
              {/* Icon Container (36x36px, 14px border-radius) */}
              <div className="nb-dock-icon-box" aria-hidden="true">
                {item.icon}
              </div>

              {/* Label (9.5px bold, letter-spacing 0.04em) */}
              <span className="nb-dock-label">
                {item.label}
              </span>

              {/* Active Pip Dot (4px circle, color --g, bottom 2px) */}
              <span className="nb-dock-pip" aria-hidden="true" />
            </Component>
          );
        })}
      </nav>
    </div>
  );
}

export default Dock;
