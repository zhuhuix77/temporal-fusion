import React from 'react';
import type { VirtualGirlfriend } from '@/types';

interface GirlfriendSelectorProps {
  preSetGirlfriends: VirtualGirlfriend[];
  userGirlfriends: VirtualGirlfriend[];
  onSelectGirlfriend: (girlfriend: VirtualGirlfriend) => void;
  selectedGirlfriend: VirtualGirlfriend | null;
  onCreateClick: () => void;
  isLoggedIn: boolean;
}

const GirlfriendCard: React.FC<{
  girlfriend: VirtualGirlfriend;
  isSelected: boolean;
  onSelect: () => void;
  isUserCreated?: boolean;
}> = ({ girlfriend, isSelected, onSelect, isUserCreated = false }) => (
  <div
    onClick={onSelect}
    className={`
      group relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300
      transform hover:scale-105
      ${isSelected ? 'ring-4 ring-pink-500 shadow-2xl shadow-pink-500/30' : 'ring-2 ring-transparent hover:ring-pink-600'}
    `}
  >
    <img 
      src={girlfriend.backgroundImageUrl} 
      alt={girlfriend.name} 
      className="w-full h-32 object-contain bg-black transition-transform duration-300 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-300 flex flex-col justify-end p-2">
      <h3 className="font-bold text-sm text-white">{girlfriend.name}</h3>
      <p className="text-xs text-slate-300 hidden md:block">{girlfriend.description}</p>
    </div>
    {isUserCreated && (
      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        Custom
      </div>
    )}
    {isSelected && (
      <div className="absolute top-2 right-2 bg-pink-500 rounded-full p-1 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    )}
  </div>
);


const GirlfriendSelector: React.FC<GirlfriendSelectorProps> = ({ 
  preSetGirlfriends,
  userGirlfriends,
  onSelectGirlfriend, 
  selectedGirlfriend,
  onCreateClick,
  isLoggedIn,
}) => {
  const allGirlfriends = [...userGirlfriends, ...preSetGirlfriends];

  return (
    <div className="w-full flex flex-col items-center gap-4 p-6 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-600">
      <div className="w-full flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-200">2. Choose Your Companion</h2>
        {isLoggedIn && (
          <button onClick={onCreateClick} className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors text-sm">
            + Create New
          </button>
        )}
      </div>
      <div className="w-full grid grid-cols-2 lg:grid-cols-3 gap-4 mt-2 max-h-96 overflow-y-auto pr-2">
        {allGirlfriends.map((girlfriend) => (
          <GirlfriendCard
            key={girlfriend.id}
            girlfriend={girlfriend}
            isSelected={selectedGirlfriend?.id === girlfriend.id}
            onSelect={() => onSelectGirlfriend(girlfriend)}
            isUserCreated={userGirlfriends.some(ug => ug.id === girlfriend.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default GirlfriendSelector;