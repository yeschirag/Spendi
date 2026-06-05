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
    <div className="flex-1 p-8 md:p-16 flex flex-col items-center justify-center max-w-7xl mx-auto w-full bg-[#000000] min-h-screen animate-fade-in">
      
      <div className="w-full max-w-2xl">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 text-sm uppercase tracking-widest font-medium"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <h1 className="text-6xl md:text-8xl text-white font-normal tracking-tight mb-16" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Log Expense.
        </h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-10" style={{ fontFamily: "'Inter', sans-serif" }}>
          
          <div className="flex flex-col gap-3">
            <label htmlFor="expenseTitle" className="text-sm font-light text-white/50 tracking-wide uppercase">Title</label>
            <input type="text" id="expenseTitle" placeholder="e.g., Dinner at the Ritz" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-xl" />
          </div>

          <div className="flex flex-col gap-3">
            <label htmlFor="expenseAmount" className="text-sm font-light text-white/50 tracking-wide uppercase">Amount (₹)</label>
            <input type="number" id="expenseAmount" placeholder="0.00" step="0.01" min="0" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-3xl font-medium" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-3">
              <label htmlFor="expenseDate" className="text-sm font-light text-white/50 tracking-wide uppercase">Date</label>
              <input type="date" id="expenseDate" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white transition-colors [color-scheme:dark] text-lg" />
            </div>
            
            <div className="flex flex-col gap-3">
              <label htmlFor="expenseCategory" className="text-sm font-light text-white/50 tracking-wide uppercase">Category</label>
              <select id="expenseCategory" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white transition-colors text-lg">
                <option value="food">Food & Drinks</option>
                <option value="transport">Transport</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
                <option value="bills">Bills & Utilities</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label htmlFor="expensePaidBy" className="text-sm font-light text-white/50 tracking-wide uppercase">Paid By</label>
            <select id="expensePaidBy" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white transition-colors text-lg">
              <option value="You">You</option>
              {friends.map(friend => <option key={friend} value={friend}>{friend}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-sm font-light text-white/50 tracking-wide uppercase">Split With</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-3 cursor-pointer group bg-white/5 px-6 py-4 rounded-full border border-white/5 hover:border-white/20 transition-all">
                <div className={`w-5 h-5 rounded-sm flex items-center justify-center border transition-colors ${splitWith.includes('You') ? 'bg-white border-white text-black' : 'bg-transparent border-white/30 text-transparent'}`}>
                  <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5 7 5.5 10 11.5 3"></polyline></svg>
                </div>
                <input type="checkbox" value="You" checked={splitWith.includes('You')} onChange={() => handleSplitWithChange('You')} className="sr-only" />
                <span className="text-lg text-white/80 group-hover:text-white transition-colors">You</span>
              </label>
              
              {friends.map(friend => (
                <label key={friend} className="flex items-center gap-3 cursor-pointer group bg-white/5 px-6 py-4 rounded-full border border-white/5 hover:border-white/20 transition-all">
                  <div className={`w-5 h-5 rounded-sm flex items-center justify-center border transition-colors ${splitWith.includes(friend) ? 'bg-white border-white text-black' : 'bg-transparent border-white/30 text-transparent'}`}>
                    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5 7 5.5 10 11.5 3"></polyline></svg>
                  </div>
                  <input type="checkbox" value={friend} checked={splitWith.includes(friend)} onChange={() => handleSplitWithChange(friend)} className="sr-only" />
                  <span className="text-lg text-white/80 group-hover:text-white transition-colors">{friend}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <button type="submit" className="w-full py-5 rounded-full text-xl font-medium bg-white text-black hover:bg-white/90 hover:scale-[1.01] transition-all shadow-2xl">
              Save Expense
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};
