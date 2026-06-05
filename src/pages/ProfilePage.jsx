import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Settings, Info, CreditCard } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAppContext() || { user: null };
  const { logout } = useAuth();

  const fullName = user?.user_metadata?.full_name || '';
  const firstName = fullName ? fullName.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'User');
  const avatarUrl = user?.user_metadata?.avatar_url || null;

  return (
    <div className="flex-1 p-6 md:p-16 flex flex-col max-w-7xl mx-auto w-full bg-transparent pb-32 md:pb-16 animate-fade-in">
      
      <div className="mb-12">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm uppercase tracking-widest font-medium w-fit"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 border-b border-white/10 pb-12">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0 shadow-2xl">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl text-white font-medium" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {firstName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl text-white font-normal tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
            {fullName || firstName}
          </h1>
          <p className="text-white/50 text-lg mt-2 font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            {user?.email}
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Account Details */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-4 mb-6">
            <User size={24} className="text-white/50" />
            <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Account.</h2>
          </div>
          <div className="space-y-4 font-light text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex justify-between border-b border-white/5 pb-4">
              <span className="text-white/50">Provider</span>
              <span className="text-white capitalize">{user?.app_metadata?.provider || 'Email'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-4">
              <span className="text-white/50">Status</span>
              <span className="text-green-400">Active</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-white/50">Last Sign In</span>
              <span className="text-white">{new Date(user?.last_sign_in_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-4 mb-6">
            <Settings size={24} className="text-white/50" />
            <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Preferences.</h2>
          </div>
          <div className="space-y-4 font-light text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex justify-between border-b border-white/5 pb-4">
              <span className="text-white/50">Currency</span>
              <span className="text-white">INR (₹)</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-4">
              <span className="text-white/50">Theme</span>
              <span className="text-white">Luxury Dark</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-white/50">Notifications</span>
              <span className="text-white">Enabled</span>
            </div>
          </div>
        </div>

        {/* About App */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors md:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <Info size={24} className="text-white/50" />
            <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>About Spendi.</h2>
          </div>
          <p className="text-white/50 font-light leading-relaxed text-sm max-w-2xl" style={{ fontFamily: "'Inter', sans-serif" }}>
            Spendi was crafted to bring clarity to shared expenses. We stripped away the noise and complex spreadsheets, 
            replacing them with an elegant, uncompromising digital ledger. Track your wealth, manage your network, 
            and maintain absolute financial truth.
          </p>
          <div className="mt-8 flex gap-4 text-xs tracking-wider uppercase text-white/30 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
            <span>Version 1.0.0</span>
            <span>•</span>
            <span>Made for you</span>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
};
