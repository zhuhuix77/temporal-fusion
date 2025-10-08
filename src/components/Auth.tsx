import React, { useState, useEffect } from 'react';
import { supabase, signInWithGoogle, signOut } from '../services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

const Auth: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <button onClick={signInWithGoogle} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Login with Google
      </button>
    );
  }

  return (
    <div className="flex items-center">
      <p className="text-white mr-4">Welcome, {session.user.email}</p>
      <button onClick={signOut} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Logout
      </button>
    </div>
  );
};

export default Auth;