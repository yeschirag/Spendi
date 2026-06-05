import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Plus, Clock, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

export const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
      <div className="relative flex items-center justify-between px-6 py-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50">
        
        {/* Dashboard */}
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`
          }
        >
          <Home size={22} strokeWidth={2} />
        </NavLink>

        {/* Network / Friends */}
        <NavLink 
          to="/friends" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`
          }
        >
          <Users size={22} strokeWidth={2} />
        </NavLink>

        {/* Add Expense (Center Floating) */}
        <div className="relative -top-6 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/add-expense')}
            className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg shadow-white/20"
          >
            <Plus size={28} strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* History */}
        <NavLink 
          to="/history" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`
          }
        >
          <Clock size={22} strokeWidth={2} />
        </NavLink>

        {/* Analytics */}
        <NavLink 
          to="/analytics" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`
          }
        >
          <PieChart size={22} strokeWidth={2} />
        </NavLink>

      </div>
    </div>
  );
};
