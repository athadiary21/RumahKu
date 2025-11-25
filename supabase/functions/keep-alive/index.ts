import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Keep-alive ping started at:', new Date().toISOString());

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Perform simple query to keep database alive
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      console.error('Database query error:', error);
      throw error;
    }

    console.log('Database query successful');

    // Log activity
    await supabase.from('activity_logs').insert({
      action: 'keep_alive_ping',
      details: {
        timestamp: new Date().toISOString(),
        status: 'success',
        source: 'cron'
      }
    });

    console.log('Activity logged successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Keep-alive ping successful',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Keep-alive error:', error);
    
    // Try to log the error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('activity_logs').insert({
        action: 'keep_alive_ping',
        details: {
          timestamp: new Date().toISOString(),
          status: 'error',
          error: errorMessage
        }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

