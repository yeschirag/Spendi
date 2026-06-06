import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFriends } from '../context/FriendContext';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Receipt } from 'lucide-react';
import { CategoryIcon } from '../utils/icons';

export const FriendDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { friends } = useFriends();
  const { expenses, balances } = useAppContext();

  const friend = friends.find(f => f.id === id);

  // Filter expenses that involve this friend
  const mutualExpenses = useMemo(() => {
    if (!friend) return [];
    const friendName = friend.display_name || friend.full_name;
    return expenses.filter(exp => 
      exp.paidBy === friendName || 
      (exp.splitWith && exp.splitWith.includes(friendName))
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, friend]);

  if (!friend) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-screen text-white/50">
        <p>Friend not found or loading...</p>
        <button onClick={() => navigate('/friends')} className="mt-4 text-white underline">Go back</button>
      </div>
    );
  }

  const friendName = friend.display_name || friend.full_name;
  
  // Calculate balance with this specific friend
  const owesYou = balances?.owesYou?.find(b => b.name === friendName)?.amount || 0;
  const youOwe = balances?.youOwe?.find(b => b.name === friendName)?.amount || 0;
  
  const isSettled = owesYou === 0 && youOwe === 0;

  return (
    <div className="flex-1 p-6 md:p-16 max-w-5xl mx-auto w-full bg-transparent min-h-[100dvh] pb-32 animate-fade-in">
      <button 
        onClick={() => navigate('/friends')}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 text-sm uppercase tracking-widest font-medium w-fit"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <ArrowLeft size={16} />
        Back to Network
      </button>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl">
            {friend.avatar_url ? (
              <img src={friend.avatar_url} alt={friendName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-white font-medium" style={{ fontFamily: "'Instrument Serif', serif" }}>
                {friendName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-5xl md:text-6xl text-white font-normal tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {friendName}
            </h1>
            <p className="text-white/40 mt-2 font-light tracking-wide">{friend.email}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex-shrink-0 w-full md:w-auto text-center md:text-right">
          <p className="text-xs text-white/40 uppercase tracking-widest font-medium mb-2">Net Balance</p>
          {isSettled ? (
            <p className="text-2xl text-white/50 font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Settled Up</p>
          ) : youOwe > 0 ? (
            <p className="text-3xl text-red-400 font-normal tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              You owe ₹{youOwe.toFixed(2)}
            </p>
          ) : (
            <p className="text-3xl text-green-400 font-normal tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Owes you ₹{owesYou.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl text-white font-normal tracking-tight mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Mutual Expenses
        </h2>
        
        {mutualExpenses.length === 0 ? (
          <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/5">
            <Receipt size={40} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/40 font-light tracking-wide">No mutual expenses found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {mutualExpenses.map((expense) => (
              <div key={expense.id} onClick={() => navigate(`/edit-expense/${expense.id}`)} className="group flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                    <CategoryIcon slug={expense.category} className="text-white/80 w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-2xl text-white font-normal mb-1 truncate" style={{ fontFamily: "'Instrument Serif', serif" }}>{expense.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-white/40 font-light uppercase tracking-wide">
                      <span>{new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <span>Paid by {expense.paidBy}</span>
                    </div>
                  </div>
                </div>
                <div className="text-3xl text-white font-normal tracking-tight pl-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  ₹{expense.amount.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
