import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = ({ onToggleMenu }) => {
  const navigate = useNavigate();
  return (
    <header className="h-[96px] bg-[#000000] border-b border-white/5 flex items-center gap-5 px-8 md:px-16 sticky top-0 z-40">
      <button className="md:hidden w-11 h-11 border border-white/10 rounded-full flex items-center justify-center text-white" onClick={onToggleMenu}>
        <Menu size={22} />
      </button>
      <div className="flex-1">
        <h1 className="text-3xl font-normal text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Overview.</h1>
      </div>
      <button className="flex items-center gap-2.5 px-6 py-3 bg-white text-black hover:scale-[1.02] rounded-full text-sm font-medium transition-transform shadow-lg" style={{ fontFamily: "'Inter', sans-serif" }} onClick={() => navigate('/add-expense')}>
        <Plus size={18} strokeWidth={2} />
        <span>Add Expense</span>
      </button>
    </header>
  );
};
