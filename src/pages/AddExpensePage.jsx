import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AddExpensePage = () => {
  const { friends, groups, addExpense, user } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('group') || '';

  const selectedGroup = groups.find(g => g.id === groupId);
  const availableFriends = selectedGroup 
    ? selectedGroup.group_members
        .filter(m => m.user_id !== user?.id)
        .map(m => m.profiles?.display_name || m.profiles?.full_name || m.profiles?.email || 'Unknown')
    : friends;
  
  const [step, setStep] = useState(1);
  
  // Step 1: Basics
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('food');
  
  // Step 2: Participants
  const [splitWith, setSplitWith] = useState(['You']);
  const [friendSearch, setFriendSearch] = useState('');
  
  // Step 3: Math
  const [paidBy, setPaidBy] = useState('You');
  const [splitType, setSplitType] = useState('equal');
  const [splitsData, setSplitsData] = useState({});

  useEffect(() => {
    if (splitType === 'percentage') {
      const equalPct = 100 / splitWith.length;
      const initialSplits = {};
      splitWith.forEach(f => initialSplits[f] = equalPct.toFixed(2));
      setSplitsData(initialSplits);
    } else if (splitType === 'exact') {
      const equalAmt = (parseFloat(amount || 0) / splitWith.length).toFixed(2);
      const initialSplits = {};
      splitWith.forEach(f => initialSplits[f] = equalAmt);
      setSplitsData(initialSplits);
    }
  }, [splitType, splitWith.length, amount]);

  const handleSplitWithChange = (friend) => {
    setSplitWith((prev) => {
      const next = prev.includes(friend) 
        ? prev.filter((f) => f !== friend) 
        : [...prev, friend];
      return next;
    });
  };

  const handleSplitDataChange = (friend, value) => {
    setSplitsData(prev => ({
      ...prev,
      [friend]: value
    }));
  };

  const getSplitTotal = () => {
    return splitWith.reduce((sum, f) => sum + parseFloat(splitsData[f] || 0), 0);
  };

  const isStep1Valid = title.trim().length > 0 && parseFloat(amount) > 0;
  const isStep2Valid = splitWith.length > 0;
  
  const isValidForm = () => {
    if (!isStep1Valid || !isStep2Valid) return false;
    
    if (splitType === 'percentage') {
      return Math.abs(getSplitTotal() - 100) < 0.1;
    } else if (splitType === 'exact') {
      return Math.abs(getSplitTotal() - parseFloat(amount)) < 0.01;
    }
    return true;
  };

  const handleQuickSave = (e) => {
    e.preventDefault();
    if (!isStep1Valid) return;
    
    addExpense({
      title,
      amount: parseFloat(amount),
      date,
      category,
      paidBy: 'You',
      splitWith: ['You'],
      splitType: 'equal',
      splitsData: {},
      groupId: groupId || null
    });
    navigate('/dashboard');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidForm()) return;
    
    let finalSplitsData = {};
    if (splitType === 'percentage') {
      splitWith.forEach(f => {
        finalSplitsData[f] = (parseFloat(amount) * (parseFloat(splitsData[f]) / 100)).toFixed(2);
      });
    } else if (splitType === 'exact') {
      splitWith.forEach(f => {
        finalSplitsData[f] = parseFloat(splitsData[f]).toFixed(2);
      });
    }

    addExpense({
      title,
      amount: parseFloat(amount),
      date,
      category,
      paidBy,
      splitWith,
      splitType: splitType === 'equal' ? 'equal' : 'exact',
      splitsData: finalSplitsData,
      groupId: groupId || null
    });
    
    navigate('/dashboard');
  };

  const slideVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <div className="flex-1 p-6 md:p-16 max-w-3xl mx-auto w-full bg-transparent flex flex-col pb-32 md:pb-16 min-h-[100dvh]">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
          className="hidden md:flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm uppercase tracking-widest font-medium"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <ArrowLeft size={16} />
          {step > 1 ? 'Back' : 'Cancel'}
        </button>
 
        {/* Progress Dots */}
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${step === i ? 'bg-brand-porcelain w-6' : step > i ? 'bg-white/50' : 'bg-brand-graphite/40'}`} 
            />
          ))}
        </div>
      </div>
 
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <motion.div 
              key="step1"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-8 w-full"
            >
              <div>
                <h1 className="text-5xl md:text-7xl text-white font-normal tracking-tight mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  The Basics.
                </h1>
                <p className="text-white/50 text-lg font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                  What did you pay for, and how much was it?
                </p>
              </div>
 
              <div className="flex flex-col gap-6">
                <div className="group">
                  <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>What was this for?</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Dinner at the space station"
                    className="w-full bg-transparent border-b border-border pb-4 text-3xl text-white placeholder-white/20 focus:outline-none focus:border-brand-porcelain transition-colors"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                    autoFocus
                  />
                </div>
 
                <div className="group mt-4">
                  <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Amount</label>
                  <div className="relative">
                    <span className="absolute left-0 top-0 bottom-4 flex items-center text-3xl text-white/50 font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>₹</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full bg-transparent border-b border-border pb-4 pl-8 text-3xl text-white placeholder-white/20 focus:outline-none focus:border-brand-porcelain transition-colors"
                      style={{ fontFamily: "'Instrument Serif', serif" }}
                    />
                  </div>
                </div>
 
                <div className="grid grid-cols-2 gap-8 mt-4">
                  <div className="group">
                    <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Date</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-transparent border-b border-border pb-4 text-xl text-white focus:outline-none focus:border-brand-porcelain transition-colors cursor-pointer"
                      style={{ fontFamily: "'Inter', sans-serif", colorScheme: "dark" }}
                    />
                  </div>
 
                  <div className="group">
                    <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-transparent border-b border-border pb-4 text-xl text-white focus:outline-none focus:border-brand-porcelain transition-colors appearance-none cursor-pointer"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <option value="food" className="bg-brand-black text-white">Food & Drinks</option>
                      <option value="transport" className="bg-brand-black text-white">Transport</option>
                      <option value="shopping" className="bg-brand-black text-white">Shopping</option>
                      <option value="entertainment" className="bg-brand-black text-white">Entertainment</option>
                      <option value="bills" className="bg-brand-black text-white">Bills & Utilities</option>
                      <option value="other" className="bg-brand-black text-white">Other</option>
                    </select>
                  </div>
                </div>
              </div>
 
              <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center justify-end">
                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                  className="w-full sm:w-auto bg-brand-porcelain text-brand-black px-10 py-4 rounded-full text-sm font-medium hover:scale-[1.02] transition-transform shadow-[0_0_40px_rgba(255,255,250,0.15)] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Next: Split <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
 
          {/* STEP 2: PARTICIPANTS */}
          {step === 2 && (
            <motion.div 
              key="step2"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-8 w-full"
            >
              <div>
                <h1 className="text-5xl md:text-7xl text-white font-normal tracking-tight mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Who's involved?
                </h1>
                <p className="text-white/50 text-lg font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Select the friends you want to split this with.
                </p>
              </div>
 
              <div className="group mt-4 flex-1 flex flex-col min-h-0">
                <div className="relative mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input 
                    type="text" 
                    value={friendSearch}
                    onChange={(e) => setFriendSearch(e.target.value)}
                    placeholder="Search friends..." 
                    className="w-full bg-brand-graphite/20 border border-border rounded-full py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors text-sm"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex flex-col gap-3">
                    {['You', ...availableFriends].filter(f => f.toLowerCase().includes(friendSearch.toLowerCase())).map(person => {
                      const isSelected = splitWith.includes(person);
                      return (
                        <label key={person} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-brand-graphite/40 border-border' : 'bg-transparent border-border/40 hover:border-border'}`}>
                          <div className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center border transition-colors ${isSelected ? 'bg-brand-porcelain border-brand-porcelain text-brand-black' : 'bg-transparent border-border text-transparent'}`}>
                            <svg viewBox="0 0 14 14" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5 7 5.5 10 11.5 3"></polyline></svg>
                          </div>
                          <input type="checkbox" value={person} checked={isSelected} onChange={() => handleSplitWithChange(person)} className="sr-only" />
                          <span className={`text-lg font-medium transition-colors ${isSelected ? 'text-white' : 'text-white/50'}`}>{person}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
 
              <div className="mt-8 flex justify-end">
                {splitWith.length === 1 && splitWith.includes('You') ? (
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isStep2Valid}
                    className="w-full sm:w-auto bg-brand-porcelain text-brand-black px-10 py-4 rounded-full text-sm font-medium hover:scale-[1.02] transition-transform shadow-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <Save size={16} /> Save Expense
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!isStep2Valid}
                    className="w-full sm:w-auto bg-brand-porcelain text-brand-black px-10 py-4 rounded-full text-sm font-medium hover:scale-[1.02] transition-transform shadow-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Next: The Math <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
 
          {/* STEP 3: THE MATH */}
          {step === 3 && (
            <motion.div 
              key="step3"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-8 w-full"
            >
              <div>
                <h1 className="text-5xl md:text-7xl text-white font-normal tracking-tight mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  The Math.
                </h1>
                <p className="text-white/50 text-lg font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                  How do you want to divide ₹{parseFloat(amount).toFixed(2)}?
                </p>
              </div>
 
              <div className="flex flex-col gap-8">
                <div className="group">
                  <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Who Paid?</label>
                  <select 
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full bg-transparent border-b border-border pb-4 text-2xl text-white focus:outline-none focus:border-brand-porcelain transition-colors appearance-none cursor-pointer"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <option value="You" className="bg-brand-black text-white">You</option>
                    {availableFriends.map(friend => <option key={friend} value={friend} className="bg-brand-black text-white">{friend}</option>)}
                  </select>
                </div>
 
                <div className="flex flex-col gap-4 pt-4 border-t border-border/45">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-widest mb-1 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Split Method</label>
                  <div className="flex gap-4 p-2 rounded-2xl border bg-brand-black/50 border-border/45">
                    <button type="button" onClick={() => setSplitType('equal')} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${splitType === 'equal' ? 'bg-brand-porcelain text-brand-black' : 'text-white/50 hover:text-white'}`}>Equal</button>
                    <button type="button" onClick={() => setSplitType('percentage')} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${splitType === 'percentage' ? 'bg-brand-porcelain text-brand-black' : 'text-white/50 hover:text-white'}`}>Percentage</button>
                    <button type="button" onClick={() => setSplitType('exact')} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${splitType === 'exact' ? 'bg-brand-porcelain text-brand-black' : 'text-white/50 hover:text-white'}`}>Exact</button>
                  </div>
                </div>
 
                <div className="flex flex-col gap-3">
                  {splitWith.map(person => (
                    <div key={person} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-brand-graphite/20 border border-border">
                      <span className="text-lg font-medium text-white">{person}</span>
                      
                      {splitType !== 'equal' && (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            value={splitsData[person] || ''} 
                            onChange={(e) => handleSplitDataChange(person, e.target.value)}
                            className="w-28 bg-brand-black border border-border focus:border-brand-porcelain rounded-lg px-4 py-3 text-right text-white focus:outline-none transition-colors"
                            placeholder="0.00"
                          />
                          <span className="text-white/50 font-medium">{splitType === 'percentage' ? '%' : '₹'}</span>
                        </div>
                      )}
                      {splitType === 'equal' && amount && (
                        <span className="text-xl text-white font-medium">₹{(amount / splitWith.length).toFixed(2)}</span>
                      )}
                    </div>
                  ))}
                </div>
 
                {splitType !== 'equal' && splitWith.length > 0 && (
                  <div className={`mt-2 text-sm font-medium p-4 rounded-xl border ${isValidForm() ? 'bg-brand-porcelain/10 border-border/60 text-brand-porcelain' : 'bg-brand-cinnabar/10 border-brand-cinnabar/20 text-brand-cinnabar'}`}>
                    {splitType === 'percentage' 
                      ? `Total: ${getSplitTotal().toFixed(2)}% ${!isValidForm() ? '(Must equal 100%)' : '✓'}`
                      : `Total: ₹${getSplitTotal().toFixed(2)} / ₹${amount || '0.00'} ${!isValidForm() ? '(Must match total)' : '✓'}`
                    }
                  </div>
                )}
              </div>
 
              <div className="mt-8 flex justify-end">
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isValidForm()}
                  className="w-full sm:w-auto bg-brand-porcelain text-brand-black px-10 py-4 rounded-full text-sm font-medium hover:scale-[1.02] transition-transform shadow-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Save size={16} />
                  Save Expense
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
