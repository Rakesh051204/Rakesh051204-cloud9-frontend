import React from "react";

export default function SoundWaveIcon({ size = 16, color = "#F2F2F0" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 8 C26 8 8 24 8 44 C8 60 19 73 35 78 L32 92 L52 79 C74 77 92 62 92 44 C92 24 74 8 50 8 Z"
        fill="none"
        stroke={color}
        strokeWidth="6"
      />
      <circle cx="4" cy="44" r="4" fill={color} />
      <circle cx="96" cy="44" r="4" fill={color} />
      <path d="M28 44 Q32 28 36 44 T44 44" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <path d="M40 44 Q44 20 48 44 T56 44" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <path d="M52 44 Q56 30 60 44 T68 44" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <path d="M64 44 Q68 34 72 44 T80 44" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}