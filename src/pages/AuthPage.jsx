import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const AuthPage = () => {
  const { login, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error: authError } = isLogin 
        ? await login(email, password)
        : await signUp(email, password);
        
      if (authError) throw authError;
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // Google Auth redirects, so we don't need to manually navigate here
    } catch (err) {
      setError(err.message || 'Google Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-body selection:bg-white/20">
      
      <div className="absolute top-8 left-8">
         <Link to="/" className="flex items-center gap-3">
           <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain filter invert brightness-0" />
           <span className="text-2xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Spendi</span>
         </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <h2 className="mt-6 text-center text-6xl text-white font-normal" style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: '-1px' }}>
          {isLogin ? 'Welcome back.' : 'Begin your journey.'}
        </h2>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-[#0A0A0A] py-10 px-6 sm:rounded-[2rem] sm:px-12 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
          
          {error && (
            <div className="bg-red-500/10 text-red-400 text-sm p-4 rounded-xl border border-red-500/20 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center items-center gap-3 py-3.5 px-4 rounded-xl text-sm font-medium text-black bg-white hover:bg-white/90 transition-colors shadow-lg relative z-10"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="mt-8 mb-8 relative z-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0A0A0A] text-white/40 tracking-wide uppercase text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>Or continue with email</span>
            </div>
          </div>

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit} style={{ fontFamily: "'Inter', sans-serif" }}>
            <div>
              <label className="block text-sm font-medium text-white/70">Email address</label>
              <div className="mt-2">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white focus:border-white sm:text-sm transition-all" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70">Password</label>
              <div className="mt-2">
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white focus:border-white sm:text-sm transition-all" placeholder="••••••••" />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? 'Sign in' : 'Create account')}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center relative z-10">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-light text-white/50 hover:text-white transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
