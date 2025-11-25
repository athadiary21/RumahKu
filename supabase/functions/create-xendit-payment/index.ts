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
        payment_method: 'xendit',
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

    // Create Xendit Invoice
    const xenditApiKey = Deno.env.get('XENDIT_API_KEY')
    const isProduction = Deno.env.get('XENDIT_IS_PRODUCTION') === 'true'

    const invoiceUrl = 'https://api.xendit.co/v2/invoices'
    const authString = btoa(xenditApiKey + ':')

    const invoicePayload = {
      external_id: transaction.id,
      amount: finalAmount,
      payer_email: profile?.email || user.email,
      description: `RumahKu ${tier.charAt(0).toUpperCase() + tier.slice(1)} Subscription - ${billing_period === 'yearly' ? 'Yearly' : 'Monthly'}`,
      customer: {
        given_names: profile?.full_name || 'User',
        email: profile?.email || user.email,
      },
      success_redirect_url: `${Deno.env.get('FRONTEND_URL')}/dashboard/settings?payment=success`,
      failure_redirect_url: `${Deno.env.get('FRONTEND_URL')}/dashboard/settings?payment=error`,
      currency: 'IDR',
      items: [
        {
          name: `RumahKu ${tier.charAt(0).toUpperCase() + tier.slice(1)} - ${billing_period === 'yearly' ? 'Tahunan' : 'Bulanan'}`,
          quantity: 1,
          price: finalAmount,
        },
      ],
    }

    const invoiceResponse = await fetch(invoiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(invoicePayload),
    })

    if (!invoiceResponse.ok) {
      const errorText = await invoiceResponse.text()
      throw new Error(`Xendit API error: ${errorText}`)
    }

    const invoiceData = await invoiceResponse.json()

    // Update transaction with invoice ID
    await supabaseClient
      .from('payment_transactions')
      .update({
        gateway_transaction_id: invoiceData.id,
        gateway_response: invoiceData,
      })
      .eq('id', transaction.id)

    return new Response(
      JSON.stringify({
        transaction_id: transaction.id,
        invoice_id: invoiceData.id,
        invoice_url: invoiceData.invoice_url,
        expiry_date: invoiceData.expiry_date,
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
