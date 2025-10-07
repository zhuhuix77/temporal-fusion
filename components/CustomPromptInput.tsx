import React from 'react';

interface CustomPromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CustomPromptInput: React.FC<CustomPromptInputProps> = ({ value, onChange }) => {
  return (
    <div className="w-full flex flex-col items-center gap-4 p-6 bg-slate-800/50 rounded-xl">
      <h2 className="text-2xl font-bold text-slate-200">3. Add Your Own Ideas (Optional)</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., 'sitting on a park bench', 'both smiling', 'at night with city lights'..."
        className="w-full h-24 p-3 bg-slate-800 border-2 border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
      />
    </div>
  );
};

export default CustomPromptInput;