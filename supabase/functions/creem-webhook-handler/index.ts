import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CREEM_WEBHOOK_SECRET = Deno.env.get('CREEM_WEBHOOK_SECRET');

// This is a placeholder for Creem's signature verification logic.
// You should replace this with the actual implementation from Creem's documentation.
// It often involves using a library like `creem` or manually verifying with `crypto`.
async function verifySignature(signature: string | null, body: string, secret: string | undefined): Promise<boolean> {
  if (!secret) {
    console.error('Webhook secret is not set. Signature verification cannot be performed.');
    return false;
  }
  if (!signature) {
    console.error('Request is missing Creem-Signature header. Signature verification failed.');
    return false;
  }
  
  // In a real implementation, you would use a crypto library to create a hash
  // of the request body using the secret and compare it to the signature.
  // For now, we'll just log it and assume it's valid for testing.
  console.log('Signature verification is a placeholder. For production, implement real verification.');
  return true;
}

serve(async (req) => {
  const signature = req.headers.get('Creem-Signature');
  const body = await req.text();

  const isValid = await verifySignature(signature, body, CREEM_WEBHOOK_SECRET);
  if (!isValid) {
    // The reason for failure is now logged inside verifySignature.
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    const event = JSON.parse(body);

    // FIX: Correctly check for Creem's eventType and data structure
    if (event.eventType === 'checkout.completed') {
      const checkoutObject = event.object;
      const userId = checkoutObject.metadata.userId;
      const creditsPurchased = parseInt(checkoutObject.metadata.credits, 10);

      if (!userId || isNaN(creditsPurchased)) {
        console.error('Webhook event is missing userId or has invalid credits in metadata.', checkoutObject.metadata);
        return new Response('Missing or invalid metadata in webhook event', { status: 400 });
      }

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: profile, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch profile for user ${userId}: ${fetchError.message}`);
      }

      const currentCredits = profile.credits || 0;
      const newCredits = currentCredits + creditsPurchased;

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Failed to update credits for user ${userId}: ${updateError.message}`);
      }

      console.log(`Successfully updated credits for user ${userId}. New balance: ${newCredits}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook Error:', error.message);
    return new Response(`Webhook Error: ${error.message}`, { status: 500 });
  }
});