import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Plus, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const BottomNav = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
      <div className="relative flex items-center justify-between px-6 py-4 bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/80 pointer-events-auto max-w-sm mx-auto">
        
        {/* Dashboard */}
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-10 transition-colors ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`
          }
        >
          <Home size={22} strokeWidth={2} />
        </NavLink>

        {/* Network / Friends */}
        <NavLink 
          to="/friends" 
          className={({ isActive }) => 
            `tour-network flex flex-col items-center justify-center w-10 transition-colors ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`
          }
        >
          <Users size={22} strokeWidth={2} />
        </NavLink>

        {/* Add Expense */}
        <button
          onClick={() => navigate('/add-expense')}
          className="tour-add-expense flex items-center justify-center w-12 h-12 bg-white text-black rounded-full hover:scale-105 transition-transform shadow-lg mx-2"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>

        {/* Groups */}
        <NavLink 
          to="/groups" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-10 transition-colors ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/><path d="M8 10h8"/><path d="M8 14h8"/></svg>
        </NavLink>

        {/* History */}
        <NavLink 
          to="/history" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-10 transition-colors ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`
          }
        >
          <Clock size={22} strokeWidth={2} />
        </NavLink>



      </div>
    </div>
  );
};
