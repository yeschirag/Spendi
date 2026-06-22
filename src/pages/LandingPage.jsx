import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const videoRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId;

    const handleFadeLoop = () => {
      const currentTime = video.currentTime;
      const duration = video.duration || 10;

      if (currentTime < 0.5) {
        video.style.opacity = (currentTime / 0.5).toString();
      } else if (duration - currentTime < 0.5) {
        video.style.opacity = ((duration - currentTime) / 0.5).toString();
      } else {
        video.style.opacity = '1';
      }

      animationFrameId = requestAnimationFrame(handleFadeLoop);
    };

    const handleEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        video.currentTime = 0;
        video.play();
      }, 100);
    };

    video.addEventListener('ended', handleEnded);
    
    video.play().then(() => {
      handleFadeLoop();
    }).catch(err => console.error("Video autoplay blocked", err));

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-brand-black text-brand-porcelain selection:bg-brand-porcelain/20">
      {/* Hero Wrapper */}
      <div className="relative w-full min-h-screen flex flex-col overflow-hidden">
        {/* Background video layer (z-0) with dark filter overlay */}
        <div className="absolute inset-0 z-0 bg-brand-black">
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover opacity-20 filter brightness-50 contrast-125"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4"
          ></video>
          {/* Moody overlay to ensure complete contrast */}
          <div className="absolute inset-0 bg-brand-black/60"></div>
        </div>

        {/* Gradient overlays to feather the hard video edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-brand-black/60 to-transparent via-15% z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-brand-black to-transparent z-0 pointer-events-none"></div>

        {/* Floating Glass Navigation bar (z-50) */}
        <div className="w-full pt-6 relative z-50">
          <nav className="w-11/12 max-w-5xl mx-auto flex justify-between items-center px-8 py-4 glass-card rounded-full">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain filter invert" />
              <div className="text-2xl tracking-tight text-white font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Spendi</div>
            </div>
            <div className="hidden md:flex gap-8 items-center" style={{ fontFamily: "'Inter', sans-serif" }}>
              <Link to="/" className="text-xs text-brand-porcelain transition-colors uppercase tracking-widest font-semibold">Home</Link>
              <a href="#features" className="text-xs text-brand-porcelain/60 hover:text-brand-porcelain transition-colors uppercase tracking-widest font-semibold">Features</a>
              <a href="#about" className="text-xs text-brand-porcelain/60 hover:text-brand-porcelain transition-colors uppercase tracking-widest font-semibold">About</a>
            </div>
            <div className="flex items-center gap-6">
              {!user && (
                <button 
                  onClick={() => navigate('/auth')}
                  className="hidden md:block text-xs text-brand-porcelain hover:text-brand-porcelain/60 transition-colors uppercase tracking-widest font-semibold"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Log in
                </button>
              )}
              <button 
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className="rounded-full px-5 py-2 text-xs bg-brand-porcelain text-brand-black hover:scale-[1.03] transition-all whitespace-nowrap font-bold uppercase tracking-widest"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {user ? 'Dashboard' : 'Begin'}
              </button>
            </div>
          </nav>
        </div>

        {/* Hero section (z-10) */}
        <main 
          className="relative z-10 flex flex-col items-center justify-center text-center px-6" 
          style={{ paddingTop: 'calc(8rem - 75px)', paddingBottom: '10rem' }}
        >
          <h1 
            className="text-5xl sm:text-7xl md:text-8xl max-w-7xl font-normal text-brand-porcelain animate-fade-rise"
            style={{ fontFamily: "'Instrument Serif', serif", lineHeight: 0.95, letterSpacing: '-2.46px' }}
          >
            Beyond <em className="not-italic text-brand-porcelain/50">expenses,</em> we build <em className="not-italic text-brand-porcelain/50">financial clarity.</em>
          </h1>
          
          <p 
            className="text-base sm:text-lg max-w-2xl mt-8 leading-relaxed text-brand-porcelain/70 animate-fade-rise-delay font-light"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Building platforms for smart spenders, fearless savers, and thoughtful souls. Through the noise, we craft digital havens for deep tracking and pure balances.
          </p>
          
          <button 
            onClick={() => navigate(user ? '/dashboard' : '/auth')}
            className="rounded-full px-14 py-5 text-base mt-12 bg-brand-porcelain text-brand-black hover:scale-[1.03] transition-transform animate-fade-rise-delay-2 inline-block shadow-xl font-medium"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {user ? 'Enter Dashboard' : 'Begin Journey'}
          </button>
        </main>
      </div>

      {/* Features Section - Redesigned for luxury/editorial feel */}
      <section id="features" className="relative z-10 bg-brand-black py-40 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-40">
            <h2 className="text-5xl md:text-8xl text-brand-porcelain mb-8" style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: '-2px', lineHeight: 0.9 }}>
              Precision in <br/><em className="not-italic text-brand-porcelain/50">every pixel.</em>
            </h2>
            <p className="text-xl md:text-2xl text-brand-porcelain/70 max-w-2xl font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
              We stripped away the noise. What remains is a pure, unadulterated tool for tracking wealth and shared lives.
            </p>
          </div>

          <div className="space-y-40">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24 group">
               <div className="flex-1 space-y-8">
                  <div className="text-8xl md:text-[120px] leading-none text-brand-graphite group-hover:text-brand-porcelain transition-colors duration-1000" style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: '-3px' }}>
                    01
                  </div>
                  <h3 className="text-4xl md:text-5xl text-brand-porcelain" style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: '-1px' }}>Visual Analytics.</h3>
                  <p className="text-lg md:text-xl text-brand-porcelain/70 max-w-md leading-relaxed font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Understand your financial flow instantly. Elegant charts and beautiful category breakdowns reveal the story behind your spending.
                  </p>
               </div>
               <div className="flex-1 w-full aspect-square md:aspect-[4/3] glass-card flex items-center justify-center relative overflow-hidden group-hover:border-brand-porcelain/20 transition-colors duration-700 rounded-3xl">
                  {/* Abstract graphic */}
                  <div className="w-64 h-64 rounded-full border border-brand-porcelain/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000 ease-out"></div>
                  <div className="w-48 h-48 rounded-full border border-brand-porcelain/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000 delay-100 ease-out"></div>
                  <div className="w-32 h-32 rounded-full border border-brand-porcelain/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000 delay-200 ease-out bg-white/5"></div>
               </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-16 md:gap-24 group">
               <div className="flex-1 space-y-8 md:pl-16">
                  <div className="text-8xl md:text-[120px] leading-none text-brand-graphite group-hover:text-brand-porcelain transition-colors duration-1000" style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: '-3px' }}>
                    02
                  </div>
                  <h3 className="text-4xl md:text-5xl text-brand-porcelain" style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: '-1px' }}>Seamless Splits.</h3>
                  <p className="text-lg md:text-xl text-brand-porcelain/70 max-w-md leading-relaxed font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Split bills effortlessly. Our algorithms calculate exactly who owes what, down to the absolute cent, without the awkward math.
                  </p>
               </div>
               <div className="flex-1 w-full aspect-square md:aspect-[4/3] glass-card flex items-center justify-center relative overflow-hidden group-hover:border-brand-porcelain/20 transition-colors duration-700 rounded-3xl">
                  {/* Abstract graphic */}
                  <div className="flex gap-4 md:gap-8">
                     <div className="w-12 h-48 bg-white/5 rounded-full group-hover:-translate-y-8 transition-transform duration-1000 ease-out"></div>
                     <div className="w-12 h-64 bg-white/10 rounded-full group-hover:translate-y-8 transition-transform duration-1000 ease-out delay-100"></div>
                     <div className="w-12 h-32 bg-white/5 rounded-full group-hover:-translate-y-4 transition-transform duration-1000 ease-out delay-200"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Section / Dark Mode Break */}
      <section className="relative z-10 bg-brand-black text-white py-40 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
           <h2 className="text-6xl md:text-9xl text-brand-porcelain mb-12" style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: '-3px', lineHeight: 0.9 }}>
              Beautifully <em className="not-italic text-brand-porcelain/50">dark.</em>
           </h2>
           <p className="text-xl md:text-3xl text-brand-porcelain/60 max-w-3xl font-light mb-24" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>
              When the sun sets, your finances shouldn't blind you. A dashboard engineered specifically for nocturnal focus and ultimate clarity.
           </p>

           <div className="w-full max-w-5xl aspect-[4/3] md:aspect-[21/9] glass-card rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent z-10"></div>
              
              <div className="absolute top-8 md:top-12 left-8 md:left-12 right-8 md:right-12 bottom-0 flex flex-col md:flex-row gap-8">
                 {/* Sidebar Mock */}
                 <div className="hidden md:block w-1/4 h-full border-r border-border/30 pr-8 space-y-6 pt-4">
                    <div className="h-6 w-1/2 bg-brand-graphite rounded-full"></div>
                    <div className="h-4 w-3/4 bg-brand-graphite/45 rounded-full"></div>
                    <div className="h-4 w-2/3 bg-brand-graphite/45 rounded-full"></div>
                    <div className="h-4 w-4/5 bg-brand-graphite/45 rounded-full"></div>
                 </div>
                 {/* Main Area Mock */}
                 <div className="flex-1 space-y-8 md:pt-4">
                    <div className="flex justify-between items-end border-b border-border/30 pb-8">
                       <div className="space-y-4 flex flex-col items-start">
                          <div className="h-4 w-24 bg-brand-graphite rounded-full"></div>
                          <div className="h-12 w-40 md:w-48 bg-brand-graphite/45 rounded-full"></div>
                       </div>
                       <div className="h-12 w-12 rounded-full bg-brand-graphite"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                       <div className="h-32 bg-brand-graphite/20 rounded-2xl border border-border/40 group-hover:bg-brand-graphite/40 transition-colors duration-700"></div>
                       <div className="h-32 bg-brand-graphite/20 rounded-2xl border border-border/40 group-hover:bg-brand-graphite/40 transition-colors duration-700 delay-100"></div>
                       <div className="hidden md:block h-32 bg-brand-graphite/20 rounded-2xl border border-border/40 group-hover:bg-brand-graphite/40 transition-colors duration-700 delay-200"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 bg-brand-black py-40 px-6 text-center border-t border-border">
        <h2 className="text-5xl md:text-[80px] text-brand-porcelain mb-12 max-w-4xl mx-auto" style={{ fontFamily: "'Instrument Serif', serif", lineHeight: 0.9, letterSpacing: '-2px' }}>
          Stop arguing. <br/>Start <em className="not-italic text-brand-porcelain/50">living.</em>
        </h2>
        <button 
          onClick={() => navigate(user ? '/dashboard' : '/auth')} 
          className="rounded-full px-16 py-6 text-lg mt-8 bg-brand-porcelain text-brand-black hover:scale-[1.03] transition-transform inline-block shadow-2xl font-medium tracking-wide"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Create Free Account
        </button>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-brand-black py-16 px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain filter invert" />
            <div className="text-3xl text-brand-porcelain" style={{ fontFamily: "'Instrument Serif', serif" }}>Spendi</div>
          </div>
          <div className="text-sm text-brand-porcelain/40" style={{ fontFamily: "'Inter', sans-serif" }}>
            © {new Date().getFullYear()} Spendi. The art of finance.
          </div>
        </div>
      </footer>
    </div>
  );
};
