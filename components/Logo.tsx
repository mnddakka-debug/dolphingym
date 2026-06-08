import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 64, className = "", glow = true }) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl overflow-hidden ${glow ? 'blue-glow' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Dolphin Gym Logo" className="w-full h-full object-contain" />
    </div>
  );
};

export default Logo;
