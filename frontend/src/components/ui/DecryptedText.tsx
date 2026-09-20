import React, { useEffect, useState, useRef } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  characters?: string;
  className?: string;
  parentClassName?: string;
  animateOn?: 'view' | 'hover';
}

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 40,
  maxIterations = 10,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~',
  className = '',
  parentClassName = '',
  animateOn = 'view',
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let iteration = 0;
    let interval: any = null;

    const startDecryption = () => {
      iteration = 0;
      clearInterval(interval);

      interval = setInterval(() => {
        setDisplayText(() =>
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iteration) {
                return text[index];
              }
              return characters[Math.floor(Math.random() * characters.length)];
            })
            .join('')
        );

        if (iteration >= text.length) {
          clearInterval(interval);
        }

        iteration += 1 / maxIterations;
      }, speed);
    };

    if (animateOn === 'view' && !hasAnimated) {
      startDecryption();
      setHasAnimated(true);
    } else if (animateOn === 'hover' && isHovered) {
      startDecryption();
    }

    return () => clearInterval(interval);
  }, [text, speed, maxIterations, characters, animateOn, isHovered, hasAnimated]);

  return (
    <span
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`inline-block font-mono ${parentClassName}`}
    >
      <span className={className}>{displayText}</span>
    </span>
  );
};
