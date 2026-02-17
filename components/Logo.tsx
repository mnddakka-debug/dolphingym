
import React from 'react';
import { Dumbbell } from 'lucide-react';

interface LogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 64, className = "", glow = true }) => {
  return (
    <div className={`relative flex items-center justify-center ${glow ? 'blue-glow' : ''} ${className}`} style={{ width: size, height: size }}>
      {/* Outer Shield Container */}
      <div className="absolute inset-0 bg-[#1e293b] border-2 border-[#3b82f6]/50 shadow-inner shield-shape" />
      
      {/* Dark Inner Shield */}
      <div className="absolute inset-1.5 bg-black border border-[#1e293b] shield-shape flex items-center justify-center overflow-hidden">
        {/* Stylized Electric Highlights */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#3b82f6]/20 to-transparent" />
        
        {/* Muscular Dolphin Silhouette Representation */}
        <div className="relative z-10 flex flex-col items-center justify-center">
           {/* Dolphin Head/Torso Silhouette */}
           <svg 
            width={size * 0.6} 
            height={size * 0.6} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="text-[#60a5fa] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
          >
            {/* Mascot Head */}
            <path 
              d="M20 12C20 12 18 7 14 7C11 7 9.5 9 8 9.5C6.5 10 4 9 2 9C0 9 -1 10.5 -1 10.5C-1 10.5 0.5 10 2 10C4 10 6 11.5 8.5 11.5C11 11.5 13.5 9.5 16 9.5C18.5 9.5 20 10.5 20 10.5Z" 
              fill="currentColor" 
              transform="scale(1.2) translate(-2, 2)"
            />
            {/* Muscular Back Path */}
            <path 
              d="M17.5 7.5C16.5 6 14 4 10 4C6.5 4 4 6 3 8C2.5 9 2 11 2 11C2 11 3.5 10.5 5 10.5C7 10.5 8.5 11.5 10.5 11.5C12.5 11.5 15 10.5 17 10.5C18.5 10.5 19.5 11 19.5 11C19.5 11 19 9.5 17.5 7.5Z" 
              fill="currentColor" 
              transform="scale(1.2) translate(-2, 2)"
            />
          </svg>
          
          {/* Barbell Accent beneath the silhouette */}
          <div className="absolute -bottom-1 flex items-center gap-1 opacity-80">
            <div className="w-4 h-1.5 bg-gray-400 rounded-sm"></div>
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-4 h-1.5 bg-gray-400 rounded-sm"></div>
          </div>
        </div>
      </div>
      
      {/* Brand Text Banner Overlay (Optional - usually better in parent but here for mascot completeness) */}
      <div className="absolute -bottom-2 w-[110%] bg-black border border-[#3b82f6]/30 py-0.5 rounded-sm flex items-center justify-center shadow-lg">
        <span className="text-[7px] font-black text-white tracking-[0.2em]">DOLPHIN GYM</span>
      </div>
    </div>
  );
};

export default Logo;
