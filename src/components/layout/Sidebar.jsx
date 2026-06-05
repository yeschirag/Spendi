import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, UserPlus, Users, History, Settings, Info, LogOut, LogIn } from 'lucide-react';

export const Sidebar = ({ onOpenModal }) => {
  const { user } = useAppContext() || { user: null };
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleAuthAction = async () => {
    if (user) {
      await logout();
      navigate('/');
    } else {
      navigate('/auth');
    }
  };

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[280px] bg-transparent border-r border-white/10 flex flex-col z-50 transition-transform hidden md:flex">
      <div className="h-[96px] px-8 flex items-center gap-3 border-b border-white/10">
        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain filter invert brightness-0" />
        <div className="text-4xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Spendi</div>
      </div>
      
      <nav className="flex-1 px-4 py-8 flex flex-col gap-2 overflow-y-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
        <button onClick={() => navigate('/dashboard')} className={`flex items-center gap-4 px-4 py-3 rounded-full text-sm transition-all text-left ${isActive('/dashboard') ? 'font-medium text-white bg-white/10' : 'font-light text-white/50 hover:text-white hover:bg-white/5'}`}>
          <LayoutDashboard size={18} strokeWidth={2} />
          Dashboard
        </button>
        <button onClick={() => navigate('/add-expense')} className={`flex items-center gap-4 px-4 py-3 rounded-full text-sm transition-all text-left ${isActive('/add-expense') ? 'font-medium text-white bg-white/10' : 'font-light text-white/50 hover:text-white hover:bg-white/5'}`}>
          <Receipt size={18} strokeWidth={2} />
          Add Expense
        </button>
        <button onClick={() => navigate('/friends')} className={`flex items-center gap-4 px-4 py-3 rounded-full text-sm transition-all text-left ${isActive('/friends') ? 'font-medium text-white bg-white/10' : 'font-light text-white/50 hover:text-white hover:bg-white/5'}`}>
          <Users size={18} strokeWidth={2} />
          Network
        </button>
        <button className={`flex items-center gap-4 px-4 py-3 rounded-full text-sm transition-all text-left ${isActive('/history') ? 'font-medium text-white bg-white/10' : 'font-light text-white/50 hover:text-white hover:bg-white/5'}`} onClick={() => navigate('/history')}>
          <History size={18} strokeWidth={2} />
          History
        </button>
        
        <div className="h-px bg-white/5 my-4 mx-4"></div>
        
        <button className={`flex items-center gap-4 px-4 py-3 rounded-full text-sm transition-all text-left ${isActive('/profile') ? 'font-medium text-white bg-white/10' : 'font-light text-white/50 hover:text-white hover:bg-white/5'}`} onClick={() => navigate('/profile')}>
          <Settings size={18} strokeWidth={2} />
          Profile
        </button>
      </nav>

      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl cursor-pointer transition-all" onClick={handleAuthAction}>
          <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center shrink-0 text-white overflow-hidden bg-white/5">
            {user ? (
              user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="font-medium text-sm" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </span>
              )
            ) : (
              <LogIn size={16} className="text-white/50" />
            )}
          </div>
          <div className="flex-1 min-w-0" style={{ fontFamily: "'Inter', sans-serif" }}>
            <span className="block text-sm font-medium text-white truncate">
              {user ? (user.user_metadata?.full_name || user.email) : 'Guest'}
            </span>
            <span className="block text-xs text-white/40 font-light mt-0.5">{user ? 'Sign out' : 'Sign in'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
