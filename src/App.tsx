import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Login from '@/components/Login';
import Loader from '@/components/Loader';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect 1: Manages Supabase auth state and session
  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setShowLoginPage(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Effect 2: Fetches user data when the user ID changes
  useEffect(() => {
    const userId = session?.user?.id;

    if (userId) {
      const fetchCredits = async () => {
        const fetchWithRetry = async (retries = 3, delay = 1000): Promise<void> => {
          const { data, error } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();

          if (error) {
            if (error.code === 'PGRST116' && retries > 0) {
              console.log(`Profile not found, retrying... (${retries} retries left)`);
              await new Promise(resolve => setTimeout(resolve, delay));
              return fetchWithRetry(retries - 1, delay);
            } else {
              console.error('Error fetching credits:', error);
              setCredits(null);
            }
          } else if (data) {
            setCredits(data.credits);
          }
        };
        await fetchWithRetry();
      };

      fetchCredits();
    } else {
      setCredits(null);
    }
  }, [session?.user?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader />
      </div>
    );
  }
  
  if (showLoginPage) {
    return <Login onBack={() => setShowLoginPage(false)} />;
  }

  const contextValue = {
    session,
    credits,
    setCredits,
    setShowLoginPage,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-slate-900 font-sans p-4 md:p-8">
      <Header session={session} credits={credits} onLogin={() => setShowLoginPage(true)} onLogout={handleLogout} />
      
      <main className="w-full max-w-5xl flex flex-col items-center gap-12 my-10">
        <Outlet context={contextValue} />
      </main>

      <Footer />
    </div>
  );
};

export default App;