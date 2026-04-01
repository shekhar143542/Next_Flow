import { FC } from 'react';
import { PAN_TRANSITION } from '../constants';

const stars = Array.from({ length: 130 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.4 + 0.3,
  opacity: Math.random() * 0.35 + 0.05,
}));

export interface StarFieldProps {
  offset?: { x: number; y: number };
}

export const StarField: FC<StarFieldProps> = ({ offset }) => (
  <div style={{
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    transform: offset ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
    transition: offset ? PAN_TRANSITION : undefined,
  }}>
    {stars.map((s) => (
      <div key={s.id} style={{
        position: 'absolute',
        left: `${s.x}%`,
        top: `${s.y}%`,
        width: `${s.size}px`,
        height: `${s.size}px`,
        borderRadius: '50%',
        background: 'white',
        opacity: s.opacity,
      }} />
    ))}
  </div>
);
