// SVG Background — Falling Jewelry Animation
import React from 'react';

// Individual jewelry SVG shapes
const Diamond = ({ x, delay, dur, size }: { x: number; delay: number; dur: number; size: number }) => (
  <g opacity="0.07">
    <animateTransform
      attributeName="transform"
      type="translate"
      values={`${x},-${size};${x + 20},${window.innerHeight + size}`}
      dur={`${dur}s`}
      begin={`${delay}s`}
      repeatCount="indefinite"
    />
    <polygon
      points={`0,-${size} ${size * 0.6},0 0,${size} -${size * 0.6},0`}
      fill="none"
      stroke="#c9a84c"
      strokeWidth="0.5"
    />
    <line x1="0" y1={`-${size}`} x2="0" y2={`${size}`} stroke="#c9a84c" strokeWidth="0.3" />
  </g>
);

const Ring = ({ x, delay, dur, size }: { x: number; delay: number; dur: number; size: number }) => (
  <g opacity="0.05">
    <animateTransform
      attributeName="transform"
      type="translate"
      values={`${x},-${size};${x - 15},${window.innerHeight + size}`}
      dur={`${dur}s`}
      begin={`${delay}s`}
      repeatCount="indefinite"
    />
    <circle cx="0" cy="0" r={size} fill="none" stroke="#c9a84c" strokeWidth="0.6" />
    <circle cx="0" cy={`-${size}`} r={size * 0.2} fill="none" stroke="#fff" strokeWidth="0.4" />
  </g>
);

const Chain = ({ x, delay, dur }: { x: number; delay: number; dur: number }) => (
  <g opacity="0.04">
    <animateTransform
      attributeName="transform"
      type="translate"
      values={`${x},-30;${x + 10},${window.innerHeight + 30}`}
      dur={`${dur}s`}
      begin={`${delay}s`}
      repeatCount="indefinite"
    />
    {[0, 8, 16, 24, 32].map((y) => (
      <ellipse key={y} cx="0" cy={y} rx="3" ry="4" fill="none" stroke="#c9a84c" strokeWidth="0.4" />
    ))}
  </g>
);

const Gem = ({ x, delay, dur, size }: { x: number; delay: number; dur: number; size: number }) => (
  <g opacity="0.06">
    <animateTransform
      attributeName="transform"
      type="translate"
      values={`${x},-${size};${x - 10},${window.innerHeight + size}`}
      dur={`${dur}s`}
      begin={`${delay}s`}
      repeatCount="indefinite"
    />
    <polygon
      points={`0,-${size} ${size},-${size * 0.3} ${size * 0.7},${size} -${size * 0.7},${size} -${size},${-size * 0.3}`}
      fill="none"
      stroke="#af52de"
      strokeWidth="0.5"
    />
  </g>
);

// Generate random items
function genItems() {
  const items: React.ReactNode[] = [];
  const w = typeof window !== 'undefined' ? window.innerWidth : 1400;
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * w;
    const delay = Math.random() * 15;
    const dur = 18 + Math.random() * 25;
    const size = 8 + Math.random() * 14;
    const type = i % 4;
    if (type === 0) items.push(<Diamond key={`d${i}`} x={x} delay={delay} dur={dur} size={size} />);
    else if (type === 1) items.push(<Ring key={`r${i}`} x={x} delay={delay} dur={dur} size={size} />);
    else if (type === 2) items.push(<Chain key={`c${i}`} x={x} delay={delay} dur={dur} />);
    else items.push(<Gem key={`g${i}`} x={x} delay={delay} dur={dur} size={size} />);
  }
  return items;
}

export const FallingJewelry: React.FC = () => {
  const items = React.useMemo(() => genItems(), []);
  return (
    <div className="svgBgContainer">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {items}
      </svg>
    </div>
  );
};
