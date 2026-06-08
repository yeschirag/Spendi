import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, Search, SlidersHorizontal } from 'lucide-react';
import { CategoryIcon } from '../utils/icons';

export const HistoryPage = () => {
  const { expenses } = useAppContext();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('date-desc');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredAndSortedExpenses = useMemo(() => {
    let result = [...expenses];

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.category.toLowerCase().includes(q) ||
        e.paidBy.toLowerCase().includes(q)
      );
    }

    // Category Filter
    if (filterCategory !== 'all') {
      result = result.filter(e => e.category.toLowerCase() === filterCategory.toLowerCase());
    }

    // Sort
    result.sort((a, b) => {
      if (sortOrder === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortOrder === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortOrder === 'amount-desc') return b.amount - a.amount;
      if (sortOrder === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [expenses, searchQuery, sortOrder, filterCategory]);

  const uniqueCategories = ['all', ...new Set(expenses.map(e => e.category.toLowerCase()))];

  return (
    <div className="flex-1 p-6 md:p-16 flex flex-col max-w-7xl mx-auto w-full bg-transparent min-h-screen animate-fade-in pb-32 md:pb-16">
      
      <div className="mb-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="hidden md:flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm uppercase tracking-widest font-medium"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      <div className="mb-8 md:mb-10">
        <h1 className="text-5xl md:text-8xl text-white font-normal tracking-tight mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
          The Ledger.
        </h1>
        <p className="text-white/50 text-base md:text-lg font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>A chronological history of all expenses.</p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            placeholder="Search expenses, categories, or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="relative w-full">
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full appearance-none bg-white/5 border border-white/10 rounded-full py-3 pl-6 pr-12 text-white focus:outline-none focus:border-white/30 transition-colors cursor-pointer capitalize"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat} className="bg-black text-white capitalize">
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <SlidersHorizontal size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>

          <div className="relative w-full">
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full appearance-none bg-white/5 border border-white/10 rounded-full py-3 pl-6 pr-12 text-white focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <option value="date-desc" className="bg-black text-white">Newest First</option>
              <option value="date-asc" className="bg-black text-white">Oldest First</option>
              <option value="amount-desc" className="bg-black text-white">Highest Amount</option>
              <option value="amount-asc" className="bg-black text-white">Lowest Amount</option>
            </select>
            <SlidersHorizontal size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col gap-2">
          {filteredAndSortedExpenses.length === 0 ? (
            <div className="text-center py-20">
              <Receipt size={48} className="mx-auto text-white/20 mb-6" />
              <p className="text-white/40 mb-8 text-lg font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                {expenses.length === 0 ? "No expenses recorded yet in the ledger." : "No expenses match your search."}
              </p>
              {expenses.length === 0 && (
                <button 
                  className="bg-white text-black px-8 py-3 rounded-full text-sm font-medium hover:scale-[1.02] transition-transform shadow-xl"
                  onClick={() => navigate('/add-expense')}
                >
                  Log your first expense
                </button>
              )}
            </div>
          ) : (
            filteredAndSortedExpenses.map((expense) => (
              <div key={expense.id} onClick={() => navigate(`/edit-expense/${expense.id}`)} className="relative group flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 mb-4 rounded-3xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-lg w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0 md:pr-8 w-full">
                  <div className="hidden sm:flex w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 items-center justify-center border border-white/10 shadow-inner">
                    <CategoryIcon slug={expense.category} className="text-white/80 w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <h4 className="text-xl md:text-2xl text-white font-normal mb-1 md:mb-2 tracking-tight truncate w-full" style={{ fontFamily: "'Instrument Serif', serif" }}>{expense.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs text-white/40 font-light tracking-wide uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                      <span className="whitespace-nowrap">{new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20 shrink-0"></span>
                      <span className="capitalize text-white/60 whitespace-nowrap">{expense.category}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20 shrink-0"></span>
                      <span className="text-white/60 truncate max-w-[80px] sm:max-w-none">By {expense.paidBy}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20 shrink-0"></span>
                      <span className="truncate max-w-[80px] sm:max-w-none">With {expense.splitWith?.length > 0 ? expense.splitWith.join(', ') : 'No one'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 mt-4 md:mt-0 w-full md:w-auto">
                  <div className="text-3xl md:text-4xl text-white font-normal tracking-tight truncate" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    ₹{expense.amount.toFixed(0)}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/edit-expense/${expense.id}`); }} 
                    className="md:opacity-0 group-hover:opacity-100 transition-all duration-300 p-2.5 md:p-3 bg-white/5 hover:bg-white/20 rounded-full text-white/70 hover:text-white border border-white/10 shrink-0"
                    title="Edit Expense"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
