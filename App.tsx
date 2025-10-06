
import React, { useState, useCallback, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import type { HistoricalEvent } from './types';
import { fuseWithHistory } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import FileUpload from './components/FileUpload';
import EventSelector from './components/EventSelector';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';
import Login from './components/Login';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userImageMimeType, setUserImageMimeType] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async (user_id: string) => {
    const fetchWithRetry = async (retries = 3, delay = 1000) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user_id)
        .single();

      if (error) {
        // PostgREST error 'PGRST116' means no rows were found.
        // This is expected for a new user whose profile is being created.
        if (error.code === 'PGRST116' && retries > 0) {
          console.log(`Profile not found, retrying... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1, delay);
        } else {
          console.error('Error fetching credits:', error);
          setCredits(null);
          return;
        }
      }
      
      if (data) {
        setCredits(data.credits);
      }
    };

    await fetchWithRetry();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchCredits(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchCredits(session.user.id);
      } else {
        setCredits(null);
      }
      setShowLoginPage(false); // Hide login page on auth state change
    });

    return () => subscription.unsubscribe();
  }, [fetchCredits]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserImage(reader.result as string);
      setUserImageMimeType(file.type);
      setGeneratedImage(null); 
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read the uploaded file.");
    };
    reader.readAsDataURL(file);
  };

  const handleFuseClick = useCallback(async () => {
    if (!session) {
      setError("Please log in to generate an image.");
      setShowLoginPage(true);
      return;
    }

    if (credits === null || credits < 10) {
      setError("积分不足10分，无法生成图像。");
      return;
    }

    if (!userImage || !selectedEvent || !userImageMimeType) {
      setError("Please upload a photo and select a historical event.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Call the new 'deduct_credits' RPC function to securely deduct credits
      const { data: newCredits, error: deductError } = await supabase.rpc('deduct_credits', {
        user_id_input: session.user.id,
        amount_to_deduct: 10,
      });

      if (deductError) {
        // This will catch the 'Insufficient credits' exception from the DB function
        throw deductError;
      }

      // Update credits state with the new balance returned from the function
      setCredits(newCredits);

      // Proceed with image generation
      const base64Data = userImage.split(',')[1];
      const result = await fuseWithHistory(base64Data, userImageMimeType, selectedEvent.prompt);
      
      if (result) {
        setGeneratedImage(`data:image/png;base64,${result}`);
      } else {
        // If image generation fails, we should ideally refund the credit.
        // This requires more complex server-side logic. For now, we just show an error.
        // A simple refund could be another RPC call.
        setError("The AI couldn't generate an image. Your credits have not been refunded for this attempt.");
      }
    } catch (err: any) {
      console.error('Image generation process failed:', err);
      // The error message from the DB function will be in err.message
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [session, credits, userImage, selectedEvent, userImageMimeType]);

  const handleReset = () => {
    setUserImage(null);
    setUserImageMimeType(null);
    setSelectedEvent(null);
    setGeneratedImage(null);
    setIsLoading(false);
    setError(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (showLoginPage) {
    return <Login onBack={() => setShowLoginPage(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-slate-900 font-sans p-4 md:p-8">
      {isLoading && <Loader />}
      <Header session={session} credits={credits} onLogin={() => setShowLoginPage(true)} onLogout={handleLogout} />

      <main className="w-full max-w-5xl flex flex-col items-center gap-12 my-10">
        {!generatedImage ? (
          <>
            <div className="w-full grid md:grid-cols-2 gap-8 items-start">
              <FileUpload onImageUpload={handleImageUpload} userImage={userImage} />
              <EventSelector onSelectEvent={setSelectedEvent} selectedEvent={selectedEvent} />
            </div>

            {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</p>}

            <button
              onClick={handleFuseClick}
              disabled={!userImage || !selectedEvent || isLoading}
              className="px-8 py-4 bg-teal-500 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-teal-600 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105"
            >
              Travel Through Time
            </button>
          </>
        ) : (
          <ResultDisplay generatedImage={generatedImage} onReset={handleReset} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
