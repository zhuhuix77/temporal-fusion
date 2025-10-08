import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface LoginProps {
  onBack: () => void;
}

export default function Login({ onBack }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setEmailSent(false);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      alert(error.message);
    } else {
      setEmailSent(true);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-lg shadow-lg relative">
        <button onClick={onBack} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        <h1 className="text-2xl font-bold text-center">Temporal Fusion</h1>
        <p className="text-center text-slate-400">Sign in or create an account</p>
        {emailSent ? (
          <div className="text-center p-4 bg-green-900/50 rounded-lg">
            <p className="font-semibold">Check your email!</p>
            <p className="text-sm text-slate-300 mt-1">We've sent a magic link to {email}. Click the link to log in or finish creating your account.</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                id="email"
                className="w-full px-3 py-2 mt-1 text-slate-100 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="email"
                placeholder="Your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <span>Loading...</span> : <span>Continue with Email</span>}
            </button>
          </form>
        )}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-slate-400">Or</span>
          </div>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2 px-4 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? <span>Loading...</span> : <span>Continue with Google</span>}
        </button>
      </div>
    </div>
  );
}