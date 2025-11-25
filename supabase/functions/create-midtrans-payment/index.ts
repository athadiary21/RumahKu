import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Get user's family
    const { data: familyMember } = await supabaseClient
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (!familyMember) {
      throw new Error('User not associated with a family')
    }

    const { tier, billing_period, promo_code } = await req.json()

    // Get tier details
    const { data: tierData, error: tierError } = await supabaseClient
      .from('subscription_tiers')
      .select('*')
      .eq('tier', tier)
      .single()

    if (tierError) throw tierError

    let amount = billing_period === 'yearly' 
      ? tierData.price_yearly 
      : tierData.price_monthly

    let discount = 0
    let promoCodeId = null

    // Apply promo code if provided
    if (promo_code) {
      const { data: promoData, error: promoError } = await supabaseClient
        .from('promo_codes')
        .select('*')
        .eq('code', promo_code)
        .eq('active', true)
        .single()

      if (promoData && !promoError) {
        const now = new Date()
        const validFrom = new Date(promoData.valid_from)
        const validUntil = new Date(promoData.valid_until)

        if (now >= validFrom && now <= validUntil) {
          if (promoData.max_uses === null || promoData.current_uses < promoData.max_uses) {
            if (promoData.discount_type === 'percentage') {
              discount = (amount * promoData.discount_value) / 100
            } else {
              discount = promoData.discount_value
            }
            promoCodeId = promoData.id
          }
        }
      }
    }

    const finalAmount = Math.max(0, amount - discount)

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        family_id: familyMember.family_id,
        amount: finalAmount,
        original_amount: amount,
        discount_amount: discount,
        currency: 'IDR',
        payment_method: 'midtrans',
        status: 'pending',
        tier: tier,
        billing_period: billing_period,
        promo_code_id: promoCodeId,
      })
      .select()
      .single()

    if (transactionError) throw transactionError

    // Get user profile for customer details
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // Create Midtrans Snap transaction
    const midtransServerKey = Deno.env.get('MIDTRANS_SERVER_KEY')?.trim()
    const midtransClientKey = Deno.env.get('MIDTRANS_CLIENT_KEY')?.trim()
    const isProduction = Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true'

    if (!midtransServerKey || !midtransClientKey) {
      throw new Error('Midtrans credentials not configured. Please check MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY secrets.')
    }

    console.log('Using Midtrans environment:', isProduction ? 'Production' : 'Sandbox')
    console.log('Server key starts with:', midtransServerKey.substring(0, 10))

    const snapUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

    const authString = btoa(midtransServerKey + ':')

    const snapPayload = {
      transaction_details: {
        order_id: transaction.id,
        gross_amount: finalAmount,
      },
      customer_details: {
        first_name: profile?.full_name || 'User',
        email: profile?.email || user.email,
      },
      item_details: [
        {
          id: tier,
          price: finalAmount,
          quantity: 1,
          name: `RumahKu ${tier.charAt(0).toUpperCase() + tier.slice(1)} - ${billing_period === 'yearly' ? 'Tahunan' : 'Bulanan'}`,
        },
      ],
      callbacks: {
        finish: `${Deno.env.get('FRONTEND_URL')}/dashboard/settings?payment=success`,
        error: `${Deno.env.get('FRONTEND_URL')}/dashboard/settings?payment=error`,
        pending: `${Deno.env.get('FRONTEND_URL')}/dashboard/settings?payment=pending`,
      },
    }

    const snapResponse = await fetch(snapUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(snapPayload),
    })

    if (!snapResponse.ok) {
      const errorText = await snapResponse.text()
      console.error('Midtrans API Error Response:', errorText)
      console.error('Request to URL:', snapUrl)
      console.error('Using environment:', isProduction ? 'Production' : 'Sandbox')
      throw new Error(`Midtrans API error: ${errorText}`)
    }

    const snapData = await snapResponse.json()

    // Update transaction with Snap token
    await supabaseClient
      .from('payment_transactions')
      .update({
        gateway_transaction_id: snapData.token,
        gateway_response: snapData,
      })
      .eq('id', transaction.id)

    return new Response(
      JSON.stringify({
        transaction_id: transaction.id,
        snap_token: snapData.token,
        snap_url: snapData.redirect_url,
        client_key: midtransClientKey,
        is_production: isProduction,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
