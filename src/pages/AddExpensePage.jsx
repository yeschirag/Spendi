import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, Delete } from 'lucide-react';
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
      const equalPct = (100 / splitWith.length).toFixed(0);
      const initialSplits = {};
      splitWith.forEach(f => initialSplits[f] = equalPct);
      setSplitsData(initialSplits);
    } else if (splitType === 'exact') {
      const equalAmt = (parseFloat(amount || 0) / splitWith.length).toFixed(2);
      const initialSplits = {};
      splitWith.forEach(f => initialSplits[f] = equalAmt);
      setSplitsData(initialSplits);
    }
  }, [splitType, splitWith.length, amount]);

  const handleNumpadTap = (val) => {
    setAmount(prev => {
      if (prev.includes('.') && prev.split('.')[1].length >= 2) {
        return prev;
      }
      if (prev === '' || prev === '0') {
        if (val === '.') return '0.';
        return val;
      }
      if (val === '.' && prev.includes('.')) return prev;
      return prev + val;
    });
  };

  const handleNumpadDelete = () => {
    setAmount(prev => {
      if (prev.length <= 1) return '';
      return prev.slice(0, -1);
    });
  };

  const handleNumpadClear = () => {
    setAmount('');
  };

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

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
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

  const categoriesList = [
    { value: 'food', label: 'Food & Drinks', emoji: '🍔' },
    { value: 'transport', label: 'Transport', emoji: '🚗' },
    { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
    { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
    { value: 'bills', label: 'Bills & Utilities', emoji: '⚡' },
    { value: 'other', label: 'Other', emoji: '📦' }
  ];

  const slideVariants = {
    hidden: { x: 40, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 }
  };

  return (
    <div className="flex-1 p-5 pt-20 md:p-16 max-w-2xl mx-auto w-full bg-transparent flex flex-col pb-32 md:pb-16 min-h-[100dvh]">
      {/* Step Header */}
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs uppercase tracking-widest font-semibold"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <ArrowLeft size={16} />
          {step > 1 ? 'Back' : 'Cancel'}
        </button>
 
        {/* Progress indicator */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${step === i ? 'bg-white w-5' : step > i ? 'bg-white/50' : 'bg-white/10'}`} 
            />
          ))}
        </div>
      </div>
 
      <div className="flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* STEP 1: BASICS & NUMPAD */}
          {step === 1 && (
            <motion.div 
              key="step1"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6 w-full"
            >
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl text-white font-semibold tracking-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Enter Amount.
                </h1>
                <p className="text-white/40 text-xs md:text-sm font-medium uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>
                  How much was the bill?
                </p>
              </div>

              {/* Centered Amount Display */}
              <div className="flex items-center justify-center py-6 border-b border-white/5 relative">
                <span className="text-2xl text-[var(--color-text-muted)] mr-1 font-mono font-semibold">₹</span>
                <span className="text-5xl font-bold tracking-tight text-white font-mono min-h-[48px]">
                  {amount || '0.00'}
                </span>
              </div>

              {/* Custom Numpad Grid */}
              <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto w-full mt-2">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumpadTap(num)}
                    className="h-[60px] bg-white/5 hover:bg-white/10 active:scale-[0.88] active:bg-[var(--color-accent-muted)] rounded-2xl text-lg font-bold text-white transition-all font-mono"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleNumpadTap('.')}
                  className="h-[60px] bg-white/5 hover:bg-white/10 active:scale-[0.88] rounded-2xl text-lg font-bold text-white transition-all font-mono"
                >
                  .
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadTap('0')}
                  className="h-[60px] bg-white/5 hover:bg-white/10 active:scale-[0.88] rounded-2xl text-lg font-bold text-white transition-all font-mono"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleNumpadDelete}
                  onDoubleClick={handleNumpadClear}
                  className="h-[60px] bg-white/5 hover:bg-white/10 active:scale-[0.88] rounded-2xl flex items-center justify-center text-white/50 hover:text-white transition-all"
                >
                  <Delete size={20} />
                </button>
              </div>

              {/* Title Input (Static label, 16px text to prevent zoom) */}
              <div className="group mt-4 flex flex-col">
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)" }}>What was this for?</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's it for?"
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-4 py-3 text-[16px] text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                />
              </div>

              {/* Categories horizontal pills */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>Category</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {categoriesList.map(cat => {
                    const isSelected = category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all ${
                          isSelected 
                            ? 'bg-[var(--color-accent-muted)] border-[var(--color-accent)] text-[var(--color-accent)]' 
                            : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white hover:border-white/30 bg-transparent'
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date selection field */}
              <div className="group flex flex-col mt-2">
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)" }}>Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-4 py-3 text-[16px] text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors cursor-pointer"
                  style={{ fontFamily: "var(--font-body)", colorScheme: "dark" }}
                />
              </div>

              <div className="mt-6">
                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                  className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white py-4 rounded-xl text-sm font-semibold hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 active:scale-95"
                  style={{ fontFamily: "var(--font-body)" }}
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
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6 w-full"
            >
              <div>
                <h1 className="text-4xl md:text-5xl text-white font-semibold tracking-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Who's sharing?
                </h1>
                <p className="text-white/40 text-xs md:text-sm font-medium uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>
                  Select friends involved in this bill.
                </p>
              </div>
 
              <div className="flex flex-col gap-4 mt-2">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input 
                    type="text" 
                    value={friendSearch}
                    onChange={(e) => setFriendSearch(e.target.value)}
                    placeholder="Search friends..." 
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] transition-colors text-xs"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2">
                  {['You', ...availableFriends].filter(f => f.toLowerCase().includes(friendSearch.toLowerCase())).map(person => {
                    const isSelected = splitWith.includes(person);
                    return (
                      <label key={person} className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-white/5 border-[var(--color-border)]' : 'bg-transparent border-transparent hover:border-white/5'}`}>
                        <div className={`w-5 h-5 shrink-0 rounded-md flex items-center justify-center border transition-colors ${isSelected ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white' : 'bg-transparent border-[var(--color-border)] text-transparent'}`}>
                          <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5 7 5.5 10 11.5 3"></polyline></svg>
                        </div>
                        <input type="checkbox" value={person} checked={isSelected} onChange={() => handleSplitWithChange(person)} className="sr-only" />
                        <span className={`text-md font-semibold transition-colors ${isSelected ? 'text-white' : 'text-white/40'}`}>{person}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
 
              <div className="mt-6 flex gap-3">
                {splitWith.length === 1 && splitWith.includes('You') ? (
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isStep2Valid}
                    className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white py-4 rounded-xl text-sm font-semibold hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 active:scale-95"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <Save size={16} /> Save Expense
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!isStep2Valid}
                    className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white py-4 rounded-xl text-sm font-semibold hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 active:scale-95"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Next: Split Math <ArrowRight size={16} />
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
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6 w-full"
            >
              <div>
                <h1 className="text-4xl md:text-5xl text-white font-semibold tracking-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Split Math.
                </h1>
                <p className="text-white/40 text-xs md:text-sm font-medium uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>
                  How should we divide ₹{parseFloat(amount).toFixed(2)}?
                </p>
              </div>
 
              <div className="flex flex-col gap-6">
                {/* Payer selector */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)" }}>Who Paid?</label>
                  <select 
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-4 py-3 text-[16px] text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors appearance-none cursor-pointer"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <option value="You" className="bg-brand-black text-white">You</option>
                    {availableFriends.map(friend => <option key={friend} value={friend} className="bg-brand-black text-white">{friend}</option>)}
                  </select>
                </div>
 
                {/* Mode Selector tabs */}
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>Split Mode</label>
                  <div className="flex gap-2 p-1.5 rounded-2xl border bg-white/5 border-[var(--color-border)]">
                    <button type="button" onClick={() => setSplitType('equal')} className={`flex-1 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${splitType === 'equal' ? 'bg-white text-black font-bold shadow' : 'text-white/40 hover:text-white'}`}>Equal</button>
                    <button type="button" onClick={() => setSplitType('percentage')} className={`flex-1 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${splitType === 'percentage' ? 'bg-white text-black font-bold shadow' : 'text-white/40 hover:text-white'}`}>%</button>
                    <button type="button" onClick={() => setSplitType('exact')} className={`flex-1 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${splitType === 'exact' ? 'bg-white text-black font-bold shadow' : 'text-white/40 hover:text-white'}`}>Exact</button>
                  </div>
                </div>
 
                {/* List items for participants */}
                <div className="space-y-3">
                  {splitWith.map(person => (
                    <div key={person} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-[var(--color-border)]">
                      <span className="text-md font-semibold text-white">{person}</span>
                      
                      {splitType !== 'equal' && (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            value={splitsData[person] || ''} 
                            onChange={(e) => handleSplitDataChange(person, e.target.value)}
                            className="w-28 bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-accent)] rounded-lg px-3 py-2 text-right text-white focus:outline-none transition-colors text-[16px] font-mono"
                            placeholder="0.00"
                          />
                          <span className="text-white/40 font-bold">{splitType === 'percentage' ? '%' : '₹'}</span>
                        </div>
                      )}
                      {splitType === 'equal' && amount && (
                        <span className="text-lg text-white font-semibold font-mono">₹{(amount / splitWith.length).toFixed(2)}</span>
                      )}
                    </div>
                  ))}
                </div>
 
                {/* Total validations badge */}
                {splitType !== 'equal' && splitWith.length > 0 && (
                  <div className={`text-xs font-semibold p-4 rounded-xl border ${
                    isValidForm() 
                      ? 'bg-[var(--color-success-muted)] border-[var(--color-success)] text-[var(--color-success)]' 
                      : 'bg-[var(--color-destructive-muted)] border-[var(--color-destructive)] text-[var(--color-destructive)]'
                  }`}>
                    {splitType === 'percentage' 
                      ? `Total Percent: ${getSplitTotal().toFixed(0)}% / 100% ${!isValidForm() ? '(Must equal 100%)' : '✓'}`
                      : `Total split: ₹${getSplitTotal().toFixed(2)} / ₹${parseFloat(amount).toFixed(2)} ${!isValidForm() ? '(Must match bill total)' : '✓'}`
                    }
                  </div>
                )}
              </div>
 
              <div className="mt-6">
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isValidForm()}
                  className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white py-4 rounded-xl text-sm font-semibold hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 active:scale-95"
                  style={{ fontFamily: "var(--font-body)" }}
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
