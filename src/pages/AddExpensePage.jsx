import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const AddExpensePage = () => {
  const { friends, addExpense } = useAppContext();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('food');
  const [paidBy, setPaidBy] = useState('You');
  const [splitWith, setSplitWith] = useState(['You']);

  const handleSplitWithChange = (friend) => {
    setSplitWith((prev) => 
      prev.includes(friend) 
        ? prev.filter((f) => f !== friend) 
        : [...prev, friend]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount || splitWith.length === 0) return;
    
    addExpense({
      title,
      amount: parseFloat(amount),
      date,
      category,
      paidBy,
      splitWith
    });
    
    navigate('/dashboard');
  };

  return (
    <div className="flex-1 p-6 md:p-16 max-w-7xl mx-auto w-full bg-transparent animate-fade-in flex flex-col pb-32 md:pb-16">
      
      <div className="mb-12">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm uppercase tracking-widest font-medium"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 flex-1">
        
        {/* Left Column: Dynamic Receipt Summary */}
        <div className="w-full lg:w-1/3 flex flex-col relative">
          <div className="sticky top-32">
            <h1 className="text-6xl md:text-7xl text-white font-normal tracking-tight mb-8" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Log Expense.
            </h1>
            
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col gap-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div className="border-b border-white/10 pb-6">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-medium">Amount</p>
                  <p className="text-5xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    ₹{amount ? parseFloat(amount).toFixed(2) : '0.00'}
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40 font-light">Title</span>
                  <span className="text-white truncate max-w-[150px]">{title || '—'}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40 font-light">Category</span>
                  <span className="text-white capitalize">{category}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40 font-light">Date</span>
                  <span className="text-white">{date}</span>
                </div>

                <div className="border-t border-white/10 pt-6 mt-2">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-medium">Split Details</p>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-white/40 font-light">Paid By</span>
                    <span className="text-white">{paidBy}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40 font-light">Split With</span>
                    <div className="flex flex-col items-end gap-1">
                      {splitWith.length === 0 ? (
                        <span className="text-white/20 italic">None</span>
                      ) : (
                        splitWith.map(person => (
                          <span key={person} className="text-white">{person}</span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: Form Fields */}
        <div className="flex-1 w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8" style={{ fontFamily: "'Inter', sans-serif" }}>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
              <div className="flex flex-col gap-3">
                <label htmlFor="expenseTitle" className="text-sm font-light text-white/50 tracking-wide uppercase">Title</label>
                <input type="text" id="expenseTitle" placeholder="e.g., Dinner at the Ritz" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-lg" />
              </div>

              <div className="flex flex-col gap-3">
                <label htmlFor="expenseAmount" className="text-sm font-light text-white/50 tracking-wide uppercase">Amount (₹)</label>
                <input type="number" id="expenseAmount" placeholder="0.00" step="0.01" min="0" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-3xl font-medium" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <label htmlFor="expenseDate" className="text-sm font-light text-white/50 tracking-wide uppercase">Date</label>
                  <input type="date" id="expenseDate" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white transition-colors [color-scheme:dark] text-base" />
                </div>
                
                <div className="flex flex-col gap-3">
                  <label htmlFor="expenseCategory" className="text-sm font-light text-white/50 tracking-wide uppercase">Category</label>
                  <select id="expenseCategory" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white transition-colors text-base">
                    <option value="food">Food & Drinks</option>
                    <option value="transport">Transport</option>
                    <option value="shopping">Shopping</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="bills">Bills & Utilities</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
              <h3 className="text-2xl text-white font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Payment Details</h3>
              
              <div className="flex flex-col gap-3">
                <label htmlFor="expensePaidBy" className="text-sm font-light text-white/50 tracking-wide uppercase">Who Paid?</label>
                <select id="expensePaidBy" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white transition-colors text-base">
                  <option value="You">You</option>
                  {friends.map(friend => <option key={friend} value={friend}>{friend}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
                <label className="text-sm font-light text-white/50 tracking-wide uppercase">Split With</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group bg-white/5 px-5 py-3 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                    <div className={`w-5 h-5 rounded-sm flex items-center justify-center border transition-colors ${splitWith.includes('You') ? 'bg-white border-white text-black' : 'bg-transparent border-white/30 text-transparent'}`}>
                      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5 7 5.5 10 11.5 3"></polyline></svg>
                    </div>
                    <input type="checkbox" value="You" checked={splitWith.includes('You')} onChange={() => handleSplitWithChange('You')} className="sr-only" />
                    <span className="text-base text-white/80 group-hover:text-white transition-colors">You</span>
                  </label>
                  
                  {friends.map(friend => (
                    <label key={friend} className="flex items-center gap-3 cursor-pointer group bg-white/5 px-5 py-3 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                      <div className={`w-5 h-5 rounded-sm flex items-center justify-center border transition-colors ${splitWith.includes(friend) ? 'bg-white border-white text-black' : 'bg-transparent border-white/30 text-transparent'}`}>
                        <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5 7 5.5 10 11.5 3"></polyline></svg>
                      </div>
                      <input type="checkbox" value={friend} checked={splitWith.includes(friend)} onChange={() => handleSplitWithChange(friend)} className="sr-only" />
                      <span className="text-base text-white/80 group-hover:text-white transition-colors">{friend}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" disabled={splitWith.length === 0 || !title || !amount} className="w-full py-5 rounded-2xl text-lg font-medium bg-white text-black hover:bg-white/90 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed">
                Save Expense
              </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
};
