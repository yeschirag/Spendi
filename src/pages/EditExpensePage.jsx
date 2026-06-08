import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Edit2 } from 'lucide-react';

export const EditExpensePage = () => {
  const { expenses, friends, editExpense, removeExpense } = useAppContext();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('other');
  const [paidBy, setPaidBy] = useState('You');
  const [splitWith, setSplitWith] = useState(['You']);
  
  const [splitType, setSplitType] = useState('equal');
  const [splitsData, setSplitsData] = useState({});

  useEffect(() => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount.toString());
      setDate(new Date(expense.date).toISOString().split('T')[0]);
      setCategory(expense.category || 'other');
      setPaidBy(expense.paidBy || 'You');
      setSplitWith(expense.splitWith || ['You']);
      setSplitType(expense.splitType || 'equal');
      
      if (expense.splitType === 'percentage' && expense.splitsData) {
        // Reverse calculate percentage from amounts
        const restoredPct = {};
        Object.keys(expense.splitsData).forEach(k => {
           restoredPct[k] = ((expense.splitsData[k] / expense.amount) * 100).toFixed(2);
        });
        setSplitsData(restoredPct);
      } else if (expense.splitType === 'exact' && expense.splitsData) {
        setSplitsData(expense.splitsData);
      }
    } else {
      navigate('/history');
    }
  }, [id, expenses, navigate]);

  useEffect(() => {
    if (!isEditing) return;
    // Auto-calculate defaults when type changes
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
  }, [splitType, splitWith.length, amount, isEditing]);

  const handleSplitWithChange = (friend) => {
    if (!isEditing) return;
    setSplitWith((prev) => {
      const next = prev.includes(friend) 
        ? prev.filter((f) => f !== friend) 
        : [...prev, friend];
      return next;
    });
  };

  const handleSplitDataChange = (friend, value) => {
    if (!isEditing) return;
    setSplitsData(prev => ({
      ...prev,
      [friend]: value
    }));
  };

  const getSplitTotal = () => {
    return splitWith.reduce((sum, f) => sum + parseFloat(splitsData[f] || 0), 0);
  };

  const isValidForm = () => {
    if (!title || !amount || splitWith.length === 0) return false;
    
    if (splitType === 'percentage') {
      return Math.abs(getSplitTotal() - 100) < 0.1;
    } else if (splitType === 'exact') {
      return Math.abs(getSplitTotal() - parseFloat(amount)) < 0.01;
    }
    return true;
  };

  const handleSubmit = async (e) => {
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

    await editExpense(id, {
      title,
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      category,
      paidBy,
      splitWith,
      splitType: splitType === 'equal' ? 'equal' : 'exact',
      splitsData: finalSplitsData
    });
    
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      removeExpense(id);
      navigate('/history');
    }
  };

  return (
    <div className="flex-1 p-6 md:p-16 flex flex-col max-w-7xl mx-auto w-full bg-transparent min-h-screen animate-fade-in pb-32 md:pb-16">
      
      <div className="mb-12 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="hidden md:flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm uppercase tracking-widest font-medium"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <ArrowLeft size={16} />
          {isEditing ? 'Cancel Edit' : 'Back'}
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

      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-12">
          <h1 className="text-5xl md:text-8xl text-white font-normal tracking-tight mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
            {isEditing ? 'Edit.' : 'Details.'}
          </h1>
          <p className="text-white/50 text-lg font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
            {isEditing ? 'Update the details of your expense.' : 'View expense details.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          <div className="group">
            <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>What was this for?</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Dinner at the space station"
              className={`w-full bg-transparent border-b pb-4 text-3xl text-white placeholder-white/20 focus:outline-none transition-colors ${isEditing ? 'border-white/20 focus:border-white' : 'border-transparent cursor-default'}`}
              style={{ fontFamily: "'Instrument Serif', serif" }}
              readOnly={!isEditing}
              autoFocus={isEditing}
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
                className={`w-full bg-transparent border-b pb-4 pl-8 text-3xl text-white placeholder-white/20 focus:outline-none transition-colors ${isEditing ? 'border-white/20 focus:border-white' : 'border-transparent cursor-default'}`}
                style={{ fontFamily: "'Instrument Serif', serif" }}
                readOnly={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div className="group">
              <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full bg-transparent border-b pb-4 text-xl text-white focus:outline-none transition-colors ${isEditing ? 'border-white/20 focus:border-white' : 'border-transparent cursor-default'}`}
                style={{ fontFamily: "'Inter', sans-serif", colorScheme: "dark" }}
                readOnly={!isEditing}
              />
            </div>

            <div className="group">
              <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full bg-transparent border-b pb-4 text-xl text-white focus:outline-none transition-colors appearance-none ${isEditing ? 'border-white/20 focus:border-white cursor-pointer' : 'border-transparent cursor-default pointer-events-none'}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
                disabled={!isEditing}
              >
                <option value="food" className="bg-black text-white">Food & Drinks</option>
                <option value="transport" className="bg-black text-white">Transport</option>
                <option value="shopping" className="bg-black text-white">Shopping</option>
                <option value="entertainment" className="bg-black text-white">Entertainment</option>
                <option value="bills" className="bg-black text-white">Bills & Utilities</option>
                <option value="other" className="bg-black text-white">Other</option>
              </select>
            </div>
          </div>

          <div className="group mt-4">
            <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Who Paid?</label>
            <select 
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className={`w-full bg-transparent border-b pb-4 text-xl text-white focus:outline-none transition-colors appearance-none ${isEditing ? 'border-white/20 focus:border-white cursor-pointer' : 'border-transparent cursor-default pointer-events-none'}`}
              style={{ fontFamily: "'Inter', sans-serif" }}
              disabled={!isEditing}
            >
              <option value="You" className="bg-black text-white">You</option>
              {friends.map(friend => <option key={friend} value={friend} className="bg-black text-white">{friend}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/5 pt-6 mt-4">
            <label className="text-sm font-light text-white/50 tracking-wide uppercase">Split Method</label>
            <div className={`flex gap-4 p-2 rounded-2xl border transition-colors ${isEditing ? 'bg-black/50 border-white/5' : 'bg-transparent border-transparent'}`}>
              <button type="button" disabled={!isEditing} onClick={() => setSplitType('equal')} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${splitType === 'equal' ? (isEditing ? 'bg-white text-black' : 'text-white') : 'text-white/50 hover:text-white disabled:hover:text-white/50'}`}>Equal</button>
              <button type="button" disabled={!isEditing} onClick={() => setSplitType('percentage')} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${splitType === 'percentage' ? (isEditing ? 'bg-white text-black' : 'text-white') : 'text-white/50 hover:text-white disabled:hover:text-white/50'}`}>Percentage</button>
              <button type="button" disabled={!isEditing} onClick={() => setSplitType('exact')} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${splitType === 'exact' ? (isEditing ? 'bg-white text-black' : 'text-white') : 'text-white/50 hover:text-white disabled:hover:text-white/50'}`}>Exact Amount</button>
            </div>
          </div>

          <div className="group mt-4">
            <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-4 transition-colors group-focus-within:text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Participants</label>
            <div className="flex flex-col gap-3">
              {['You', ...friends].map(person => {
                const isSelected = splitWith.includes(person);
                return (
                  <div key={person} className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${isSelected ? (isEditing ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/10') : 'hidden'}`}>
                    <label className={`flex items-center gap-4 flex-1 ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}>
                      {isEditing && (
                        <div className={`w-5 h-5 shrink-0 rounded-sm flex items-center justify-center border transition-colors ${isSelected ? 'bg-white border-white text-black' : 'bg-transparent border-white/30 text-transparent'}`}>
                          <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5 7 5.5 10 11.5 3"></polyline></svg>
                        </div>
                      )}
                      <input type="checkbox" disabled={!isEditing} value={person} checked={isSelected} onChange={() => handleSplitWithChange(person)} className="sr-only" />
                      <span className={`text-base font-medium transition-colors ${isSelected ? 'text-white' : 'text-white/50'}`}>{person}</span>
                    </label>

                    {isSelected && splitType !== 'equal' && (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          min="0"
                          value={splitsData[person] || ''} 
                          onChange={(e) => handleSplitDataChange(person, e.target.value)}
                          className={`w-24 bg-black border rounded-lg px-3 py-2 text-right text-white focus:outline-none transition-colors ${isEditing ? 'border-white/20 focus:border-white' : 'border-transparent'}`}
                          placeholder="0.00"
                          disabled={!isEditing}
                        />
                        <span className="text-white/50 font-medium">{splitType === 'percentage' ? '%' : '₹'}</span>
                      </div>
                    )}
                    {isSelected && splitType === 'equal' && amount && (
                      <span className="text-white/50 font-medium">₹{(amount / splitWith.length).toFixed(2)}</span>
                    )}
                  </div>
                );
              })}
              
              {/* If editing, show unselected friends so they can be added */}
              {isEditing && ['You', ...friends].filter(f => !splitWith.includes(f)).map(person => (
                <div key={person} className="flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all bg-transparent border-white/5">
                  <label className="flex items-center gap-4 cursor-pointer flex-1">
                    <div className="w-5 h-5 shrink-0 rounded-sm flex items-center justify-center border transition-colors bg-transparent border-white/30 text-transparent">
                      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5 7 5.5 10 11.5 3"></polyline></svg>
                    </div>
                    <input type="checkbox" value={person} checked={false} onChange={() => handleSplitWithChange(person)} className="sr-only" />
                    <span className="text-base font-medium text-white/50">{person}</span>
                  </label>
                </div>
              ))}
            </div>

            {isEditing && splitType !== 'equal' && splitWith.length > 0 && (
              <div className={`mt-2 text-sm font-medium p-4 rounded-xl border ${isValidForm() ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {splitType === 'percentage' 
                  ? `Total: ${getSplitTotal().toFixed(2)}% ${!isValidForm() ? '(Must equal 100%)' : '✓'}`
                  : `Total: ₹${getSplitTotal().toFixed(2)} / ₹${amount || '0.00'} ${!isValidForm() ? '(Must match total)' : '✓'}`
                }
              </div>
            )}
          </div>

          <div className="mt-12 flex justify-end">
            {isEditing ? (
              <button 
                type="submit"
                disabled={!isValidForm()}
                className="bg-white text-black px-10 py-4 rounded-full text-sm font-medium hover:scale-[1.02] transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Save Changes
              </button>
            ) : (
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(true);
                }}
                className="bg-white/10 text-white px-10 py-4 rounded-full text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <Edit2 size={16} />
                Edit Expense
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
