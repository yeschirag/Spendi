import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react';
import * as db from '../services/db';

export const FriendsPage = () => {
  const { friends, balances, addFriend } = useAppContext();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const success = await addFriend(name.trim());
      if (success) {
        setName('');
      } else {
        setError("Friend already exists or invalid name.");
      }
    } catch (err) {
      setError("Failed to add friend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 md:p-16 flex flex-col max-w-7xl mx-auto w-full bg-transparent min-h-screen animate-fade-in">
      
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 text-sm uppercase tracking-widest font-medium w-fit"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
        <div>
          <h1 className="text-6xl md:text-8xl text-white font-normal tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Network.
          </h1>
          <p className="text-white/50 mt-4 text-lg font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>Manage your friends and balances.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16" style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* Add Friend Form */}
        <div className="lg:col-span-5">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            <h2 className="text-2xl text-white font-normal mb-8 relative z-10" style={{ fontFamily: "'Instrument Serif', serif" }}>Add a Connection</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="bg-red-500/10 text-red-400 text-sm p-4 rounded-xl border border-red-500/20">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                <label htmlFor="friendName" className="text-sm font-light text-white/50 tracking-wide uppercase">Friend's Name</label>
                <input type="text" id="friendName" placeholder="e.g., Jane Doe" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-lg" />
              </div>
              
              <button type="submit" disabled={loading} className="w-full py-4 rounded-full text-lg font-medium bg-white text-black hover:bg-white/90 hover:scale-[1.01] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
                <UserPlus size={20} />
                {loading ? 'Adding...' : 'Add Friend'}
              </button>
            </form>
          </div>
        </div>

        {/* Friends List */}
        <div className="lg:col-span-7">
          <h2 className="text-sm font-light text-white/50 tracking-widest uppercase mb-8">Your Network</h2>
          
          <div className="flex flex-col gap-4">
            {friends.length === 0 ? (
              <div className="p-8 border border-white/5 rounded-[2rem] text-center text-white/30 font-light">
                No friends added yet.
              </div>
            ) : (
              friends.map(friend => {
                const balance = balances[friend] || 0;
                const isOwed = balance > 0;
                const isOwing = balance < 0;
                
                return (
                  <div key={friend} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl text-white font-medium" style={{ fontFamily: "'Instrument Serif', serif" }}>
                        {friend.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xl text-white font-medium">{friend}</span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        {balance === 0 ? (
                          <span className="text-white/30 text-sm tracking-wide uppercase">Settled up</span>
                        ) : isOwed ? (
                          <div className="flex flex-col">
                            <span className="text-green-400 font-medium text-lg">owes you ₹{Math.abs(balance).toFixed(0)}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-red-400 font-medium text-lg">you owe ₹{Math.abs(balance).toFixed(0)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
