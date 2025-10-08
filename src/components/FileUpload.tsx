
import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onImageUpload: (file: File) => void;
  userImage: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onImageUpload, userImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 p-6 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-600">
      <h2 className="text-2xl font-bold text-slate-200">1. Upload Your Photo</h2>
      <p className="text-slate-400 text-center">For the best results, use a clear portrait photo.</p>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      
      <div
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`w-full h-64 mt-2 flex justify-center items-center rounded-lg cursor-pointer transition-colors duration-300
        ${dragActive ? 'bg-slate-700' : 'bg-slate-800'}
        ${userImage ? 'border-pink-500' : 'border-slate-500'}`}
      >
        {userImage ? (
          <img src={userImage} alt="User upload preview" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="text-center text-slate-400 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-semibold">Drag & Drop or Click to Upload</p>
            <p className="text-sm">PNG, JPG, or WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
