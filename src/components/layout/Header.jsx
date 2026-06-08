import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = ({ onToggleMenu }) => {
  const navigate = useNavigate();

  return (
    <header className="h-[96px] bg-[#000000] border-b border-white/5 flex items-center gap-5 px-6 md:px-16 sticky top-0 z-40">
      <div className="flex-1">
        <h1 className="text-3xl font-normal text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Overview.</h1>
      </div>
      
      {/* Desktop Add Expense */}
      <div className="flex items-center gap-4">
        <button className="hidden md:flex items-center gap-2.5 px-6 py-3 bg-white text-black hover:scale-[1.02] rounded-full text-sm font-medium transition-transform shadow-lg" style={{ fontFamily: "'Inter', sans-serif" }} onClick={() => navigate('/add-expense')}>
          <Plus size={18} strokeWidth={2} />
          <span>Add Expense</span>
        </button>
        
        {/* Mobile Profile Link */}
        <button onClick={() => navigate('/profile')} className="md:hidden w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white/10 border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>
    </header>
  );
};
