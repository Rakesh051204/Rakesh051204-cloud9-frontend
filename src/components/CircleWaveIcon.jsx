import React from "react";

export default function CircleWaveIcon({ size = 22, color = "#0F0F0E" }) {
  const bars = [4, 8, 13, 17, 13, 8, 4];
  const barWidth = 2.1;
  const gap = 1.5;
  const totalWidth = bars.length * barWidth + (bars.length - 1) * gap;
  const startX = -totalWidth / 2;
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="0" cy="0" r="10.5" stroke={color} strokeWidth="2.2" fill="none" />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={startX + i * (barWidth + gap)}
          y={-h / 2}
          width={barWidth}
          height={h}
          rx={barWidth / 2}
          fill={color}
        />
      ))}
    </svg>
  );
}