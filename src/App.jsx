import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { FriendModal } from './components/modals/FriendModal';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { AddExpensePage } from './pages/AddExpensePage';
import { FriendsPage } from './pages/FriendsPage';
import { ProfilePage } from './pages/ProfilePage';
import { HistoryPage } from './pages/HistoryPage';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { useAuth } from './context/AuthContext';
import { useAppContext } from './context/AppContext';
import { Navigate } from 'react-router-dom';
import './index.css';

function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { loadingData } = useAppContext();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
    <div className="flex min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/[0.03] via-black to-black text-white font-body selection:bg-white/20">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-h-screen ml-0 md:ml-[280px]">
        <Header onToggleMenu={toggleSidebar} />
        {children}
      </main>
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
  return (
    <AuthProvider>
      <AppProvider>
        <SmoothScroll>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
              <Route path="/add-expense" element={<ProtectedRoute><MainLayout><AddExpensePage /></MainLayout></ProtectedRoute>} />
              <Route path="/friends" element={<ProtectedRoute><MainLayout><FriendsPage /></MainLayout></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><MainLayout><HistoryPage /></MainLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </SmoothScroll>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
