import React from 'react';

interface GridPatternProps {
  className?: string;
  gridSize?: number;
  dotSize?: number;
}

export const GridPattern: React.FC<GridPatternProps> = ({
  className = '',
  gridSize = 24,
  dotSize = 1,
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 h-full w-full opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"
        style={{
          backgroundImage: `radial-gradient(#94a3b8 ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />
    </div>
  );
};
