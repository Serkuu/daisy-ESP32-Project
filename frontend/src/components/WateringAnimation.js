import React, { useEffect, useState, useRef } from 'react';
import './WateringAnimation.css';

function WateringAnimation({ isWatering }) {
  const containerRef = useRef(null);
  const [drops, setDrops] = useState([]);
  const [containerWidth, setContainerWidth] = useState(1000);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [isWatering]);

  useEffect(() => {
    if (!isWatering) {
      setDrops([]);
      return;
    }

    let animationFrameId;
    let startTime = Date.now();
    let dropId = 0;

    const loop = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      if (elapsed > 0.75 && elapsed < 1.75) {
        if (Math.random() > 0.3) {
          if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            const progress = (elapsed - 0.75) / 1.0;

            const transformX = (width * 0.35) + progress * (width * 0.30);

            const spoutX = -200 + transformX + 190;
            const spoutY = containerRef.current.offsetHeight * 0.15 + 140;

            const newDrop = {
              id: dropId++,
              x: spoutX + (Math.random() * 20 - 10),
              y: spoutY + (Math.random() * 20 - 10),
              dx: Math.random() * 40 - 20,
              dy: 100 + Math.random() * 60
            };

            setDrops(prev => [...prev.slice(-25), newDrop]);
          }
        }
      }

      if (elapsed < 2.6) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isWatering]);

  if (!isWatering) return null;

  return (
    <div
      ref={containerRef}
      className="watering-anim-container"
      style={{ '--container-w': `${containerWidth}px` }}
    >
      <div className="watering-can animate">
        <svg viewBox="0 0 230 150" width="100%" height="100%">
          <path d="M 60 50 C 20 40, 20 120, 55 110" fill="none" stroke="#60A5FA" strokeWidth="12" strokeLinecap="round" />
          <path d="M 60 40 L 140 40 L 150 130 L 50 130 Z" fill="#93C5FD" stroke="#3B82F6" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 145 100 L 190 50 L 180 40 L 135 80 Z" fill="#93C5FD" stroke="#3B82F6" strokeWidth="4" strokeLinejoin="round" />
          <polygon points="0,-7 0,7 20,18 20,-18" fill="#FCD34D" stroke="#D97706" strokeWidth="2" strokeLinejoin="round" transform="translate(185, 45) rotate(-45)" />

          <circle cx="85" cy="80" r="6" fill="#1E3A8A" />
          <circle cx="115" cy="80" r="6" fill="#1E3A8A" />
          <path d="M 92 95 Q 100 105 108 95" fill="none" stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="75" cy="85" rx="5" ry="3" fill="#FCA5A5" opacity="0.8" />
          <ellipse cx="125" cy="85" rx="5" ry="3" fill="#FCA5A5" opacity="0.8" />
        </svg>
      </div>

      {drops.map(drop => (
        <div
          key={drop.id}
          className="water-drop animate"
          style={{
            left: `${drop.x}px`,
            top: `${drop.y}px`,
            '--drop-dx': `${drop.dx}px`,
            '--drop-dy': `${drop.dy}px`
          }}
        />
      ))}
    </div>
  );
}

export default WateringAnimation;
