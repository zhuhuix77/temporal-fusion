
import React from 'react';

interface ResultDisplayProps {
  generatedImage: string | null;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ generatedImage, onReset }) => {
  if (!generatedImage) return null;

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-6 bg-slate-800/50 rounded-xl border-2 border-dashed border-teal-500 animate-fade-in">
      <h2 className="text-3xl font-bold text-teal-400">Your Journey Through Time!</h2>
      <div className="w-full aspect-square bg-slate-900 rounded-lg overflow-hidden shadow-2xl shadow-black/50">
        <img src={generatedImage} alt="Generated historical fusion" className="w-full h-full object-contain" />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <a
          href={generatedImage}
          download="temporal-fusion.png"
          className="flex-1 text-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
        >
          Download Image
        </a>
        <button
          onClick={onReset}
          className="flex-1 px-6 py-3 bg-slate-600 text-white font-bold rounded-lg shadow-lg hover:bg-slate-700 transition-all duration-300 transform hover:scale-105"
        >
          Start a New Journey
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;
