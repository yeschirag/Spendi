import React from 'react';

export const StatCard = ({ color, title, value, icon, change, isPositive, changeText }) => {
  return (
    <div className="flex flex-col gap-2 md:gap-4 py-4 md:py-8 border-b border-white/5 transition-all group">
      <div className="flex items-center gap-2 md:gap-3">
        <div className={`text-white/40 group-hover:text-white transition-colors duration-500 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6`}>
          {icon}
        </div>
        <span className="text-xs md:text-sm font-medium text-white/50 tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>{title}</span>
      </div>
      <div>
        <span className="block text-3xl md:text-6xl text-white font-normal tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>{value}</span>
        {change && (
          <span className={`inline-block mt-2 md:mt-4 text-[10px] md:text-xs font-medium tracking-wide ${isPositive ? 'text-white/60' : 'text-white/60'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
            {change} {changeText}
          </span>
        )}
      </div>
    </div>
  );
};
