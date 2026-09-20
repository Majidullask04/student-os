import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 4,
  className = '',
}) => {
  return (
    <span
      className={`inline-block relative overflow-hidden bg-clip-text text-transparent font-extrabold ${className}`}
      style={{
        backgroundImage: 'linear-gradient(110deg, #4f46e5 20%, #9333ea 40%, #ffffff 50%, #9333ea 60%, #4f46e5 80%)',
        backgroundSize: '200% 100%',
        animation: disabled ? 'none' : `shinyText ${speed}s linear infinite`,
      }}
    >
      {text}
      <style>{`
        @keyframes shinyText {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </span>
  );
};
