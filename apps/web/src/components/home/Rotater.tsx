'use client';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export function Rotater({
  names,
  cellClassName,
  className,
}: {
  names: string[];
  cellClassName?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotaterIndex, setRotaterIndex] = useState(-1);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setRotaterIndex((prevIndex) =>
          prevIndex == names.length - 1 ? -1 : prevIndex + 1,
        );
      },
      rotaterIndex == names.length - 1 ? 500 : 3000,
    );
    return () => clearInterval(interval);
  }, [names.length, rotaterIndex]);
  console.log(rotaterIndex);
  return (
    <div ref={containerRef} className={cn('h-24 overflow-hidden', className)}>
      <div
        className={rotaterIndex == -1 ? '' : 'transition-all duration-500 '}
        style={{
          transform: `translateY(${-((rotaterIndex == -1 ? 0 : rotaterIndex + 1) * (containerRef.current?.offsetHeight || 0))}px)`,
        }}
      >
        <div
          key={'last'}
          className={cn(cellClassName)}
          style={{
            width: containerRef.current?.offsetWidth,
            height: containerRef.current?.offsetHeight,
          }}
        >
          {names[names.length - 1]}
        </div>
        {names.map((name, index) => (
          <div
            key={index}
            className={cn(cellClassName)}
            style={{
              width: containerRef.current?.offsetWidth,
              height: containerRef.current?.offsetHeight,
            }}
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
