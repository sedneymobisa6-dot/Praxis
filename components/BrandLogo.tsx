import React from 'react';

type BrandLogoProps = {
  layout?: 'vertical' | 'horizontal';
  // 'light' = for dark backgrounds, 'dark' = for light backgrounds
  variant?: 'light' | 'dark'; 
};

export default function BrandLogo({ 
  layout = 'vertical', 
  variant = 'dark' 
}: BrandLogoProps) {
  const isVertical = layout === 'vertical';
  const isLightText = variant === 'light';

  // Colors based on the background it sits on
  const textColor = isLightText ? '#F5F3EF' : '#000000';
  const shieldStroke = isLightText ? '#F5F3EF' : '#000000';
  
  return (
    <div className={`flex ${isVertical ? 'flex-col items-center' : 'flex-row items-center gap-3'}`}>
      
      {/* The Stark Shield */}
      <svg 
        width={isVertical ? '64' : '36'} 
        height={isVertical ? '64' : '36'} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M50 8 L88 25 V65 C88 85 50 95 50 95 C50 95 12 85 12 65 V25 Z" 
          fill="#000000" 
          stroke={shieldStroke} 
          strokeWidth="2.5"
        />
        <path 
          d="M35 72 V32 H62 C74 32 74 55 62 55 H45 V72 Z" 
          fill="#F5F3EF" 
        />
      </svg>

      {/* Text */}
      <div className={`flex flex-col ${isVertical ? 'items-center mt-4' : 'items-start'}`}>
        <span 
          className={`font-sans font-black tracking-[0.15em] ${isVertical ? 'text-2xl' : 'text-lg'}`}
          style={{ color: textColor }}
        >
          PRAXIS
        </span>
        <span 
          className={`font-sans font-bold tracking-[0.35em] text-[#D7263D] ${isVertical ? 'text-xs mt-1' : 'text-[9px] mt-0.5'}`}
        >
          LINDA DATA
        </span>
      </div>
      
    </div>
  );
}