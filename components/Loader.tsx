
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Calibrating the chronometer...",
  "Weaving the threads of time...",
  "Consulting the history archives...",
  "Powering up the fusion reactor...",
  "Please wait, time travel is delicate work.",
  "Rendering historical pixels...",
];

const Loader: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = loadingMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-center items-center z-50">
      <div className="w-24 h-24 border-8 border-dashed rounded-full animate-spin border-teal-500"></div>
      <p className="text-white text-xl font-semibold mt-8 text-center px-4">{message}</p>
    </div>
  );
};

export default Loader;
