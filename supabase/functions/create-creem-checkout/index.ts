import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// The API key from Supabase secrets
const CREEM_API_KEY = Deno.env.get('CREEM_API_KEY'); 
// The base URL for your site, for success/cancel redirects
const SITE_URL = Deno.env.get('SITE_URL');

// CORS headers to allow requests from your web app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // This is for the browser's preflight request.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the user's auth token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the user from the token
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized or user email not available' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Get the productId and credits from the request body
    const { productId, credits } = await req.json();
    if (!productId) {
        return new Response(JSON.stringify({ error: 'productId is required' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    // The correct Creem API endpoint
    const creemApiUrl = 'https://api.creem.io/v1/checkouts';

    // Construct the request body according to the Creem API example
    const checkoutData = {
      request_id: crypto.randomUUID(), 
      product_id: productId,
      units: 1,
      customer: {
        email: user.email,
      },
      // Redirect back to pricing page with a success message
      success_url: `${SITE_URL}/pricing?status=success`,
      // Note: Creem API does not support a 'cancel_url'. Users who cancel will not be automatically redirected.
      metadata: {
        userId: user.id,
        credits: credits.toString(),
      },
    };

    // Make the request to the Creem API
    const creemResponse = await fetch(creemApiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': CREEM_API_KEY!, // Use the 'x-api-key' header for authentication
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    // Check if the request was successful
    if (!creemResponse.ok) {
      const errorText = await creemResponse.text();
      console.error('Creem API Error Response:', errorText);
      return new Response(JSON.stringify({ error: `Failed to create checkout. Creem API returned: ${errorText}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Get the JSON response from Creem
    const creemSession = await creemResponse.json();

    // The checkout URL should be in the response.
    const checkoutUrl = creemSession.checkout_url || creemSession.url || creemSession.redirect_url;

    if (!checkoutUrl) {
        console.error('Could not find checkout URL in Creem response:', creemSession);
        return new Response(JSON.stringify({ error: 'Could not find checkout URL in Creem response.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    // Return the checkout URL to the frontend
    return new Response(JSON.stringify({ url: checkoutUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Internal Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});