import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <main className="w-full max-w-5xl flex flex-col items-center gap-12 my-10 text-white text-center">
      <h1 className="text-5xl font-bold text-pink-400">Welcome to the Innovation Hub</h1>
      <p className="text-xl text-slate-300">
        This is the central platform for a collection of exciting AI-powered tools.
      </p>
      
      <div className="mt-8 p-8 border border-pink-500 rounded-xl shadow-lg bg-slate-800/50 w-full max-w-md">
        <h2 className="text-3xl font-semibold mb-4">Virtual Girlfriend Generator</h2>
        <p className="text-slate-400 mb-6">
          Create images of your virtual partner, or even generate a composite photo of you both together!
        </p>
        <Link 
          to="/virtual-girlfriend"
          className="px-6 py-3 bg-pink-500 text-white font-bold text-lg rounded-lg shadow-md hover:bg-pink-600 transition-all duration-300 transform hover:scale-105"
        >
          Launch App
        </Link>
      </div>

      {/* This is where you can add more app modules in the future */}
      {/* 
      <div className="mt-8 p-8 border border-cyan-500 rounded-xl shadow-lg bg-slate-800/50 w-full max-w-md">
        <h2 className="text-3xl font-semibold mb-4">Future App #2</h2>
        <p className="text-slate-400 mb-6">
          Description for the next amazing application.
        </p>
        <Link 
          to="/app-2"
          className="px-6 py-3 bg-cyan-500 text-white font-bold text-lg rounded-lg shadow-md hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105"
        >
          Coming Soon
        </Link>
      </div> 
      */}
    </main>
  );
};

export default HomePage;