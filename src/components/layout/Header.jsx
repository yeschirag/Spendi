import { useState, useEffect } from 'react';
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

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`fixed top-0 left-0 right-0 md:sticky z-40 border-b transition-all duration-150 flex items-center justify-between px-6 md:px-16 ${
      isScrolled 
        ? 'h-[48px] md:h-[96px] bg-[var(--color-surface-glass)] backdrop-blur-lg border-[var(--color-border)] shadow-sm' 
        : 'h-[56px] md:h-[96px] bg-transparent border-transparent'
    }`} style={{ marginLeft: location.pathname === '/' ? 0 : undefined }}>
      <div className="flex-1">
        <h1 
          className={`font-semibold text-white tracking-tight transition-all duration-150 ${
            isScrolled ? 'text-[15px] md:text-3xl' : 'text-[17px] md:text-3xl'
          }`} 
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
      </div>
      
      {/* Desktop Add Expense */}
      <div className="flex items-center gap-4">
        <button 
          className="hidden md:flex items-center gap-2.5 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white hover:scale-[1.02] rounded-full text-sm font-semibold transition-all shadow-lg active:scale-95" 
          style={{ fontFamily: "var(--font-body)" }} 
          onClick={() => navigate('/add-expense')}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Expense</span>
        </button>
        
        {/* Mobile Profile Link */}
        <button 
          onClick={() => navigate('/profile')} 
          className="md:hidden w-[44px] h-[44px] flex items-center justify-center shrink-0"
        >
          <div className="w-[32px] h-[32px] rounded-full overflow-hidden flex items-center justify-center bg-brand-graphite/30 border border-white/10">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            )}
          </div>
        </button>
      </div>
    </header>
  );
};

