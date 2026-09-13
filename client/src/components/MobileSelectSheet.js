import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Search } from 'lucide-react';

/**
 * MobileSelectSheet - Premium, touch-native bottom sheet / modal dropdown picker.
 * Replaces cumbersome native <select> elements across mobile viewports.
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - title: string
 * - subtitle?: string
 * - options: Array<{ value: string, label: string, subtitle?: string, badge?: string }> | string[]
 * - value: string
 * - onChange: (value: string) => void
 * - searchable?: boolean
 */
export default function MobileSelectSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  options = [],
  value,
  onChange,
  searchable
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Normalize options to object shape
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const isSearchEnabled = searchable !== undefined 
    ? searchable 
    : normalizedOptions.length > 7;

  // Filter options by search query
  const filteredOptions = normalizedOptions.filter(opt => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (opt.label && opt.label.toLowerCase().includes(q)) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(q)) ||
      (opt.value && opt.value.toLowerCase().includes(q))
    );
  });

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Reset search query when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (val) => {
    onChange(val);
    onClose();
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1a1e2a',
          borderTop: '0.5px solid var(--border-default)',
          borderLeft: '0.5px solid var(--border-default)',
          borderRight: '0.5px solid var(--border-default)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          width: '100%',
          maxWidth: 520,
          maxHeight: '86vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -20px 50px rgba(0, 0, 0, 0.8)',
          animation: 'slideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box'
        }}
      >
        {/* Drag handle: 36px wide, 4px tall, rgba(255,255,255,0.2), centered, 8px top margin */}
        <div style={{ paddingTop: 8, paddingBottom: 6, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 36,
            height: 4,
            borderRadius: 99,
            background: 'rgba(255, 255, 255, 0.2)'
          }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '8px 20px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '0.5px solid var(--border-default)'
        }}>
          <div>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--color-green)'
            }}>
              Select option
            </span>
            <h3 style={{
              margin: '2px 0 0',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text-primary)'
            }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--color-raised)',
              border: '0.5px solid var(--border-default)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Optional Search Input */}
        {isSearchEnabled && (
          <div style={{ padding: '12px 20px 6px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-input)',
              border: '0.5px solid var(--border-default)',
              borderRadius: 12,
              padding: '8px 12px'
            }}>
              <Search size={15} color="var(--text-muted)" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search ${title}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 13.5
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 2
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Options List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}>
          {filteredOptions.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 13, margin: 0 }}>No matching options found</p>
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = String(value) === String(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '14px 16px',
                    minHeight: 48,
                    borderRadius: 12,
                    border: isSelected
                      ? '1px solid rgba(34, 209, 122, 0.3)'
                      : '0.5px solid rgba(255, 255, 255, 0.05)',
                    background: isSelected
                      ? 'rgba(34, 209, 122, 0.08)'
                      : '#141820',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? 'var(--color-green)' : 'var(--text-primary)'
                    }}>
                      {opt.label}
                    </div>
                    {opt.subtitle && (
                      <div style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        marginTop: 2
                      }}>
                        {opt.subtitle}
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <Check size={20} color="var(--color-green)" strokeWidth={2.5} />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px 4px',
          borderTop: '0.5px solid var(--border-default)',
          display: 'flex',
          gap: 10
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 13.5,
              fontWeight: 800,
              borderRadius: 12
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export { MobileSelectSheet };
