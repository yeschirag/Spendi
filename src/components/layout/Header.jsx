import React from 'react';
import { Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onToggleMenu }) => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <header className="h-[96px] bg-[#000000] border-b border-white/5 flex items-center gap-5 px-6 md:px-16 sticky top-0 z-40">
      <div className="flex-1">
        <h1 className="text-3xl font-normal text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Overview.</h1>
      </div>
      
      {/* Desktop Add Expense */}
      <button className="hidden md:flex items-center gap-2.5 px-6 py-3 bg-white text-black hover:scale-[1.02] rounded-full text-sm font-medium transition-transform shadow-lg" style={{ fontFamily: "'Inter', sans-serif" }} onClick={() => navigate('/add-expense')}>
        <Plus size={18} strokeWidth={2} />
        <span>Add Expense</span>
      </button>

      {/* Profile/Settings Button */}
      <button onClick={() => navigate('/profile')} className="w-11 h-11 border border-white/10 rounded-full flex items-center justify-center text-white overflow-hidden bg-white/5 transition-transform hover:scale-105">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <User size={20} className="text-white/70" />
        )}
      </button>
    </header>
  );
};
