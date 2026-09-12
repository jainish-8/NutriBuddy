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
          background: 'var(--bg-surface, #0F172A)',
          borderTop: '1px solid var(--border-focus, rgba(16, 185, 129, 0.4))',
          borderLeft: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRight: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          width: '100%',
          maxWidth: 520,
          maxHeight: '86vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.12)',
          animation: 'slideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box'
        }}
      >
        {/* Grab Handle */}
        <div style={{ padding: '12px 0 6px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 44,
            height: 4.5,
            borderRadius: 9999,
            background: 'var(--text-muted, rgba(255, 255, 255, 0.2))'
          }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '8px 20px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))'
        }}>
          <div>
            <span style={{
              fontSize: 10.5,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--brand-primary-light, #10B981)'
            }}>
              SELECT OPTION
            </span>
            <h3 style={{
              margin: '2px 0 0',
              fontSize: 18,
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary, #FFFFFF)'
            }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted, #94A3B8)' }}>
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-raised, rgba(255, 255, 255, 0.06))',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted, #94A3B8)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Optional Search Input */}
        {isSearchEnabled && (
          <div style={{ padding: '12px 20px 6px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-surface-raised, rgba(255, 255, 255, 0.04))',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
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
                  color: 'var(--text-primary, #FFFFFF)',
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
          padding: '10px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
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
                    padding: '13px 16px',
                    minHeight: 48,
                    borderRadius: 14,
                    border: isSelected
                      ? '1.5px solid var(--brand-primary, #10B981)'
                      : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))',
                    background: isSelected
                      ? 'var(--brand-primary-subtle, rgba(16, 185, 129, 0.14))'
                      : 'var(--bg-surface-raised, rgba(255, 255, 255, 0.03))',
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
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? 'var(--brand-primary-light, #34D399)' : 'var(--text-primary, #FFFFFF)'
                    }}>
                      {opt.label}
                    </div>
                    {opt.subtitle && (
                      <div style={{
                        fontSize: 11.5,
                        color: 'var(--text-muted, #94A3B8)',
                        marginTop: 2
                      }}>
                        {opt.subtitle}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {opt.badge && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 9999,
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-muted)'
                      }}>
                        {opt.badge}
                      </span>
                    )}
                    {isSelected ? (
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'var(--brand-primary, #10B981)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    ) : (
                      <div style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: '1.5px solid var(--border-subtle, rgba(255, 255, 255, 0.15))'
                      }} />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px 4px',
          borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
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
