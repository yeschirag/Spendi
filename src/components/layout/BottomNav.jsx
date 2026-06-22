import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Plus, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const getLinkClass = (isActive) => {
    return `flex flex-col items-center justify-center transition-all duration-150 ${
      isActive 
        ? 'text-[var(--color-accent)] bg-[var(--color-accent-muted)] rounded-xl px-4 py-2 scale-[1.05]' 
        : 'text-[var(--color-text-muted)] hover:text-white/80 p-2'
    }`;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
      <div
        className="pointer-events-auto max-w-sm mx-auto flex items-center justify-between px-6 h-[64px] rounded-full"
        style={{
          backdropFilter: 'blur(24px) saturate(180%) brightness(0.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%) brightness(0.8)',
          background: 'rgba(14, 14, 18, 0.72)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        {/* Dashboard */}
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => getLinkClass(isActive)}
        >
          <Home size={22} strokeWidth={2} />
        </NavLink>

        {/* Friends */}
        <NavLink 
          to="/friends" 
          className={({ isActive }) => getLinkClass(isActive)}
        >
          <Users size={22} strokeWidth={2} />
        </NavLink>

        {/* Add Expense FAB */}
        <button
          onClick={() => navigate('/add-expense')}
          className="tour-add-expense flex items-center justify-center w-12 h-12 bg-[var(--color-accent)] text-white rounded-full hover:scale-105 active:scale-95 transition-transform shadow-[var(--shadow-float)] mx-2 shrink-0"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>

        {/* Groups */}
        <NavLink 
          to="/groups" 
          className={({ isActive }) => getLinkClass(isActive)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/>
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
            <path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/>
            <path d="M8 10h8"/><path d="M8 14h8"/>
          </svg>
        </NavLink>

        {/* History */}
        <NavLink 
          to="/history" 
          className={({ isActive }) => getLinkClass(isActive)}
        >
          <Clock size={22} strokeWidth={2} />
        </NavLink>
      </div>
    </div>
  );
};
