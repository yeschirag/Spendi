import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';

export const AuthPage = () => {
  const { login, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error: authError } = isLogin 
        ? await login(email, password)
        : await signUp(email, password, fullName, phone);
        
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
    <div className="min-h-screen bg-[#000000] flex font-body selection:bg-white/20 relative overflow-hidden">
      {/* Left Side: Artwork (Editorial visual) */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-[#F3F3F1] overflow-hidden flex-col justify-between p-16">
        {/* Background Artwork */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/auth_artwork.png" 
            alt="Editorial artwork" 
            className="w-full h-full object-cover opacity-90 select-none pointer-events-none transition-transform duration-[10000ms] ease-out hover:scale-105" 
          />
          {/* Subtle gradient overlay to tie the artwork back to the editorial feel */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#F3F3F1]/80 via-transparent to-transparent"></div>
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain filter brightness-0" />
            <span className="text-3xl text-black tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Spendi</span>
          </Link>
        </div>

        {/* Footer Typography */}
        <div className="relative z-10 max-w-md">
          <h3 className="text-4xl text-black leading-tight mb-4 font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>
            The art of tracking. <br />
            <span className="text-black/50">The beauty of clarity.</span>
          </h3>
          <p className="text-sm text-black/60 leading-relaxed font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            A digital workspace crafted for smart spenders, savers, and thinkers. Organize your balances and splits in a pure, unadulterated interface.
          </p>
        </div>
      </div>

      {/* Right Side: Authentication Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-16 relative z-10 bg-brand-black">
        
        {/* Mobile Header: Visible only on smaller screens */}
        <div className="lg:hidden absolute top-8 left-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain filter invert" />
            <span className="text-2xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Spendi</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Form Header */}
          <div className="mb-10 text-left">
            <h2 className="text-4xl sm:text-5xl text-white font-normal leading-tight" style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: '-0.5px' }}>
              {isLogin ? 'Welcome back.' : 'Begin your journey.'}
            </h2>
            <p className="mt-3 text-sm text-brand-charcoal" style={{ fontFamily: "'Inter', sans-serif" }}>
              {isLogin ? 'Enter your details to access your dashboard' : 'Join a quiet space for smart financial tracking'}
            </p>
          </div>

          {error && (
            <div className="bg-brand-cinnabar/10 text-brand-cinnabar text-sm p-4 rounded-xl border border-brand-cinnabar/25 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
              {error}
            </div>
          )}

          {/* Social Sign In */}
          <GlassButton
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center items-center gap-3 py-3.5 px-4 rounded-xl text-sm font-medium text-white bg-brand-graphite/35 hover:bg-brand-graphite/60 border-0 transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </GlassButton>

          {/* Divider */}
          <div className="my-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="px-4 bg-brand-black text-brand-charcoal font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Or use your email</span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit} style={{ fontFamily: "'Inter', sans-serif" }}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Full Name</label>
                  <div className="mt-2">
                    <input 
                      type="text" 
                      required 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                      className="appearance-none block w-full px-4 py-3.5 bg-brand-black border border-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand-porcelain/40 focus:border-brand-porcelain sm:text-sm transition-all duration-200" 
                      placeholder="John Doe" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Phone Number (Optional)</label>
                  <div className="mt-2">
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="appearance-none block w-full px-4 py-3.5 bg-brand-black border border-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand-porcelain/40 focus:border-brand-porcelain sm:text-sm transition-all duration-200" 
                      placeholder="+91 9876543210" 
                    />
                  </div>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Email address</label>
              <div className="mt-2">
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="appearance-none block w-full px-4 py-3.5 bg-brand-black border border-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand-porcelain/40 focus:border-brand-porcelain sm:text-sm transition-all duration-200" 
                  placeholder="you@example.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Password</label>
              <div className="mt-2">
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="appearance-none block w-full px-4 py-3.5 bg-brand-black border border-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand-porcelain/40 focus:border-brand-porcelain sm:text-sm transition-all duration-200" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <div className="pt-4">
              <GlassButton 
                type="submit" 
                disabled={loading} 
                className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl text-sm font-semibold text-brand-black bg-brand-porcelain hover:bg-brand-porcelain/90 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? 'Sign in' : 'Create account')}
              </GlassButton>
            </div>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-sm font-light text-brand-charcoal hover:text-brand-porcelain transition-colors duration-200"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-brand-porcelain hover:underline">Sign up</span></>
              ) : (
                <>Already have an account? <span className="text-brand-porcelain hover:underline">Sign in</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
