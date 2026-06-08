import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Users, Link as LinkIcon, Settings, Copy, Check, Plus } from 'lucide-react';
import * as db from '../services/db';

export const GroupDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppContext();
  
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { group, expenses } = await db.getGroupDetails(id);
        setGroup(group);
        setExpenses(expenses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleInvite = async () => {
    try {
      const token = await db.createInviteLink(id);
      const url = `${window.location.origin}/join/${token}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Basic Group Balance Calculation
  const calculateBalances = () => {
    if (!group || !expenses) return [];
    
    // Simplistic balance sheet: who owes who
    const balances = {};
    const members = {};
    group.group_members.forEach(m => {
      members[m.user_id] = m.profiles.display_name || m.profiles.full_name || m.profiles.email.split('@')[0];
    });

    expenses.forEach(exp => {
      // Find payer
      const payer = exp.expense_participants.find(p => p.amount_paid > 0);
      if (!payer) return;

      exp.expense_participants.forEach(p => {
        if (p.user_id !== payer.user_id && p.amount_owed > 0) {
          const debtorId = p.user_id;
          const creditorId = payer.user_id;
          
          if (!balances[debtorId]) balances[debtorId] = {};
          balances[debtorId][creditorId] = (balances[debtorId][creditorId] || 0) + parseFloat(p.amount_owed);
        }
      });
    });

    // Simplify debts (A owes B, B owes A)
    const finalBalances = [];
    Object.keys(balances).forEach(debtorId => {
      Object.keys(balances[debtorId]).forEach(creditorId => {
        let amount = balances[debtorId][creditorId];
        let reverseAmount = balances[creditorId]?.[debtorId] || 0;
        
        if (amount > reverseAmount) {
          const net = amount - reverseAmount;
          if (net > 0) {
            finalBalances.push({
              debtor: members[debtorId] || 'Unknown',
              creditor: members[creditorId] || 'Unknown',
              amount: net,
              isYouOwe: debtorId === user.id,
              isOwedToYou: creditorId === user.id
            });
          }
        }
      });
    });

    return finalBalances;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse w-8 h-8 bg-white/20 rounded-full"></div></div>;
  }

  if (!group) {
    return <div className="min-h-screen flex flex-col items-center justify-center p-6"><h1 className="text-4xl text-white mb-4">Group Not Found</h1><button onClick={() => navigate('/groups')} className="text-white/50 hover:text-white">Back to Groups</button></div>;
  }

  const groupBalances = calculateBalances();
  const totalSpent = expenses.reduce((acc, exp) => acc + parseFloat(exp.amount), 0);

  return (
    <div className="flex-1 p-6 md:p-16 flex flex-col max-w-7xl mx-auto w-full bg-transparent min-h-screen animate-fade-in pb-32 md:pb-16">
      <button onClick={() => navigate('/groups')} className="hidden md:flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm uppercase tracking-widest font-medium">
          <ArrowLeft size={16} /> Back
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 border-b border-white/5 pb-12">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center shrink-0">
            <Users size={32} className="text-white/50" />
          </div>
          <div>
            <h1 className="text-5xl md:text-6xl mb-2 text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {group.name}
            </h1>
            <p className="text-white/50 text-lg font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
              {group.description || 'No description provided'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button onClick={() => navigate(`/add-expense?group=${group.id}`)} className="flex items-center gap-2 bg-white text-black hover:scale-[1.02] px-5 py-2.5 rounded-full transition-all text-sm font-medium">
            <Plus size={16} strokeWidth={2.5} />
            Add Expense
          </button>
          <button onClick={handleInvite} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-full border border-white/10 transition-all text-sm">
            {copied ? <Check size={16} className="text-green-400" /> : <LinkIcon size={16} />}
            {copied ? 'Link Copied!' : 'Invite Link'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Group Expenses</h2>
          
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <div className="text-5xl text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
              ₹{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-white/50 text-sm font-light uppercase tracking-widest mb-8">Total Group Spend</div>
            
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <div className="text-center py-12 text-white/40">No expenses in this group yet.</div>
              ) : (
                expenses.map(exp => (
                  <div key={exp.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-white text-lg">{exp.title}</span>
                      <span className="text-white/40 text-sm">{new Date(exp.date).toLocaleDateString()} • {exp.category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-xl font-medium">₹{parseFloat(exp.amount).toFixed(2)}</div>
                      <div className="text-white/40 text-xs mt-1">Paid by {exp.expense_participants.find(p => p.amount_paid > 0)?.profiles?.display_name || 'Someone'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Balances</h2>
          
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
            {groupBalances.length === 0 ? (
              <div className="text-center py-8 text-white/40">All settled up!</div>
            ) : (
              groupBalances.map((bal, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{bal.debtor} <span className="text-white/30 font-normal mx-1">owes</span> {bal.creditor}</span>
                  </div>
                  <span className={`font-medium ${bal.isYouOwe ? 'text-red-400' : bal.isOwedToYou ? 'text-green-400' : 'text-white/70'}`}>
                    ₹{bal.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          <h2 className="text-3xl text-white mt-12" style={{ fontFamily: "'Instrument Serif', serif" }}>Members</h2>
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
            {group.group_members.map(m => (
              <div key={m.user_id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-sm overflow-hidden shrink-0">
                  {m.profiles.avatar_url ? (
                    <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (m.profiles.display_name || m.profiles.full_name || m.profiles.email || 'U')[0].toUpperCase()
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-white">{m.profiles.display_name || m.profiles.full_name || m.profiles.email} {m.user_id === user.id && '(You)'}</span>
                  <span className="text-white/30 text-xs capitalize">{m.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
