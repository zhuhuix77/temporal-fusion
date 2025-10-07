
import React, { useRef } from 'react';

interface ResultDisplayProps {
  generatedImage: string | null;
  isSoloGeneration: boolean;
  onReset: () => void;
  onCompositeUpload: (file: File) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ generatedImage, isSoloGeneration, onReset, onCompositeUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!generatedImage) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCompositeUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-6 bg-slate-800/50 rounded-xl border-2 border-dashed border-pink-500 animate-fade-in">
      <h2 className="text-3xl font-bold text-pink-400">Here's Your New Image!</h2>
      <div className="w-full aspect-square bg-slate-900 rounded-lg overflow-hidden shadow-2xl shadow-black/50">
        <img src={generatedImage} alt="Generated virtual girlfriend" className="w-full h-full object-contain" />
      </div>

      {isSoloGeneration && (
        <div className="w-full p-4 bg-slate-700/50 rounded-lg text-center">
          <p className="text-slate-200 mb-3">Happy with her? Upload your photo to create a picture together!</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
          <button onClick={handleClick} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Upload Your Photo for a Composite
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <a
          href={generatedImage}
          download="virtual-girlfriend.png"
          className="flex-1 text-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
        >
          Download Image
        </a>
        <button
          onClick={onReset}
          className="flex-1 px-6 py-3 bg-slate-600 text-white font-bold rounded-lg shadow-lg hover:bg-slate-700 transition-all duration-300 transform hover:scale-105"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;
