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
            `flex flex-col items-center justify-center w-12 transition-colors ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`
          }
        >
          <Home size={22} strokeWidth={2} />
        </NavLink>

        {/* Network / Friends */}
        <NavLink 
          to="/friends" 
          className={({ isActive }) => 
            `tour-network flex flex-col items-center justify-center w-12 transition-colors ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`
          }
        >
          <Users size={22} strokeWidth={2} />
        </NavLink>

        {/* Add Expense */}
        <button
          onClick={() => navigate('/add-expense')}
          className="tour-add-expense flex items-center justify-center w-12 h-12 bg-white text-black rounded-full hover:scale-105 transition-transform shadow-lg"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>

        {/* History */}
        <NavLink 
          to="/history" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-12 transition-colors ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`
          }
        >
          <Clock size={22} strokeWidth={2} />
        </NavLink>

        {/* Profile */}
        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-12 transition-colors ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`
          }
        >
          <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-white/10 border border-white/10">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={16} className="text-white" />
            )}
          </div>
        </NavLink>

      </div>
    </div>
  );
};
