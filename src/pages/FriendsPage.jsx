import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, Check, X, Trash2, Clock } from 'lucide-react';
import { useFriends } from '../context/FriendContext';
import { searchUsers } from '../services/db';

export const FriendsPage = () => {
  const navigate = useNavigate();
  const { friends, incomingRequests, outgoingRequests, loading, sendRequest, acceptRequest, rejectRequest, removeFriend } = useFriends();
  
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'add', 'requests'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearching(true);
        try {
          const results = await searchUsers(searchQuery);
          setSearchResults(results);
        } catch (err) {
          console.error(err);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSendRequest = async (userId) => {
    try {
      await sendRequest(userId);
      setSearchResults(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
      alert("Failed to send request.");
    }
  };

  const TabButton = ({ id, label, badgeCount }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative px-6 py-3 text-sm font-medium tracking-wide uppercase transition-colors ${
        activeTab === id ? 'text-white' : 'text-white/40 hover:text-white/70'
      }`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {label}
      {badgeCount > 0 && (
        <span className="ml-2 bg-white text-black text-xs px-2 py-0.5 rounded-full font-bold">
          {badgeCount}
        </span>
      )}
      {activeTab === id && (
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"></div>
      )}
    </button>
  );

  return (
    <div className="flex-1 p-6 md:p-16 flex flex-col max-w-7xl mx-auto w-full bg-transparent min-h-screen animate-fade-in pb-32 md:pb-16">
      
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 text-sm uppercase tracking-widest font-medium w-fit"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-12">
        <h1 className="text-6xl md:text-8xl text-white font-normal tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Network.
        </h1>
        <p className="text-white/50 mt-4 text-lg font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>Manage your friends and connections.</p>
      </div>
      
      {/* Tabs Header */}
      <div className="flex border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar">
        <TabButton id="friends" label="My Friends" badgeCount={friends.length} />
        <TabButton id="add" label="Add Friend" />
        <TabButton id="requests" label="Requests" badgeCount={incomingRequests.length} />
      </div>

      <div className="flex-1">
        {/* TAB: MY FRIENDS */}
        {activeTab === 'friends' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {loading ? (
              <p className="text-white/50">Loading...</p>
            ) : friends.length === 0 ? (
              <div className="p-12 border border-white/5 rounded-3xl text-center text-white/30 font-light flex flex-col items-center gap-4">
                <Search size={32} className="opacity-50" />
                <p>You haven't added any friends yet.</p>
                <button onClick={() => setActiveTab('add')} className="mt-2 text-white/70 hover:text-white underline underline-offset-4">Find friends</button>
              </div>
            ) : (
              friends.map(friend => (
                <div key={friend.friendshipId} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {friend.avatar_url ? (
                        <img src={friend.avatar_url} alt={friend.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl text-white font-medium" style={{ fontFamily: "'Instrument Serif', serif" }}>
                          {(friend.display_name || friend.full_name || friend.email).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-lg text-white font-medium block">{friend.display_name || friend.full_name}</span>
                      <span className="text-sm text-white/40 block font-light">{friend.email}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if(window.confirm(`Remove ${friend.display_name || friend.full_name} from friends?`)) {
                        removeFriend(friend.friendshipId);
                      }
                    }}
                    className="p-3 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Friend"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: ADD FRIENDS */}
        {activeTab === 'add' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by email or name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-5 pl-16 pr-6 text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all text-lg"
                style={{ fontFamily: "'Inter', sans-serif" }}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-4">
              {searching ? (
                <p className="text-white/50 text-center py-8">Searching...</p>
              ) : searchQuery.length >= 2 && searchResults.length === 0 ? (
                <p className="text-white/50 text-center py-8">No users found.</p>
              ) : (
                searchResults.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl text-white font-medium" style={{ fontFamily: "'Instrument Serif', serif" }}>
                            {(user.display_name || user.full_name || user.email).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-lg text-white font-medium block">{user.display_name || user.full_name}</span>
                        <span className="text-sm text-white/40 block font-light">{user.email}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleSendRequest(user.id)}
                      className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:scale-[1.02] transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                      <UserPlus size={16} />
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: REQUESTS */}
        {activeTab === 'requests' && (
          <div className="flex flex-col gap-12 animate-fade-in">
            
            {/* Incoming */}
            <div>
              <h3 className="text-sm font-light text-white/40 uppercase tracking-widest mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>Incoming Requests ({incomingRequests.length})</h3>
              <div className="flex flex-col gap-4">
                {incomingRequests.length === 0 ? (
                  <p className="text-white/30 text-sm font-light italic">No pending incoming requests.</p>
                ) : (
                  incomingRequests.map(req => {
                    const profile = req.requester;
                    return (
                      <div key={req.id} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl text-white font-medium" style={{ fontFamily: "'Instrument Serif', serif" }}>
                                {(profile?.display_name || profile?.full_name || profile?.email || '?').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-lg text-white font-medium block">{profile?.display_name || profile?.full_name}</span>
                            <span className="text-sm text-white/40 block font-light">{profile?.email}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => acceptRequest(req.id)}
                            className="p-3 bg-white text-black rounded-full hover:scale-105 transition-transform"
                            title="Accept"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => rejectRequest(req.id)}
                            className="p-3 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors"
                            title="Decline"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Outgoing */}
            <div>
              <h3 className="text-sm font-light text-white/40 uppercase tracking-widest mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>Sent Requests ({outgoingRequests.length})</h3>
              <div className="flex flex-col gap-4">
                {outgoingRequests.length === 0 ? (
                  <p className="text-white/30 text-sm font-light italic">No pending outgoing requests.</p>
                ) : (
                  outgoingRequests.map(req => {
                    const profile = req.addressee;
                    return (
                      <div key={req.id} className="flex items-center justify-between p-4 bg-transparent border border-white/5 rounded-2xl opacity-70">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg text-white font-medium" style={{ fontFamily: "'Instrument Serif', serif" }}>
                                {(profile?.display_name || profile?.full_name || profile?.email || '?').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-white font-medium block">{profile?.display_name || profile?.full_name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-white/30 text-sm">
                          <Clock size={14} />
                          Pending
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
