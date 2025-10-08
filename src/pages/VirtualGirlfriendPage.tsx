import React, { useState, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import type { VirtualGirlfriend } from '@/types';
import { fuseWithHistory } from '@/services/geminiService';
import FileUpload from '@/components/FileUpload';
import GirlfriendSelector from '@/components/GirlfriendSelector';
import CustomPromptInput from '@/components/CustomPromptInput';
import ResultDisplay from '@/components/ResultDisplay';
import Loader from '@/components/Loader';
import CreateGirlfriendModal from '@/components/CreateGirlfriendModal';
import { VIRTUAL_GIRLFRIENDS } from '@/constants';

interface AppContext {
  session: Session | null;
  credits: number | null;
  setCredits: (credits: number | null) => void;
  setShowLoginPage: (show: boolean) => void;
}

const VirtualGirlfriendPage: React.FC = () => {
  const { session, credits, setCredits, setShowLoginPage } = useOutletContext<AppContext>();
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userImageMimeType, setUserImageMimeType] = useState<string | null>(null);
  const [selectedGirlfriend, setSelectedGirlfriend] = useState<VirtualGirlfriend | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isSoloGeneration, setIsSoloGeneration] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userGirlfriends, setUserGirlfriends] = useState<VirtualGirlfriend[]>([]);

  const fetchUserGirlfriends = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setUserGirlfriends([]);
      return;
    }

    const { data, error } = await supabase
      .from('user_girlfriends')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user girlfriends:', error);
      setUserGirlfriends([]);
    } else if (data) {
      const formattedData: VirtualGirlfriend[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        backgroundImageUrl: item.image_url,
        prompt: item.prompt,
      }));
      setUserGirlfriends(formattedData);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserGirlfriends();
    } else {
      setUserGirlfriends([]);
    }
  }, [session?.user?.id, fetchUserGirlfriends]);

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

  const handleFuseClick = useCallback(async (overrideUserImage?: string, overrideMimeType?: string) => {
    if (!session) {
      setError("Please log in to generate an image.");
      setShowLoginPage(true);
      return;
    }

    if (credits === null || credits < 10) {
      setError("积分不足10分，无法生成图像。");
      return;
    }

    if (!selectedGirlfriend) {
      setError("Please select a virtual girlfriend.");
      return;
    }

    const imageToUse = overrideUserImage || userImage;
    const mimeToUse = overrideMimeType || userImageMimeType;

    if (imageToUse && !mimeToUse) {
      setError("There was an issue with the uploaded image's format.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const { data: newCredits, error: deductError } = await supabase.rpc('deduct_credits', {
        user_id_input: session.user.id,
        amount_to_deduct: 10,
      });

      if (deductError) {
        throw deductError;
      }
      setCredits(newCredits);

      let finalPrompt: string;
      const imageParts: { base64Data: string; mimeType: string }[] = [];

      if (imageToUse && mimeToUse) {
        setIsSoloGeneration(false);
        imageParts.push({
          base64Data: imageToUse.split(',')[1],
          mimeType: mimeToUse,
        });

        if (!selectedGirlfriend.backgroundImageUrl) {
          throw new Error("The selected girlfriend does not have a reference image.");
        }

        try {
          const response = await fetch(selectedGirlfriend.backgroundImageUrl);
          if (!response.ok) throw new Error('Failed to fetch girlfriend avatar image.');
          const blob = await response.blob();
          const reader = new FileReader();
          const girlfriendImageDataUrl = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          imageParts.push({
            base64Data: girlfriendImageDataUrl.split(',')[1],
            mimeType: blob.type,
          });
        } catch (e: any) {
          console.error("Failed to process girlfriend avatar:", e);
          throw new Error(`Could not load the girlfriend's photo for generation: ${e.message}`);
        }

        finalPrompt = `Create a single, photorealistic, high-resolution image that seamlessly combines the people from the two provided images into one cohesive scene. The person from the first image is the user. The person from the second image is their virtual girlfriend. It is critical to maintain the exact appearance, facial features, and style of both individuals as they appear in their respective photos. Place them together in a natural setting, interacting plausibly (e.g., standing side-by-side, smiling at the camera). The final image must have consistent lighting, shadows, and perspective, making it look like a real photograph taken of both of them together.`;
        if (customPrompt) {
          finalPrompt += ` Additional user-provided details for the scene: "${customPrompt}".`;
        }

      } else {
        setIsSoloGeneration(true);
        finalPrompt = selectedGirlfriend.prompt;
        if (customPrompt) {
          finalPrompt += `, ${customPrompt}`;
        }
      }

      const result = await fuseWithHistory(finalPrompt, imageParts);
      
      if (result) {
        setGeneratedImage(`data:image/png;base64,${result}`);
      } else {
        setError("The AI couldn't generate an image. Please try a different photo or companion.");
      }
    } catch (err: any) {
      console.error('Image generation process failed:', err);
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [session, credits, userImage, userImageMimeType, selectedGirlfriend, customPrompt, setCredits, setShowLoginPage]);

  const handleCompositeUploadAndFuse = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleFuseClick(reader.result as string, file.type);
    };
    reader.onerror = () => {
      setError("Failed to read the uploaded file.");
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setUserImage(null);
    setUserImageMimeType(null);
    setSelectedGirlfriend(null);
    setGeneratedImage(null);
    setIsLoading(false);
    setError(null);
    setCustomPrompt('');
    setIsSoloGeneration(false);
  };

  const handleSaveGirlfriend = async (formData: { name: string; description: string; prompt: string; imageFile: File; }) => {
    if (!session) throw new Error("You must be logged in to create a character.");

    const file = formData.imageFile;
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const fileName = `${session.user.id}/${Date.now()}-${cleanFileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('girlfriend_avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('girlfriend_avatars')
      .getPublicUrl(fileName);

    if (!publicUrl) {
      throw new Error("Could not get public URL for the uploaded image.");
    }

    const { error: dbError } = await supabase
      .from('user_girlfriends')
      .insert({
        user_id: session.user.id,
        name: formData.name,
        description: formData.description,
        prompt: formData.prompt,
        image_url: publicUrl,
      });

    if (dbError) {
      throw new Error(`Failed to save character data: ${dbError.message}`);
    }

    await fetchUserGirlfriends();
  };

  return (
    <main className="w-full max-w-5xl flex flex-col items-center gap-12 my-10">
      {isLoading && <Loader />}
      <CreateGirlfriendModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveGirlfriend}
      />

      {!generatedImage ? (
        <>
          <div className="w-full grid md:grid-cols-2 gap-8 items-start">
            <FileUpload onImageUpload={handleImageUpload} userImage={userImage} />
            <GirlfriendSelector 
              preSetGirlfriends={VIRTUAL_GIRLFRIENDS}
              userGirlfriends={userGirlfriends}
              onSelectGirlfriend={setSelectedGirlfriend} 
              selectedGirlfriend={selectedGirlfriend}
              onCreateClick={() => setShowCreateModal(true)}
              isLoggedIn={!!session}
            />
          </div>

          <CustomPromptInput value={customPrompt} onChange={setCustomPrompt} />

          {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</p>}

          <button
            onClick={() => handleFuseClick()}
            disabled={!selectedGirlfriend || isLoading}
            className="px-8 py-4 bg-pink-500 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-pink-600 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105"
          >
            Generate Image (10 Credits)
          </button>
        </>
      ) : (
        <ResultDisplay
          generatedImage={generatedImage}
          onReset={handleReset}
          isSoloGeneration={isSoloGeneration}
          onCompositeUpload={handleCompositeUploadAndFuse}
        />
      )}
    </main>
  );
};

export default VirtualGirlfriendPage;