import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt } from 'lucide-react';

export const HistoryPage = () => {
  const { expenses } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="flex-1 p-8 md:p-16 flex flex-col max-w-7xl mx-auto w-full bg-transparent min-h-screen animate-fade-in">
      
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

      <div className="mb-12">
        <h1 className="text-6xl md:text-8xl text-white font-normal tracking-tight mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
          The Ledger.
        </h1>
        <p className="text-white/50 text-lg font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>A chronological history of all expenses.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col gap-2">
          {expenses.length === 0 ? (
            <div className="text-center py-20">
              <Receipt size={48} className="mx-auto text-white/20 mb-6" />
              <p className="text-white/40 mb-8 text-lg font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>No expenses recorded yet in the ledger.</p>
              <button 
                className="bg-white text-black px-8 py-3 rounded-full text-sm font-medium hover:scale-[1.02] transition-transform shadow-xl"
                onClick={() => navigate('/add-expense')}
              >
                Log your first expense
              </button>
            </div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-white/10 group">
                <div className="flex-1 min-w-0 pr-8">
                  <h4 className="text-2xl text-white font-normal mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>{expense.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 font-light tracking-wide uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <span>{new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="text-white/20">•</span>
                    <span className="capitalize">{expense.category}</span>
                    <span className="text-white/20">•</span>
                    <span>Paid by {expense.paidBy}</span>
                    <span className="text-white/20">•</span>
                    <span>Split with {expense.splitWith?.length > 0 ? expense.splitWith.join(', ') : 'No one'}</span>
                  </div>
                </div>
                <div className="text-4xl text-white font-normal mt-4 md:mt-0 tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  ₹{expense.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
