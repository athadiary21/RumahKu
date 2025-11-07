import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user is admin
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!userRole || userRole.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get dashboard stats
    const { data: stats, error: statsError } = await supabaseClient
      .rpc('get_dashboard_stats')

    if (statsError) throw statsError

    // Get revenue trend
    const { data: revenueTrend, error: trendError } = await supabaseClient
      .rpc('get_revenue_trend', { days_back: 14 })

    if (trendError) throw trendError

    // Get subscription breakdown
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from('subscriptions')
      .select('tier, status')

    if (subsError) throw subsError

    const subscriptionBreakdown = {
      free: subscriptions?.filter(s => s.tier === 'free').length || 0,
      family: subscriptions?.filter(s => s.tier === 'family').length || 0,
      premium: subscriptions?.filter(s => s.tier === 'premium').length || 0,
    }

    return new Response(
      JSON.stringify({
        stats,
        revenueTrend,
        subscriptionBreakdown,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
