import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { FriendProvider } from './context/FriendContext';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { FriendModal } from './components/modals/FriendModal';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { AddExpensePage } from './pages/AddExpensePage';
import { EditExpensePage } from './pages/EditExpensePage';
import { FriendsPage } from './pages/FriendsPage';
import { FriendDetailsPage } from './pages/FriendDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { HistoryPage } from './pages/HistoryPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailsPage } from './pages/GroupDetailsPage';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { useAuth } from './context/AuthContext';
import { useAppContext } from './context/AppContext';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import './index.css';

import { AppTour } from './components/shared/AppTour';

// Add JoinGroup component inline for handling invite links
const JoinGroupRoute = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleJoin = async () => {
      try {
        const db = await import('./services/db');
        const groupId = await db.joinGroup(token);
        navigate(`/group/${groupId}`);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    handleJoin();
  }, [token, navigate]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white/50 animate-pulse">Joining group...</div>;
  return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6"><h1 className="text-3xl mb-4 text-red-400">Failed to join</h1><p className="text-white/50 mb-8">{error}</p><button onClick={() => navigate('/groups')} className="px-6 py-2 bg-white text-black rounded-full">Go to Groups</button></div>;
};

function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { loadingData } = useAppContext();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (loadingData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <img src="/logo.png" alt="Spendi" className="w-12 h-12 object-contain filter invert brightness-0 animate-pulse" />
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/40 w-1/2 animate-[progress_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/[0.03] via-black to-black text-white font-body selection:bg-white/20 relative">
      <AppTour />
      <div className="hidden md:block">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 min-h-screen pb-24 md:pb-0 ml-0 md:ml-[280px]">
        <Header onToggleMenu={toggleSidebar} />
        {children}
      </main>

      <BottomNav />
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    let audioUrl = null;
    let audio = null;

    // Prefetch the audio file to avoid browser cache/range-request restrictions
    fetch('/mouse.mp3')
      .then((res) => res.blob())
      .then((blob) => {
        audioUrl = URL.createObjectURL(blob);
        audio = new Audio(audioUrl);
        audio.volume = 0.2; // Keep it subtle and premium
      })
      .catch((err) => {
        console.warn('Failed to load click audio blob, falling back to direct URL:', err);
        // Fallback to direct path
        audio = new Audio('/mouse.mp3');
        audio.volume = 0.2;
      });

    const playClick = (e) => {
      if (!audio) return;
      const target = e.target;
      if (!target) return;

      // Only play on interactive elements for a professional user experience
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.cursor-pointer') ||
        target.closest('[role="button"]') ||
        (target.tagName === 'INPUT' && ['submit', 'button', 'checkbox', 'radio'].includes(target.type));

      if (isInteractive) {
        audio.currentTime = 0;
        audio.play().catch((err) => {
          console.debug('Audio play blocked:', err);
        });
      }
    };

    window.addEventListener('click', playClick);
    return () => {
      window.removeEventListener('click', playClick);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  return (
    <AuthProvider>
      <FriendProvider>
        <AppProvider>
          <SmoothScroll>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/join/:token" element={<ProtectedRoute><JoinGroupRoute /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/add-expense" element={<ProtectedRoute><MainLayout><AddExpensePage /></MainLayout></ProtectedRoute>} />
                <Route path="/edit-expense/:id" element={<ProtectedRoute><MainLayout><EditExpensePage /></MainLayout></ProtectedRoute>} />
                <Route path="/friends" element={<ProtectedRoute><MainLayout><FriendsPage /></MainLayout></ProtectedRoute>} />
                <Route path="/groups" element={<ProtectedRoute><MainLayout><GroupsPage /></MainLayout></ProtectedRoute>} />
                <Route path="/group/:id" element={<ProtectedRoute><MainLayout><GroupDetailsPage /></MainLayout></ProtectedRoute>} />
                <Route path="/friend/:id" element={<ProtectedRoute><MainLayout><FriendDetailsPage /></MainLayout></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><MainLayout><HistoryPage /></MainLayout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
              </Routes>
            </BrowserRouter>
          </SmoothScroll>
        </AppProvider>
      </FriendProvider>
    </AuthProvider>
  );
}

export default App;
