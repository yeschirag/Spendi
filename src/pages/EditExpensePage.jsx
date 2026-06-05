import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';

export const EditExpensePage = () => {
  const { expenses, editExpense, removeExpense } = useAppContext();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  
  useEffect(() => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount.toString());
      setDate(new Date(expense.date).toISOString().split('T')[0]);
    } else {
      navigate('/history');
    }
  }, [id, expenses, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    
    editExpense(id, {
      title,
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
    });
    
    navigate('/history');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      removeExpense(id);
      navigate('/history');
    }
  };

  return (
    <div className="flex-1 p-8 md:p-16 flex flex-col max-w-3xl mx-auto w-full bg-transparent min-h-screen animate-fade-in">
      
      <div className="mb-12 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm uppercase tracking-widest font-medium"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <ArrowLeft size={16} />
          Cancel
        </button>
        <button 
          onClick={handleDelete}
          className="flex items-center gap-2 text-red-500/70 hover:text-red-500 transition-colors text-sm uppercase tracking-widest font-medium"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      <div className="mb-12">
        <h1 className="text-6xl md:text-8xl text-white font-normal tracking-tight mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Edit.
        </h1>
        <p className="text-white/50 text-lg font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>Update the details of your expense.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {/* Title Input */}
        <div className="group">
          <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>What was this for?</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Dinner at the space station"
            className="w-full bg-transparent border-b border-white/20 pb-4 text-3xl text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
            style={{ fontFamily: "'Instrument Serif', serif" }}
            autoFocus
          />
        </div>

        {/* Amount Input */}
        <div className="group mt-4">
          <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Amount</label>
          <div className="relative">
            <span className="absolute left-0 top-0 bottom-4 flex items-center text-3xl text-white/50 font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>₹</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent border-b border-white/20 pb-4 pl-8 text-3xl text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            />
          </div>
        </div>

        {/* Date Input */}
        <div className="group mt-4">
          <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Date</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 pb-4 text-xl text-white focus:outline-none focus:border-white transition-colors"
            style={{ fontFamily: "'Inter', sans-serif", colorScheme: "dark" }}
          />
        </div>
        
        {/* Note on disabled fields */}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mt-4">
          <p className="text-sm text-white/40 tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
            Note: Category, Paid By, and Splits cannot be edited for an existing expense in this version.
          </p>
        </div>

        {/* Submit */}
        <div className="mt-12 flex justify-end">
          <button 
            type="submit"
            disabled={!title || !amount}
            className="bg-white text-black px-10 py-4 rounded-full text-sm font-medium hover:scale-[1.02] transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
};
