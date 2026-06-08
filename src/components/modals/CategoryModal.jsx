import React, { useState } from 'react';
import { X, Tag, Coffee, Car, ShoppingBag, Film, Zap, Home, Heart, GraduationCap, Plane, CreditCard, MoreHorizontal } from 'lucide-react';

const availableIcons = {
  Tag, Coffee, Car, ShoppingBag, Film, Zap, Home, Heart, GraduationCap, Plane, CreditCard, MoreHorizontal
};

const availableColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
  '#DDA0DD', '#FF6348', '#7B68EE', '#00CEC9', '#FD79A8', '#636E72', '#ffffff'
];

export const CategoryModal = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({ name, icon: selectedIcon, color: selectedColor });
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-fade-rise">
        
        <div className="flex items-center justify-between p-8 border-b border-white/5 shrink-0">
          <h3 className="text-3xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>New Category</h3>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 overflow-y-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-light text-white/50 tracking-wide uppercase">Category Name</label>
            <input type="text" placeholder="e.g., Groceries" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors" />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-light text-white/50 tracking-wide uppercase">Icon</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(availableIcons).map(iconName => {
                const IconComponent = availableIcons[iconName];
                return (
                  <button 
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${selectedIcon === iconName ? 'bg-white text-black' : 'bg-white/5 text-white hover:bg-white/10 border border-transparent'}`}
                  >
                    <IconComponent size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-light text-white/50 tracking-wide uppercase">Color</label>
            <div className="flex flex-wrap gap-3">
              {availableColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-6 shrink-0">
            <button type="button" className="px-6 py-3 rounded-full text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-full text-sm font-medium bg-white text-black hover:bg-white/90 hover:scale-[1.02] transition-all shadow-xl disabled:opacity-50">
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};
