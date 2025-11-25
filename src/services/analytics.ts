import { supabase } from '@/integrations/supabase/client';

export const logActivity = async (action: string, details?: Record<string, any>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('activity_logs').insert({
      user_id: user?.id || null,
      action,
      details: details || null,
      ip_address: null, // Would need server-side implementation for real IP
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export const logPageView = async (page: string, referrer?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get or create session ID
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('session_id', sessionId);
    }
    
    await supabase.from('traffic_logs').insert({
      user_id: user?.id || null,
      page,
      referrer: referrer || document.referrer || null,
      ip_address: null, // Would need server-side implementation for real IP
      user_agent: navigator.userAgent,
      session_id: sessionId,
    });
  } catch (error) {
    console.error('Failed to log page view:', error);
  }
};
