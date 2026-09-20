import React, { useEffect, useState, useRef } from 'react';

interface CountUpProps {
  to?: number;
  end?: number;
  from?: number;
  start?: number;
  duration?: number;
  delay?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  to,
  end,
  from,
  start,
  duration = 1.2,
  delay = 0,
  className = '',
  suffix = '',
  prefix = '',
}) => {
  const targetTo = to ?? end ?? 0;
  const initialFrom = from ?? start ?? 0;
  // Support both seconds (1.2) and milliseconds (1200)
  const durationInSeconds = duration > 10 ? duration / 1000 : duration;

  const [count, setCount] = useState(initialFrom);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const timeout = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (durationInSeconds * 1000), 1);
        
        // Ease-out cubic formula
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(initialFrom + (targetTo - initialFrom) * easeOutCubic);
        
        setCount(currentVal);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetTo, initialFrom, durationInSeconds, delay]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
};
