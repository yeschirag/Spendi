import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { CategoryModal } from './CategoryModal';

export const ExpenseModal = ({ onClose }) => {
  const { friends, groups, categories: contextCategories, addExpense } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('food');
  const [searchParams] = useSearchParams();
  const [groupId, setGroupId] = useState(searchParams.get('group') || '');
  const [paidBy, setPaidBy] = useState('You');
  const [splitWith, setSplitWith] = useState(['You']);

  const handleSplitWithChange = (friend) => {
    setSplitWith((prev) => 
      prev.includes(friend) 
        ? prev.filter((f) => f !== friend) 
        : [...prev, friend]
    );
  };

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleCategoryChange = (e) => {
    if (e.target.value === 'ADD_NEW') {
      setShowCategoryModal(true);
    } else {
      setCategory(e.target.value);
    }
  };

  const handleCreateCategory = async (newCategory) => {
    try {
      const db = await import('../../services/db');
      const created = await db.addCustomCategory(newCategory.name, newCategory.icon, newCategory.color);
      const { refreshData } = useAppContext();
      if (refreshData) await refreshData();
      setCategory(created.slug);
    } catch (err) {
      console.error(err);
    }
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
      splitWith,
      groupId: groupId || null
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-fade-rise">
        
        <div className="flex items-center justify-between p-8 border-b border-white/5 shrink-0">
          <h3 className="text-4xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Add Expense.</h3>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 overflow-y-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="expenseTitle" className="text-sm font-light text-white/50 tracking-wide uppercase">Title</label>
            <input type="text" id="expenseTitle" placeholder="e.g., Dinner at the Ritz" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="expenseAmount" className="text-sm font-light text-white/50 tracking-wide uppercase">Amount (₹)</label>
            <input type="number" id="expenseAmount" placeholder="0.00" step="0.01" min="0" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-xl font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="expenseDate" className="text-sm font-light text-white/50 tracking-wide uppercase">Date</label>
              <input type="date" id="expenseDate" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white transition-colors [color-scheme:dark]" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="expenseCategory" className="text-sm font-light text-white/50 tracking-wide uppercase">Category</label>
              <select id="expenseCategory" value={category} onChange={handleCategoryChange} className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white transition-colors">
                {(contextCategories && contextCategories.length > 0) ? contextCategories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                )) : (
                  <>
                    <option value="food">Food & Drinks</option>
                    <option value="transport">Transport</option>
                    <option value="shopping">Shopping</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="bills">Bills & Utilities</option>
                    <option value="other">Other</option>
                  </>
                )}
                <option value="ADD_NEW">+ Add Custom Category</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="expenseGroup" className="text-sm font-light text-white/50 tracking-wide uppercase">Group / Trip (Optional)</label>
            <select id="expenseGroup" value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white transition-colors">
              <option value="">None (Personal / Friends)</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="expensePaidBy" className="text-sm font-light text-white/50 tracking-wide uppercase">Paid By</label>
            <select id="expensePaidBy" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white transition-colors">
              <option value="You">You</option>
              {friends.map(friend => <option key={friend} value={friend}>{friend}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-light text-white/50 tracking-wide uppercase">Split With</label>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-3 cursor-pointer group bg-white/5 px-4 py-2.5 rounded-full border border-white/5 hover:border-white/20 transition-all">
                <div className={`w-4 h-4 rounded-sm flex items-center justify-center border transition-colors ${splitWith.includes('You') ? 'bg-white border-white text-black' : 'bg-transparent border-white/30 text-transparent'}`}>
                  <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5 7 5.5 10 11.5 3"></polyline></svg>
                </div>
                <input type="checkbox" value="You" checked={splitWith.includes('You')} onChange={() => handleSplitWithChange('You')} className="sr-only" />
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">You</span>
              </label>
              
              {friends.map(friend => (
                <label key={friend} className="flex items-center gap-3 cursor-pointer group bg-white/5 px-4 py-2.5 rounded-full border border-white/5 hover:border-white/20 transition-all">
                  <div className={`w-4 h-4 rounded-sm flex items-center justify-center border transition-colors ${splitWith.includes(friend) ? 'bg-white border-white text-black' : 'bg-transparent border-white/30 text-transparent'}`}>
                    <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5 7 5.5 10 11.5 3"></polyline></svg>
                  </div>
                  <input type="checkbox" value={friend} checked={splitWith.includes(friend)} onChange={() => handleSplitWithChange(friend)} className="sr-only" />
                  <span className="text-sm text-white/80 group-hover:text-white transition-colors">{friend}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-6 shrink-0">
            <button type="button" className="px-6 py-3 rounded-full text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-8 py-3 rounded-full text-sm font-medium bg-white text-black hover:bg-white/90 hover:scale-[1.02] transition-all shadow-xl">Add Expense</button>
          </div>
          
        </form>
      </div>
      
      {showCategoryModal && (
        <CategoryModal 
          onClose={() => {
            setShowCategoryModal(false);
            if (category === 'ADD_NEW') setCategory('food');
          }} 
          onSubmit={handleCreateCategory} 
        />
      )}
    </div>
  );
};
