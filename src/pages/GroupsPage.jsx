import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreateGroupModal } from '../components/modals/CreateGroupModal';

export const GroupsPage = () => {
  const { groups } = useAppContext();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="flex-1 p-6 md:p-16 flex flex-col max-w-7xl mx-auto w-full bg-transparent min-h-screen animate-fade-in pb-32 md:pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="hidden md:block">
          <h1 className="text-5xl md:text-7xl mb-4 text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Groups & Trips.
          </h1>
          <p className="text-white/50 text-lg md:text-xl font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            Shared experiences, split perfectly.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-3 bg-brand-porcelain text-brand-black px-6 py-3 rounded-full hover:scale-105 transition-all shadow-xl font-medium text-sm"
        >
          <Plus size={20} />
          <span>New Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <div 
            key={group.id} 
            onClick={() => navigate(`/group/${group.id}`)}
            className="group relative overflow-hidden bg-brand-graphite/20 border border-border rounded-[2rem] p-8 hover:bg-brand-graphite/35 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-brand-graphite/30 flex items-center justify-center mb-6 text-white/50 group-hover:text-white group-hover:scale-110 transition-all">
              <Users size={28} />
            </div>
            
            <h3 className="text-2xl text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>{group.name}</h3>
            {group.description && (
              <p className="text-white/50 text-sm line-clamp-2 font-light" style={{ fontFamily: "'Inter', sans-serif" }}>{group.description}</p>
            )}
            
            <div className="mt-8 flex items-center justify-between border-t border-border/40 pt-6">
              <div className="flex items-center gap-2 text-white/30 text-sm font-light">
                <Users size={16} />
                <span>{group.group_members?.length || 1} members</span>
              </div>
              <ArrowRight size={20} className="text-white/20 group-hover:text-white group-hover:-rotate-45 transition-all" />
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-[2rem]">
            <div className="w-20 h-20 rounded-full bg-brand-graphite/30 flex items-center justify-center mb-6 text-white/30">
              <Users size={32} />
            </div>
            <h3 className="text-3xl text-white mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>No Groups Yet</h3>
            <p className="text-white/50 max-w-md mx-auto mb-8 font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
              Create a group to track shared expenses for trips, apartments, or events.
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 rounded-full bg-brand-graphite/30 hover:bg-brand-graphite/50 border border-border text-white transition-all text-sm"
            >
              Start a Group
            </button>
          </div>
        )}
      </div>

      {showCreateModal && <CreateGroupModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};
