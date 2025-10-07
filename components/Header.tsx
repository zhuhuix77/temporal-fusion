import React from 'react';
import type { Session } from '@supabase/supabase-js';

interface HeaderProps {
  session: Session | null;
  credits: number | null;
  onLogin: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ session, credits, onLogin, onLogout }) => {
  return (
    <header className="w-full flex justify-between items-center p-4">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-2">
          Virtual Girlfriend
        </h1>
        <p className="text-slate-400 text-lg">Create your perfect virtual companion.</p>
      </div>
      <div>
        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-slate-300 font-semibold">Credits: {credits ?? '...'}</span>
            <span className="text-slate-300">{session.user.email}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;