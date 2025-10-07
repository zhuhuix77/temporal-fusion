import React, { useState, useRef } from 'react';
import Loader from './Loader';

interface CreateGirlfriendModalProps {
  onClose: () => void;
  onSave: (formData: { name: string; description: string; prompt: string; imageFile: File; }) => Promise<void>;
  isOpen: boolean;
}

const CreateGirlfriendModal: React.FC<CreateGirlfriendModalProps> = ({ onClose, onSave, isOpen }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSaveClick = async () => {
    if (!name || !prompt || !imageFile) {
      setError('Name, a base prompt, and an avatar image are required.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSave({ name, description, prompt, imageFile });
      // Reset form on successful save
      setName('');
      setDescription('');
      setPrompt('');
      setImageFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save the character.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 animate-fade-in">
      {isSaving && <Loader />}
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-xl p-8 m-4 relative flex flex-col gap-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">&times;</button>
        <h2 className="text-3xl font-bold text-pink-400 mb-2">Create Your Own Companion</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side: Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-300">Avatar Image*</label>
            <div 
              className="w-full h-48 bg-slate-700 rounded-lg flex items-center justify-center cursor-pointer border-2 border-dashed border-slate-500 hover:border-pink-500 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar preview" className="w-full h-full object-cover rounded-md" />
              ) : (
                <span className="text-slate-400">Click to upload</span>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
          </div>

          {/* Right side: Text Inputs */}
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="font-semibold text-slate-300 block mb-1">Name*</label>
              <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-slate-900 rounded-md text-white border-2 border-slate-700 focus:border-pink-500 outline-none" />
            </div>
            <div>
              <label htmlFor="description" className="font-semibold text-slate-300 block mb-1">Description</label>
              <input id="description" type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-slate-900 rounded-md text-white border-2 border-slate-700 focus:border-pink-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Bottom: Prompt */}
        <div>
          <label htmlFor="prompt" className="font-semibold text-slate-300 block mb-1">Base Prompt*</label>
          <p className="text-sm text-slate-400 mb-2">Describe her core appearance and personality. E.g., "A cheerful woman with short blonde hair, wearing a summer dress..."</p>
          <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 p-2 bg-slate-900 rounded-md text-white border-2 border-slate-700 focus:border-pink-500 outline-none" />
        </div>
        
        {error && <p className="text-red-400 text-center bg-red-900/50 p-2 rounded-md">{error}</p>}

        <button 
          onClick={handleSaveClick} 
          disabled={isSaving}
          className="w-full mt-4 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors disabled:bg-slate-600"
        >
          {isSaving ? 'Saving...' : 'Save Character'}
        </button>
      </div>
    </div>
  );
};

export default CreateGirlfriendModal;