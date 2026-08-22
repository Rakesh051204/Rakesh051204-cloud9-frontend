import { useState } from 'react';

export default function StoicLogo({ size = 32, onClick, className = '' }) {
  const [spinning, setSpinning] = useState(false);
  const circles = [
    { r: 48, dx: 0, color: 'white' },
    { r: 38, dx: 9, color: 'black' },
    { r: 29, dx: 15, color: 'white' },
    { r: 21, dx: 20, color: 'black' },
    { r: 14, dx: 24, color: 'white' },
    { r: 8, dx: 27, color: 'black' },
    { r: 4, dx: 29, color: 'white' },
  ];

  const handleClick = () => {
    if (!onClick) return;
    setSpinning(true);
    onClick();
    setTimeout(() => setSpinning(false), 600);
  };

  const baseClass = 'flex-shrink-0';
  const interactiveClass = onClick ? 'cursor-pointer transition-transform duration-500 ease-out hover:scale-110' : '';
  const clickSpinClass = spinning ? 'animate-spin-once' : '';
  const combinedClass = [baseClass, interactiveClass, clickSpinClass, className].filter(Boolean).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={combinedClass}
      onClick={onClick ? handleClick : undefined}
    >
      <defs>
        <clipPath id="stoic-clip">
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <g clipPath="url(#stoic-clip)">
        <rect x="0" y="0" width="100" height="100" fill="black" />
        {circles.map((c, idx) => (
          <circle key={idx} cx={50 + c.dx} cy="50" r={c.r} fill={c.color} />
        ))}
      </g>
    </svg>
  );
}