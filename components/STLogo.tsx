'use client';

import React from 'react';

interface STLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export function STLogo({ className = '', size = 44, glow = true }: STLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-orange-600/30 via-amber-500/20 to-blue-600/30 blur-md pointer-events-none"
        />
      )}
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="relative z-10 select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="stBorderGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="35%" stopColor="#EA580C" />
            <stop offset="65%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          <linearGradient id="stTextGradComp" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="30%" stopColor="#F97316" />
            <stop offset="55%" stopColor="#3B82F6" />
            <stop offset="85%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          <filter id="stShadowComp" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Regular Octagon Outer Shape */}
        <polygon
          points="58.5,8 141.5,8 192,58.5 192,141.5 141.5,192 58.5,192 8,141.5 8,58.5"
          fill="#0F172A"
          stroke="url(#stBorderGradComp)"
          strokeWidth="7"
          strokeLinejoin="round"
          filter="url(#stShadowComp)"
        />

        {/* Inner Octagon Thin Accent Line */}
        <polygon
          points="62,17 138,17 183,62 183,138 138,183 62,183 17,138 17,62"
          fill="none"
          stroke="url(#stBorderGradComp)"
          strokeWidth="1.8"
          strokeOpacity="0.6"
          strokeLinejoin="round"
        />

        {/* Centered Serif ST Logotype matching the uploaded logo */}
        <text
          x="100"
          y="132"
          textAnchor="middle"
          fontFamily="'Playfair Display', 'Times New Roman', 'Georgia', serif"
          fontSize="94"
          fontWeight="900"
          letterSpacing="-3"
          fill="url(#stTextGradComp)"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          ST
        </text>
      </svg>
    </div>
  );
}
