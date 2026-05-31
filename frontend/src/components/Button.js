import React from 'react';

function Button({ children, onClick, type = 'button', variant = 'primary', fullWidth = false }) {
  const baseStyle = {
    padding: '16px 32px',
    borderRadius: 'var(--rounded-xl)',
    fontWeight: '800',
    fontSize: '16px',
    cursor: 'pointer',
    border: 'none',
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'var(--font-family-display)',
    transition: 'opacity 0.2s',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-on-primary)',
    },
    secondary: {
      backgroundColor: 'var(--color-canvas)',
      color: 'var(--color-ink)',
      border: '2px solid var(--color-ink)',
    },
    danger: {
      backgroundColor: '#966995',
      color: '#ffffff',
    }
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      style={{ ...baseStyle, ...variants[variant] }}
      onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
    >
      {children}
    </button>
  );
}

export default Button;
