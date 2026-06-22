import React from 'react';

/**
 * Apple-style liquid glass button.
 * Does NOT override background color — set that via className (e.g. bg-black text-white).
 * Only adds: backdrop-blur, inset highlight, border rim, and smooth press animation.
 */
export const GlassButton = ({ children, onClick, className = '', style = {}, type = 'button', disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={className}
    style={{
      fontFamily: "var(--font-body)",
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
      boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.14), 0 2px 12px rgba(0,0,0,0.18)',
      border: '1px solid rgba(255,255,255,0.20)',
      transition: 'transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease',
      ...style,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'scale(1.025)';
      e.currentTarget.style.boxShadow = 'inset 0 1.5px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.22)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = 'inset 0 1.5px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.14), 0 2px 12px rgba(0,0,0,0.18)';
    }}
    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.025)'; }}
  >
    {children}
  </button>
);

export default GlassButton;
