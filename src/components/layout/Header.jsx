import { Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user } = useAuth();
  const { groups } = useAppContext();
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  // Determine dynamic title
  const getTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview.';
    if (path === '/add-expense') return 'Add Expense.';
    if (path.startsWith('/edit-expense/')) return 'Edit Expense.';
    if (path === '/friends') return 'Network.';
    if (path === '/groups') return 'Trips.';
    if (path.startsWith('/group/')) {
      const groupId = path.split('/')[2];
      const groupObj = groups?.find(g => g.id === groupId);
      return groupObj ? `${groupObj.name}.` : 'Trip Details.';
    }
    if (path.startsWith('/friend/')) return 'Friend Details.';
    if (path === '/history') return 'History.';
    if (path === '/profile') return 'Profile.';
    return 'Spendi.';
  };

  const title = getTitle();

  return (
    <header className="h-[72px] md:h-[96px] bg-background/85 backdrop-blur-md border-b border-border/40 flex items-center gap-5 px-6 md:px-16 sticky top-0 z-40 transition-all duration-300">
      <div className="flex-1">
        <h1 className="text-2xl md:text-3xl font-normal text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>{title}</h1>
      </div>
      
      {/* Desktop Add Expense */}
      <div className="flex items-center gap-4">
        <button className="hidden md:flex items-center gap-2.5 px-6 py-3 bg-brand-porcelain text-brand-black hover:scale-[1.02] rounded-full text-sm font-medium transition-transform shadow-lg" style={{ fontFamily: "'Inter', sans-serif" }} onClick={() => navigate('/add-expense')}>
          <Plus size={18} strokeWidth={2} />
          <span>Add Expense</span>
        </button>
        
        {/* Mobile Profile Link */}
        <button onClick={() => navigate('/profile')} className="md:hidden w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-brand-graphite/30 border border-border shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          )}
        </button>
      </div>
    </header>
  );
};

