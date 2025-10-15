import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import { fuseWithHistory } from '@/services/geminiService';
import ImageUploader from '@/components/ImageUploader';
import StyleSelector from '@/components/StyleSelector';
import Loader from '@/components/Loader';

interface AppContext {
  session: Session | null;
  credits: number | null;
  setCredits: (credits: number | null) => void;
  setShowLoginPage: (show: boolean) => void;
}

const VirtualPetPage: React.FC = () => {
  const { session, credits, setCredits, setShowLoginPage } = useOutletContext<AppContext>();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageMimeType, setUploadedImageMimeType] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedPortrait, setGeneratedPortrait] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File, base64: string) => {
    setUploadedImage(base64);
    setUploadedImageMimeType(file.type);
    setGeneratedPortrait(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!session) {
      setError("Please log in to generate an image.");
      setShowLoginPage(true);
      return;
    }
    if (credits === null || credits < 10) {
      setError("You need at least 10 credits to generate a portrait.");
      return;
    }
    if (!uploadedImage || !selectedStyle || !uploadedImageMimeType) {
      setError('Please upload an image and select a style.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPortrait(null);

    try {
      const { data: newCredits, error: deductError } = await supabase.rpc('deduct_credits', {
        user_id_input: session.user.id,
        amount_to_deduct: 10,
      });

      if (deductError) throw deductError;
      setCredits(newCredits);

      const finalPrompt = `A pet portrait of the animal in the provided image. The final image should be in the art style of: "${selectedStyle}". Additional user instructions for the scene: "${customPrompt || 'none'}".`;
      
      const imageParts = [{
        base64Data: uploadedImage.split(',')[1],
        mimeType: uploadedImageMimeType,
      }];

      const result = await fuseWithHistory(finalPrompt, imageParts);
      
      if (result) {
        setGeneratedPortrait(`data:image/png;base64,${result}`);
      } else {
        const { data: refundedCredits, error: creditError } = await supabase.rpc('add_credits', {
            user_id_input: session.user.id,
            amount_to_add: 10,
        });
        if (!creditError) setCredits(refundedCredits);
        setError("The AI couldn't generate an image and your credits have been refunded. Please try again.");
      }
    } catch (err: any) {
      console.error('Image generation process failed:', err);
      setError(`An error occurred: ${err.message}. If credits were deducted, they will be refunded.`);
       try {
        const { data: refundedCredits, error: creditError } = await supabase.rpc('add_credits', {
            user_id_input: session.user.id,
            amount_to_add: 10,
        });
        if (!creditError) setCredits(refundedCredits);
      } catch (refundErr) {
        console.error('Failed to refund credits after error:', refundErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setUploadedImageMimeType(null);
    setSelectedStyle('');
    setCustomPrompt('');
    setGeneratedPortrait(null);
    setIsLoading(false);
    setError(null);
  };

  return (
    <div className="container mx-auto p-8 text-white">
      {isLoading && <Loader />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Controls */}
        <div className="bg-slate-800/50 p-6 rounded-lg flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-indigo-300">1. Upload Your Pet's Photo</h2>
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-indigo-300">2. Choose an Art Style</h2>
            <StyleSelector onStyleSelect={setSelectedStyle} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-indigo-300">3. Customize (Optional)</h2>
            <textarea
              className="w-full p-3 border border-slate-600 bg-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white"
              rows={4}
              placeholder="e.g., 'My pet is a golden retriever, make the background a sunny field.'"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>
          
          {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={isLoading || !uploadedImage || !selectedStyle}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 mt-auto"
          >
            {isLoading ? 'Generating...' : 'Generate Portrait (10 Credits)'}
          </button>
        </div>

        {/* Right Column: Result */}
        <div className="flex items-center justify-center bg-slate-800/50 rounded-lg p-8 border-2 border-dashed border-slate-600 min-h-[500px]">
          {generatedPortrait && !isLoading && (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 text-green-400">Your Artwork is Ready!</h2>
              <img src={generatedPortrait} alt="Generated Pet Portrait" className="rounded-lg shadow-lg mx-auto max-w-full h-auto" />
              <div className="flex gap-4 mt-6 justify-center">
                <a
                  href={generatedPortrait}
                  download="ai-pet-portrait.png"
                  className="inline-block bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition-colors duration-300"
                >
                  Download
                </a>
                <button
                  onClick={handleReset}
                  className="inline-block bg-slate-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-600 transition-colors duration-300"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
          {!generatedPortrait && !isLoading && (
            <div className="text-center text-slate-400">
              <p className="text-xl">Your pet's portrait will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualPetPage;