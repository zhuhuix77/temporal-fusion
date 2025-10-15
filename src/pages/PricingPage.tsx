import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import Loader from '@/components/Loader';
import type { Session } from '@supabase/supabase-js';

// This is a placeholder for the context type from App.tsx
// We'll define it based on what App.tsx provides.
interface AppContext {
  session: Session | null;
  setShowLoginPage: (show: boolean) => void;
}

const PricingPage: React.FC = () => {
  const { session, setShowLoginPage } = useOutletContext<AppContext>();
  const [loadingOption, setLoadingOption] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setMessage({
        type: 'success',
        text: 'Payment successful! Your new credits should appear in your account shortly.',
      });
    } else if (status === 'cancelled') {
      setMessage({
        type: 'error',
        text: 'Payment cancelled. You have not been charged.',
      });
    }
  }, [searchParams]);

  const handlePurchase = async (productId: string, credits: number, name: string) => {
    if (!session) {
      setShowLoginPage(true);
      return;
    }

    setLoadingOption(name);

    try {
      const { data, error } = await supabase.functions.invoke('create-creem-checkout', {
        body: { productId, credits },
      });

      if (error) {
        throw new Error(`Function invocation failed: ${error.message}`);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to get checkout URL:', data);
        alert('Could not create a payment session. Please try again.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setLoadingOption(null);
    }
  };
  const pricingOptions = [
    {
      name: 'Starter Pack',
      price: 16,
      credits: 100,
      bestValue: false,
      productId: 'prod_42X7pVESPA68IELxJom50P', // TODO: Replace with your actual Creem Product ID
      description: 'Approx. 10 generations',
    },
    {
      name: 'Value Pack',
      price: 38,
      credits: 300,
      bestValue: false,
      productId: 'prod_16X91rZQ6zGqu2j0Lilmoc', // TODO: Replace with your actual Creem Product ID
      description: 'Approx. 30 generations',
    },
    {
      name: 'Pro Pack',
      price: 50,
      credits: 500,
      bestValue: true,
      productId: 'prod_4sgn13rAlCbwaw4IDIdW8u', // TODO: Replace with your actual Creem Product ID
      description: 'Approx. 50 generations',
    },
  ];

  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-8 my-10 text-white text-center">
      {message && (
        <div
          className={`w-full max-w-3xl p-4 rounded-lg flex justify-between items-center ${
            message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500' : 'bg-red-500/20 text-red-300 border border-red-500'
          }`}
        >
          <p>{message.text}</p>
          <button onClick={() => setMessage(null)} className="text-xl font-bold opacity-70 hover:opacity-100">&times;</button>
        </div>
      )}
      <h1 className="text-5xl font-bold text-pink-400">Pricing</h1>
      <p className="text-xl text-slate-300 max-w-2xl">
        Purchase credits to use across all AI applications. Each generation or API call costs 10 credits.
      </p>

      <div className="grid md:grid-cols-3 gap-8 w-full mt-8">
        {pricingOptions.map((option) => (
          <div
            key={option.name}
            className={`p-8 border rounded-xl shadow-lg bg-slate-800/50 flex flex-col ${
              option.bestValue ? 'border-pink-500 ring-2 ring-pink-500' : 'border-slate-700'
            }`}
          >
            <h2 className="text-3xl font-semibold mb-4">{option.name}</h2>
            <p className="text-5xl font-bold">{option.credits}</p>
            <p className="text-slate-400 mb-4">Credits</p>
            <p className="text-slate-300 mb-6">({option.description})</p>
            <p className="text-4xl font-bold my-4">${option.price}</p>
            <div className="flex-grow"></div>
            <button
              onClick={() => handlePurchase(option.productId, option.credits, option.name)}
              disabled={loadingOption !== null}
              className="mt-auto px-6 py-3 bg-pink-500 text-white font-bold text-lg rounded-lg shadow-md hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loadingOption === option.name ? <Loader size="sm" /> : 'Purchase'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;