import React, { useState } from 'react';
import { X, Users } from 'lucide-react';
import { createGroup } from '../../services/db';
import { useNavigate } from 'react-router-dom';

export const CreateGroupModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      const group = await createGroup(name, description);
      if (onSuccess) onSuccess(group);
      onClose();
      navigate(`/group/${group.id}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg glass-card rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-fade-rise">
        
        <div className="flex items-center justify-between p-8 border-b border-border shrink-0">
          <h3 className="text-4xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>New Group.</h3>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-graphite/40 hover:bg-brand-graphite/80 border border-border/30 text-white/50 hover:text-white transition-colors" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 overflow-y-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
          
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-brand-graphite/20 border border-border/40 flex items-center justify-center">
              <Users size={32} className="text-white/30" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-light text-white/50 tracking-wide uppercase">Group Name</label>
            <input type="text" placeholder="e.g., Goa Trip 2026" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-brand-black border border-border rounded-xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-porcelain transition-colors" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-light text-white/50 tracking-wide uppercase">Description (Optional)</label>
            <textarea placeholder="What's this group for?" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-brand-black border border-border rounded-xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-porcelain transition-colors min-h-[100px] resize-none" />
          </div>

          <div className="flex items-center justify-end gap-4 mt-6 shrink-0">
            <button type="button" className="px-6 py-3 rounded-full text-sm font-medium text-white/50 hover:text-white hover:bg-brand-graphite/40 transition-all" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-full text-sm font-medium bg-brand-porcelain text-brand-black hover:scale-[1.02] transition-all shadow-xl disabled:opacity-50">
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};
