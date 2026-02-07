import { request } from 'http';
import { useEffect, useRef, useState } from 'react';

export function MarqueeWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overflowAmount, setOverflowAmount] = useState(0);

  // Check if content overflows container
  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const { scrollWidth, clientWidth } = containerRef.current;

          if (scrollWidth > clientWidth) {
            setOverflowAmount(scrollWidth - clientWidth + 2);
          } else {
            setOverflowAmount(0);
          }
        });
      }
    };

    checkOverflow();
    // Re-check on window resize
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [children]);

  // If overflowing, apply marquee animation; otherwise, show content normally
  return (
    <div
      ref={containerRef}
      className={`${overflowAmount > 0 ? 'mask-fade' : ''} overflow-hidden w-full whitespace-nowrap`}
      style={
        { '--overflow-distance': `${overflowAmount}px` } as React.CSSProperties
      }
    >
      <div
        className={`inline-block ${overflowAmount > 0 ? 'animate-marquee-alternate' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
