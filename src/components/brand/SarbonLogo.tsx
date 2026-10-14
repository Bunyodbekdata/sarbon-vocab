import React from 'react';

interface SarbonLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
  className?: string;
}

export const SarbonLogo: React.FC<SarbonLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 32,
    md: 42,
    lg: 54,
    hero: 76,
  }[size];

  return (
    <div className={`sarbon-brand-wrap ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Radiant Gold Emblem SVG */}
      <svg
        width={iconDimensions}
        height={iconDimensions}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(201, 164, 76, 0.45))' }}
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5E4B2" />
            <stop offset="35%" stopColor="#C9A44C" />
            <stop offset="70%" stopColor="#E7CB82" />
            <stop offset="100%" stopColor="#8A7433" />
          </linearGradient>
          <linearGradient id="innerDeepNavy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#152A40" />
            <stop offset="100%" stopColor="#0A1422" />
          </linearGradient>
          <radialGradient id="sealGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE8A3" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#C9A44C" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer 12-point radiant gold seal star */}
        <polygon
          points="50,2 62,14 78,8 84,24 98,28 92,44 100,58 88,68 90,84 74,86 66,100 50,92 34,100 26,86 10,84 12,68 0,58 8,44 2,28 16,24 22,8 38,14"
          fill="url(#goldGradient)"
          opacity="0.95"
        />

        {/* Outer ring */}
        <circle cx="50" cy="50" r="42" fill="url(#innerDeepNavy)" stroke="url(#goldGradient)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(201, 164, 76, 0.4)" strokeWidth="1" strokeDasharray="2,3" />

        {/* Open Book Wings & Quill */}
        <path
          d="M26 62C34 58 42 58 50 62C58 58 66 58 74 62V40C66 36 58 36 50 40C42 36 34 36 26 40V62Z"
          fill="rgba(201, 164, 76, 0.18)"
          stroke="url(#goldGradient)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <line x1="50" y1="40" x2="50" y2="62" stroke="url(#goldGradient)" strokeWidth="1.8" />

        {/* Majestic Monogram "S" for Sarbon */}
        <path
          d="M54 30C53 28.5 51.5 27.5 49 27.5C46.5 27.5 44.5 28.8 44.5 31C44.5 33.2 46.5 34.3 49.5 35.5C53.5 37 56 39 56 42.5C56 46.5 52.5 49 48 49C44.5 49 42 47.5 41 45.2"
          stroke="url(#goldGradient)"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Radiant Stars */}
        <circle cx="50" cy="22" r="2" fill="#FFE8A3" />
        <circle cx="34" cy="27" r="1.5" fill="#C9A44C" />
        <circle cx="66" cy="27" r="1.5" fill="#C9A44C" />
      </svg>

      {/* Brand Typography */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontFamily: "Cambria, Georgia, 'Playfair Display', serif",
            fontWeight: 800,
            fontSize: size === 'sm' ? '18px' : size === 'md' ? '22px' : size === 'lg' ? '28px' : '36px',
            letterSpacing: '0.8px',
            lineHeight: 1.15,
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>SARBON</span>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-ui)',
              padding: '2px 7px',
              borderRadius: '99px',
              background: 'linear-gradient(135deg, rgba(201,164,76,0.25), rgba(231,203,130,0.15))',
              border: '1px solid var(--border)',
              color: 'var(--gold-light)',
              letterSpacing: '0.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            IELTS & Vocab
          </span>
        </div>
        {showSubtitle && (
          <div
            style={{
              fontSize: size === 'sm' ? '11px' : '12.5px',
              color: 'var(--text-muted)',
              letterSpacing: '0.3px',
              fontFamily: 'var(--font-ui)',
            }}
          >
            Sarbon O'quv Markazi · Boburbek Ravshanov
          </div>
        )}
      </div>
    </div>
  );
};
