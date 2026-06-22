import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from '../components/ui/GlassButton';
import { 
  Plus, 
  Minus, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowRight,
  Shield,
  Coins,
  DollarSign,
  Info,
  Activity,
  Layers,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';

// Live Interactive Split Calculator Widget
const SplitCalculator = () => {
  const [amount, setAmount] = useState(120);
  const [splitType, setSplitType] = useState('equal'); // 'equal' | 'percentage'
  const [participants, setParticipants] = useState([
    { name: 'You', percent: 40 },
    { name: 'Alice', percent: 35 },
    { name: 'Bob', percent: 25 }
  ]);

  const totalAmount = parseFloat(amount) || 0;

  // Calculate live shares
  const getCalculatedShares = () => {
    if (splitType === 'equal') {
      const share = totalAmount / participants.length;
      return participants.map(p => ({ ...p, share }));
    } else {
      const totalPercent = participants.reduce((sum, p) => sum + p.percent, 0) || 1;
      return participants.map(p => ({
        ...p,
        share: (p.percent / totalPercent) * totalAmount
      }));
    }
  };

  const handlePercentChange = (index, val) => {
    const updated = [...participants];
    updated[index].percent = Math.max(0, Math.min(100, parseInt(val) || 0));
    setParticipants(updated);
  };

  const shares = getCalculatedShares();

  return (
    <div className="w-full max-w-md mx-auto z-10 bg-brand-black/80 backdrop-blur-xl p-6 md:p-8 border border-white/10 rounded-[2.5rem] shadow-2xl shadow-black/40 relative">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-cinnabar animate-pulse"></span>
          <span className="text-xs uppercase tracking-widest text-brand-porcelain/60 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>Interactive Split Demo</span>
        </div>

        <h3 className="text-3xl text-brand-porcelain mb-6 font-normal" style={{ fontFamily: "var(--font-display)" }}>Try Spendi Live.</h3>

        {/* Bill Amount Input */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-widest text-brand-porcelain/40 font-semibold mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Total Bill Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-brand-porcelain/40">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-brand-graphite/30 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-2xl font-light text-white focus:outline-none focus:border-brand-cinnabar/50 transition-colors"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Split Type Selector */}
        <div className="flex gap-2 p-1.5 bg-brand-graphite/20 rounded-2xl mb-6">
          <button
            onClick={() => setSplitType('equal')}
            className={`flex-1 py-2.5 text-xs uppercase tracking-widest font-semibold rounded-xl transition-all ${splitType === 'equal' ? 'bg-brand-porcelain text-brand-black shadow-lg font-bold' : 'text-brand-porcelain/50 hover:text-brand-porcelain'}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Equally
          </button>
          <button
            onClick={() => setSplitType('percentage')}
            className={`flex-1 py-2.5 text-xs uppercase tracking-widest font-semibold rounded-xl transition-all ${splitType === 'percentage' ? 'bg-brand-porcelain text-brand-black shadow-lg font-bold' : 'text-brand-porcelain/50 hover:text-brand-porcelain'}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Percentage
          </button>
        </div>

        {/* Participant Breakdown */}
        <div className="space-y-4">
          {shares.map((participant, index) => (
            <div key={participant.name} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-brand-porcelain/80 font-medium">{participant.name}</span>
                <span className="text-brand-porcelain font-semibold text-base">${participant.share.toFixed(2)}</span>
              </div>
              
              {splitType === 'percentage' ? (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={participant.percent}
                    onChange={(e) => handlePercentChange(index, e.target.value)}
                    className="flex-1 accent-brand-cinnabar h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-brand-porcelain/40 w-8 text-right">{participant.percent}%</span>
                </div>
              ) : (
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white/40 w-1/3 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
  );
};


// FAQ Accordion Component
const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "How does Spendi simplify group debt?",
      a: "Spendi uses a debt-simplification algorithm that minimizes the total number of transactions needed to settle balances. For example, if Alice owes Bob $10 and Bob owes Charlie $10, Spendi routes the transaction so Alice pays Charlie $10 directly, saving a step."
    },
    {
      q: "Is Spendi compatible with mobile phones?",
      a: "Yes! Spendi is fully responsive and designed to be a Progressive Web App (PWA). You can open it in any mobile browser, click 'Add to Home Screen', and enjoy a full-screen, native-feeling mobile experience complete with smooth page transitions."
    },
    {
      q: "Can I use Spendi without an account?",
      a: "You can try out our live split calculator widget right here! To track expenses with friends over time, join groups, and save history, you can sign up for a free account in just a few clicks."
    },
    {
      q: "How is my personal data secured?",
      a: "We integrate with Supabase, leveraging industry-standard row-level security (RLS) policies. Your transaction data, email, and split balances are encrypted and strictly accessible only by you and the specific friends you share expenses with."
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {faqs.map((faq, idx) => (
        <div key={idx} className="border-b border-white/5 pb-4">
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex justify-between items-center text-left py-4 text-lg md:text-xl font-normal text-white hover:text-white/80 transition-colors"
          >
            <span style={{ fontFamily: "var(--font-display)" }} className="text-xl md:text-2xl">{faq.q}</span>
            {openIndex === idx ? <Minus size={18} className="text-brand-cinnabar" /> : <Plus size={18} className="text-white/40" />}
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-[300px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <p className="text-brand-porcelain/60 font-light text-sm md:text-base leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              {faq.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const LandingPage = () => {
  const videoRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    }).catch(err => console.debug("Video autoplay blocked", err));

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleMobileNavClick = (id) => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#FFFFFF] text-black selection:bg-brand-black/10">
      {/* Hero Wrapper */}
      <div id="hero" className="relative w-full min-h-screen flex flex-col overflow-hidden">
        {/* Background video layer (z-0) at 100% opacity */}
        <video
          ref={videoRef}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4"
        ></video>

        {/* Gradient overlays to feather the hard video edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFFFF] via-[#FFFFFF]/80 to-transparent via-15% z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FFFFFF] to-transparent z-0 pointer-events-none"></div>

        {/* Floating Glass Navigation bar (z-50) */}
        <div className="w-full pt-6 relative z-50">
          <div className="w-11/12 max-w-5xl mx-auto z-50 relative">
            <nav className="w-full flex justify-between items-center px-8 py-4 bg-white/70 backdrop-blur-xl border border-white/60 text-black relative rounded-full shadow-lg shadow-black/5">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain filter brightness-0" />
                <div className="text-2xl tracking-tight text-black font-normal" style={{ fontFamily: "var(--font-display)" }}>Spendi</div>
              </div>
              
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex gap-8 items-center" style={{ fontFamily: "var(--font-body)" }}>
                <button onClick={() => handleMobileNavClick('hero')} className="text-xs text-black/60 hover:text-black transition-colors uppercase tracking-widest font-semibold">Home</button>
                <button onClick={() => handleMobileNavClick('features')} className="text-xs text-black/60 hover:text-black transition-colors uppercase tracking-widest font-semibold">Features</button>
                <button onClick={() => handleMobileNavClick('faq')} className="text-xs text-black/60 hover:text-black transition-colors uppercase tracking-widest font-semibold">FAQ</button>
              </div>
              
              {/* Action Buttons */}
              <div className="hidden md:flex items-center gap-6">
                {!user && (
                  <GlassButton
                    onClick={() => navigate('/auth')}
                    className="text-xs text-black hover:text-black/60 transition-colors uppercase tracking-widest font-semibold px-4 py-2"
                  >
                    Log in
                  </GlassButton>
                )}
                <GlassButton
                  onClick={() => navigate(user ? '/dashboard' : '/auth')}
                  className="rounded-full px-5 py-2.5 text-xs bg-black/80 text-white hover:bg-black transition-all whitespace-nowrap font-bold uppercase tracking-widest"
                >
                  {user ? 'Dashboard' : 'Begin'}
                </GlassButton>
              </div>

              {/* Mobile Hamburger Button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-10 h-10 flex items-center justify-center rounded-full active:scale-90 transition-all"
                  aria-label="Toggle Menu"
                  style={{
                    backdropFilter: 'blur(20px) saturate(180%) brightness(1.1)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%) brightness(1.1)',
                    background: 'rgba(255,255,255,0.45)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'
                  }}
                >
                  {isMenuOpen ? (
                    <X size={18} className="text-black" />
                  ) : (
                    <Menu size={18} className="text-black" />
                  )}
                </button>
              </div>

              {/* Mobile Hamburger Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-3 z-50 md:hidden w-full"
                  >
                    <div className="w-full bg-white/90 backdrop-blur-xl p-6 border border-black/5 shadow-xl flex flex-col gap-4 rounded-2xl">
                      <button 
                        onClick={() => handleMobileNavClick('hero')} 
                        className="text-sm font-semibold text-black hover:opacity-70 transition-all py-2 border-b border-black/5 text-center"
                      >
                        Home
                      </button>
                      <button 
                        onClick={() => handleMobileNavClick('features')} 
                        className="text-sm font-semibold text-black hover:opacity-70 transition-all py-2 border-b border-black/5 text-center"
                      >
                        Features
                      </button>
                      <button 
                        onClick={() => handleMobileNavClick('faq')} 
                        className="text-sm font-semibold text-black hover:opacity-70 transition-all py-2 border-b border-black/5 text-center"
                      >
                        FAQ
                      </button>
                      <GlassButton
                        onClick={() => { setIsMenuOpen(false); navigate(user ? '/dashboard' : '/auth'); }}
                        className="text-sm font-bold text-white bg-black/80 rounded-full py-3 px-8 hover:bg-black active:scale-[0.98] transition-all text-center w-full"
                      >
                        {user ? 'Dashboard' : 'Begin Journey'}
                      </GlassButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>
          </div>
        </div>

        {/* Hero section (z-10) with original text styles */}
        <main 
          className="relative z-10 flex flex-col items-center justify-center text-center px-6 flex-grow" 
          style={{ paddingTop: 'calc(8rem - 75px)', paddingBottom: '10rem' }}
        >
          <h1 
            className="text-5xl sm:text-7xl md:text-8xl max-w-7xl font-normal text-black animate-fade-rise"
            style={{ fontFamily: "var(--font-display)", lineHeight: 0.95, letterSpacing: '-2.46px' }}
          >
            Beyond <em className="not-italic text-black/50 font-light">expenses,</em> we build <em className="not-italic text-black/50 font-light">financial clarity.</em>
          </h1>
          
          <p 
            className="text-base sm:text-lg max-w-2xl mt-8 leading-relaxed text-[#6F6F6F] animate-fade-rise-delay font-light"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Building platforms for smart spenders, fearless savers, and thoughtful souls. Through the noise, we craft digital havens for deep tracking and pure balances.
          </p>
          
          <GlassButton
            onClick={() => navigate(user ? '/dashboard' : '/auth')}
            className="rounded-full px-14 py-5 text-base mt-12 bg-black/80 text-white hover:bg-black transition-all animate-fade-rise-delay-2 font-semibold uppercase tracking-wider shadow-xl"
            style={{ marginTop: '3rem' }}
          >
            {user ? 'Enter Dashboard' : 'Begin Journey'}
          </GlassButton>
        </main>
      </div>

      {/* Show Calculator Showcase immediately below Hero wrapper (Dark themed segment) */}
      <section id="demo" className="relative z-10 bg-brand-black text-brand-porcelain py-32 px-6 border-t border-white/5">
        {/* Glow effect elements */}
        <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-brand-cinnabar/5 blur-[100px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-white/[0.01] blur-[120px] pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 w-full relative z-10">
          <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start max-w-xl">
            <h2 className="text-4xl sm:text-6xl font-normal leading-tight text-white mb-6" style={{ fontFamily: "var(--font-display)", letterSpacing: '-1.5px' }}>
              Split live. <br/><em className="not-italic text-white/50">Decide instantly.</em>
            </h2>
            <p className="text-base text-brand-porcelain/60 leading-relaxed font-light mb-8" style={{ fontFamily: "var(--font-body)" }}>
              Test the Spendi math engine right now. Adjust total amounts or percentages using the sliders to see exactly how funds distribute.
            </p>
            <div className="flex gap-4">
            <GlassButton
              onClick={() => navigate('/auth')}
              darkBg={true}
              className="rounded-full px-8 py-3.5 bg-brand-porcelain/90 text-brand-black hover:bg-brand-porcelain transition-all font-bold text-xs uppercase tracking-widest"
            >
              Get Started Free
            </GlassButton>
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center">
            <SplitCalculator />
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned for luxury/editorial feel */}
      <section id="features" className="relative z-10 bg-brand-black/95 text-brand-porcelain py-40 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-40">
            <h2 className="text-5xl md:text-8xl text-brand-porcelain mb-8" style={{ fontFamily: "var(--font-display)", letterSpacing: '-2px', lineHeight: 0.9 }}>
              Precision in <br/><em className="not-italic text-brand-porcelain/50">every pixel.</em>
            </h2>
            <p className="text-xl md:text-2xl text-brand-porcelain/70 max-w-2xl font-light" style={{ fontFamily: "var(--font-body)" }}>
              We stripped away the noise. What remains is a pure, unadulterated tool for tracking wealth and shared lives.
            </p>
          </div>

          <div className="space-y-40">
            {/* Feature 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24 group">
               <div className="flex-1 space-y-8">
                  <div className="text-8xl md:text-[120px] leading-none text-brand-graphite group-hover:text-brand-porcelain transition-colors duration-1000" style={{ fontFamily: "var(--font-display)", letterSpacing: '-3px' }}>
                    01
                  </div>
                  <h3 className="text-4xl md:text-5xl text-brand-porcelain" style={{ fontFamily: "var(--font-display)", letterSpacing: '-1px' }}>Visual Analytics.</h3>
                  <p className="text-lg md:text-xl text-brand-porcelain/70 max-w-md leading-relaxed font-light" style={{ fontFamily: "var(--font-body)" }}>
                    Understand your financial flow instantly. Elegant charts and beautiful category breakdowns reveal the story behind your spending.
                  </p>
               </div>
               <div className="flex-1 w-full aspect-square md:aspect-[4/3] flex relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                 <div className="w-full h-full flex items-center justify-center relative p-8">
                   {/* SVG Pie Chart Mock */}
                   <svg className="w-48 h-48 md:w-56 md:h-56 transform -rotate-90 group-hover:scale-105 transition-transform duration-1000 ease-out" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#333138" strokeWidth="12" />
                      {/* Food slice (50%) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FFFFFA" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="125.6" className="transition-all duration-1000" />
                      {/* Travel slice (30%) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FF312E" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="200.96" className="opacity-80 transition-all duration-1000" />
                      {/* Rent slice (20%) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#515052" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="226.08" className="transition-all duration-1000" />
                   </svg>
                   
                   {/* Floating tags */}
                   <div className="absolute top-8 left-8 bg-black/40 border border-white/10 px-3 py-1.5 rounded-full text-[10px] text-white/80 backdrop-blur-md flex items-center gap-1.5 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Food: 50%
                   </div>
                   <div className="absolute bottom-8 right-8 bg-black/40 border border-white/10 px-3 py-1.5 rounded-full text-[10px] text-white/80 backdrop-blur-md flex items-center gap-1.5 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-cinnabar"></span> Travel: 30%
                   </div>
                 </div>
               </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16 md:gap-24 group">
               <div className="flex-1 space-y-8 lg:pl-16">
                  <div className="text-8xl md:text-[120px] leading-none text-brand-graphite group-hover:text-brand-porcelain transition-colors duration-1000" style={{ fontFamily: "var(--font-display)", letterSpacing: '-3px' }}>
                    02
                  </div>
                  <h3 className="text-4xl md:text-5xl text-brand-porcelain" style={{ fontFamily: "var(--font-display)", letterSpacing: '-1px' }}>Seamless Splits.</h3>
                  <p className="text-lg md:text-xl text-brand-porcelain/70 max-w-md leading-relaxed font-light" style={{ fontFamily: "var(--font-body)" }}>
                    Split bills effortlessly. Our algorithms calculate exactly who owes what, down to the absolute cent, without the awkward math.
                  </p>
               </div>
               <div className="flex-1 w-full aspect-square md:aspect-[4/3] flex relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                 <div className="w-full h-full flex items-center justify-center relative p-8">
                   <div className="w-full max-w-sm flex flex-col gap-6 relative z-10">
                      {/* Person 1 */}
                      <div className="flex items-center justify-between bg-white/[0.05] border border-white/5 rounded-2xl p-3">
                         <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-brand-graphite/40 border border-white/10 flex items-center justify-center text-xs font-semibold text-white">Y</span>
                            <span className="text-xs text-white/80 font-medium">You</span>
                         </div>
                         <span className="text-xs text-emerald-400 font-mono font-semibold">Owed $40.00</span>
                      </div>
                      {/* Simplification line */}
                      <div className="flex items-center justify-center relative my-1">
                         <div className="w-px h-10 bg-gradient-to-b from-emerald-400 to-brand-cinnabar/80 flex items-center justify-center">
                            <span className="absolute text-[8px] bg-black/40 px-2 py-0.5 border border-white/10 rounded-full backdrop-blur-md uppercase tracking-widest text-white/60 font-semibold font-mono">1 Payment</span>
                         </div>
                      </div>
                      {/* Person 2 */}
                      <div className="flex items-center justify-between bg-white/[0.05] border border-white/5 rounded-2xl p-3">
                         <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-brand-graphite/40 border border-white/10 flex items-center justify-center text-xs font-semibold text-white">A</span>
                            <span className="text-xs text-white/80 font-medium">Alice</span>
                         </div>
                         <span className="text-xs text-brand-cinnabar font-mono font-semibold">Owes $40.00</span>
                      </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Section / Dark Mode Break */}
      <section className="relative z-10 bg-brand-black text-white py-40 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
           <h2 className="text-6xl md:text-9xl text-brand-porcelain mb-12" style={{ fontFamily: "var(--font-display)", letterSpacing: '-3px', lineHeight: 0.9 }}>
              Beautifully <em className="not-italic text-brand-porcelain/50">dark.</em>
           </h2>
           <p className="text-xl md:text-3xl text-brand-porcelain/60 max-w-3xl font-light mb-24" style={{ fontFamily: "var(--font-body)", lineHeight: 1.4 }}>
              When the sun sets, your finances shouldn't blind you. A dashboard engineered specifically for nocturnal focus and ultimate clarity.
           </p>

           {/* High Fidelity Dashboard Mockup */}
            <div className="w-full max-w-5xl aspect-[4/3] md:aspect-[21/9] z-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 pointer-events-none"></div>
                
                <div className="absolute top-6 md:top-10 left-6 md:left-10 right-6 md:right-10 bottom-0 flex gap-6 md:gap-8">
                   {/* Sidebar Mock */}
                   <div className="hidden md:flex w-1/4 h-full border-r border-white/10 pr-6 flex-col gap-6 pt-2">
                      <div className="flex items-center gap-2 mb-2">
                         <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain filter invert" />
                         <span className="text-xl font-normal text-white font-serif" style={{ fontFamily: "var(--font-display)" }}>Spendi</span>
                      </div>
                      <div className="space-y-3">
                         <div className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-full text-xs text-white">
                            <span className="w-2 h-2 rounded-full bg-brand-cinnabar animate-pulse"></span>
                            Overview
                         </div>
                         <div className="flex items-center gap-3 px-3 py-2 text-xs text-white/50 hover:text-white transition-colors">
                            <span className="w-2 h-2 rounded-full bg-transparent"></span>
                            Add Expense
                         </div>
                         <div className="flex items-center gap-3 px-3 py-2 text-xs text-white/50 hover:text-white transition-colors">
                            <span className="w-2 h-2 rounded-full bg-transparent"></span>
                            Network
                         </div>
                         <div className="flex items-center gap-3 px-3 py-2 text-xs text-white/50 hover:text-white transition-colors">
                            <span className="w-2 h-2 rounded-full bg-transparent"></span>
                            Trips
                         </div>
                      </div>
                   </div>
                   
                   {/* Main Dashboard Area Mock */}
                   <div className="flex-1 flex flex-col gap-6 md:pt-2">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                         <div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Your Balance</div>
                            <div className="text-2xl md:text-3xl font-normal text-white text-left" style={{ fontFamily: "var(--font-display)" }}>+$142.50.</div>
                         </div>
                         <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/10 flex items-center justify-center text-xs font-semibold text-white">
                            JD
                         </div>
                      </div>
                      
                      {/* Dashboard Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-left">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Owed to You</div>
                            <div className="text-lg font-semibold text-emerald-400 font-mono">+$187.50</div>
                         </div>
                         <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-left">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">You Owe</div>
                            <div className="text-lg font-semibold text-brand-cinnabar font-mono">-$45.00</div>
                         </div>
                         <div className="hidden md:block bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-left">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Active Trips</div>
                            <div className="text-lg font-semibold text-white font-mono">3 Groups</div>
                         </div>
                      </div>
 
                      {/* Recent Transactions List Mock */}
                      <div className="space-y-2 mt-2 text-left hidden md:block">
                         <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Recent Expenses</div>
                         <div className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                               <span className="w-8 h-8 rounded-full bg-brand-cinnabar/20 text-brand-cinnabar flex items-center justify-center text-xs font-bold">🍕</span>
                               <div>
                                  <div className="text-xs font-medium text-white">Sushi Dinner Split</div>
                                  <div className="text-[10px] text-white/40">Paid by Alice • Split equally</div>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="text-xs font-semibold text-white font-mono">$84.20</div>
                               <div className="text-[9px] text-brand-cinnabar">You owe $28.06</div>
                            </div>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                               <span className="w-8 h-8 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-xs font-bold">🚗</span>
                               <div>
                                  <div className="text-xs font-medium text-white">Uber to Airport</div>
                                  <div className="text-[10px] text-white/40">Paid by You • Alice & Bob split</div>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="text-xs font-semibold text-white font-mono">$45.00</div>
                               <div className="text-[9px] text-emerald-400">You are owed $30.00</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 bg-brand-black/90 py-40 px-6 border-t border-white/5 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-8xl text-brand-porcelain mb-8" style={{ fontFamily: "var(--font-display)", letterSpacing: '-2px', lineHeight: 0.9 }}>
              Common <em className="not-italic text-brand-porcelain/50">Questions.</em>
            </h2>
            <p className="text-lg md:text-xl text-brand-porcelain/60 max-w-2xl mx-auto font-light" style={{ fontFamily: "var(--font-body)" }}>
              Everything you need to know about Spendi and how we handle transaction splits.
            </p>
          </div>
          
          <FAQAccordion />
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 bg-brand-black py-40 px-6 text-center border-t border-white/5 text-white">
        <h2 className="text-5xl md:text-[80px] text-brand-porcelain mb-12 max-w-4xl mx-auto" style={{ fontFamily: "var(--font-display)", lineHeight: 0.9, letterSpacing: '-2px' }}>
          Stop arguing. <br/>Start <em className="not-italic text-brand-porcelain/50">living.</em>
        </h2>
        <GlassButton
          onClick={() => navigate(user ? '/dashboard' : '/auth')}
          darkBg={true}
          className="rounded-full px-16 py-6 text-lg mt-8 bg-brand-porcelain/90 text-brand-black hover:bg-brand-porcelain transition-all shadow-2xl font-medium tracking-wide"
          style={{ marginTop: '2rem' }}
        >
          Create Free Account
        </GlassButton>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-brand-black py-16 px-8 border-t border-white/5 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain filter invert" />
            <div className="text-3xl text-brand-porcelain font-normal" style={{ fontFamily: "var(--font-display)" }}>Spendi</div>
          </div>
          <div className="text-sm text-brand-porcelain/40" style={{ fontFamily: "var(--font-body)" }}>
            © {new Date().getFullYear()} Spendi. The art of finance.
          </div>
        </div>
      </footer>
    </div>
  );
};
