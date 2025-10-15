import React, { useState, useRef } from 'react';

interface StyleSelectorProps {
  onStyleSelect: (style: string) => void;
}

// IMPORTANT: Place your images in the `public/images/styles/` directory.
// The `imageUrl` should correspond to the image file name.
const artStyles = [
  { name: 'Van Gogh', imageUrl: '/images/styles/van-gogh.jpg' },
  { name: 'Renaissance', imageUrl: '/images/styles/renaissance.jpg' },
  { name: 'Pop Art', imageUrl: '/images/styles/pop-art.jpg' },
  { name: 'Minimalist', imageUrl: '/images/styles/minimalist.jpg' },
  { name: 'Cyberpunk', imageUrl: '/images/styles/cyberpunk.jpg' },
  { name: 'Steampunk', imageUrl: '/images/styles/steampunk.jpg' },
  { name: 'Fantasy', imageUrl: '/images/styles/fantasy.jpg' },
  { name: 'Cartoon', imageUrl: '/images/styles/cartoon.jpg' },
  { name: 'Abstract', imageUrl: '/images/styles/abstract.jpg' },
  { name: 'Impressionism', imageUrl: '/images/styles/impressionism.jpg' },
  { name: 'Surrealism', imageUrl: '/images/styles/surrealism.jpg' },
  { name: 'Cubism', imageUrl: '/images/styles/cubism.jpg' },
  { name: 'Modern', imageUrl: '/images/styles/modern.jpg' },
  { name: 'Gothic', imageUrl: '/images/styles/gothic.jpg' },
  { name: 'Graffiti', imageUrl: '/images/styles/graffiti.jpg' },
  { name: 'Watercolor', imageUrl: '/images/styles/watercolor.jpg' },
  { name: 'Oil Painting', imageUrl: '/images/styles/oil-painting.jpg' },
  { name: 'Pencil Sketch', imageUrl: '/images/styles/pencil-sketch.jpg' },
  { name: 'Anime', imageUrl: '/images/styles/anime.jpg' },
  { name: 'Vintage', imageUrl: '/images/styles/vintage.jpg' },
];

const StyleSelector: React.FC<StyleSelectorProps> = ({ onStyleSelect }) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (style: string) => {
    setSelectedStyle(style);
    onStyleSelect(style);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full group">
      <div
        ref={scrollContainerRef}
        className="flex items-center space-x-4 overflow-x-auto scroll-smooth scrollbar-hide p-4"
      >
        {artStyles.map((style) => (
          <div
            key={style.name}
            onClick={() => handleSelect(style.name)}
            className={`relative flex-shrink-0 w-40 h-40 rounded-lg overflow-hidden cursor-pointer group/item transition-all duration-300 border-2 ${
              selectedStyle === style.name
                ? 'border-indigo-500 ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-500 scale-105'
                : 'border-transparent hover:border-indigo-400 hover:scale-105'
            }`}
          >
            <img 
              src={style.imageUrl} 
              alt={style.name} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover/item:bg-opacity-20 transition-all duration-300"></div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm font-bold text-center truncate">{style.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Left Scroll Button */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-slate-800/60 rounded-full hover:bg-slate-700/80 transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Scroll left"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right Scroll Button */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-slate-800/60 rounded-full hover:bg-slate-700/80 transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Scroll right"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default StyleSelector;