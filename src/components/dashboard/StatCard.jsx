import React from 'react';

export const StatCard = ({ color, title, value, icon, change, isPositive, changeText }) => {
  return (
    <div className="flex flex-col gap-4 py-8 border-b border-white/5 transition-all group">
      <div className="flex items-center gap-3">
        <div className={`text-white/40 group-hover:text-white transition-colors duration-500`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-white/50 tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>{title}</span>
      </div>
      <div>
        <span className="block text-5xl md:text-6xl text-white font-normal tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>{value}</span>
        {change && (
          <span className={`inline-block mt-4 text-xs font-medium tracking-wide ${isPositive ? 'text-white/60' : 'text-white/60'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
            {change} {changeText}
          </span>
        )}
      </div>
    </div>
  );
};
