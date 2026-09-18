import * as React from "react";

export function HyperlocalLogo({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={className}
      aria-label="Hello Hyperlocal"
    >
      <defs>
        <linearGradient id="hh-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7ED957" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#1C472A" />
        </linearGradient>
        <filter id="hh-logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#7ED957" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#hh-logo-glow)">
        <path
          fill="url(#hh-brand-grad)"
          d="M2.178 12.427C.158 5.905-.85 2.644.897.897 2.644-.85 5.905.159 12.427 2.177l50.984 15.781a24.58 24.58 0 0116.213 16.213L100 100 34.17 79.624a24.58 24.58 0 01-16.213-16.213L2.178 12.427z"
        />
        <path
          fill="url(#hh-brand-grad)"
          d="M100.002 100l65.826 20.375a24.578 24.578 0 0116.213 16.213l15.781 50.984c2.019 6.522 3.028 9.783 1.281 11.53-1.748 1.748-5.009.738-11.53-1.28l-50.984-15.781a24.58 24.58 0 01-16.213-16.213l-20.375-65.827-20.375 65.828a24.582 24.582 0 01-16.213 16.213l-50.984 15.78c-6.522 2.019-9.783 3.028-11.53 1.281-1.748-1.747-.739-5.008 1.28-11.53l15.78-50.984a24.58 24.58 0 0116.214-16.213L100 100l20.376-65.828a24.58 24.58 0 0116.213-16.213l50.984-15.78c6.522-2.02 9.783-3.029 11.53-1.281 1.747 1.747.738 5.008-1.281 11.53l-15.78 50.984a24.582 24.582 0 01-16.213 16.213L100.002 100z"
        />
      </g>
    </svg>
  );
}
