import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-token',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const notification = await req.json()
    
    // Verify callback token
    const callbackToken = req.headers.get('x-callback-token')
    const xenditCallbackToken = Deno.env.get('XENDIT_CALLBACK_TOKEN')
    
    if (callbackToken !== xenditCallbackToken) {
      throw new Error('Invalid callback token')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const externalId = notification.external_id

    // Get transaction
    const { data: transaction, error: txError } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('id', externalId)
      .single()

    if (txError || !transaction) {
      throw new Error('Transaction not found')
    }

    // Map Xendit status to our status
    let status = 'pending'
    let paymentCompleted = false

    if (notification.status === 'PAID' || notification.status === 'SETTLED') {
      status = 'completed'
      paymentCompleted = true
    } else if (notification.status === 'EXPIRED') {
      status = 'failed'
    } else if (notification.status === 'PENDING') {
      status = 'pending'
    }

    // Update transaction
    await supabaseClient
      .from('payment_transactions')
      .update({
        status: status,
        gateway_response: notification,
        paid_at: paymentCompleted ? new Date().toISOString() : null,
      })
      .eq('id', externalId)

    // If payment completed, update subscription
    if (paymentCompleted) {
      // Get user's family
      const { data: familyMember } = await supabaseClient
        .from('family_members')
        .select('family_id')
        .eq('user_id', transaction.user_id)
        .single()

      if (familyMember) {
        const expiryDate = new Date()
        if (transaction.billing_period === 'yearly') {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1)
        } else {
          expiryDate.setMonth(expiryDate.getMonth() + 1)
        }

        // Update or create subscription
        const { data: existingSub } = await supabaseClient
          .from('subscriptions')
          .select('id')
          .eq('family_id', familyMember.family_id)
          .single()

        if (existingSub) {
          await supabaseClient
            .from('subscriptions')
            .update({
              tier: transaction.tier,
              status: 'active',
              billing_period: transaction.billing_period,
              current_period_end: expiryDate.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSub.id)
        } else {
          await supabaseClient
            .from('subscriptions')
            .insert({
              family_id: familyMember.family_id,
              tier: transaction.tier,
              status: 'active',
              billing_period: transaction.billing_period,
              started_at: new Date().toISOString(),
              current_period_end: expiryDate.toISOString(),
            })
        }

        // Log subscription history
        await supabaseClient
          .from('subscription_history')
          .insert({
            family_id: familyMember.family_id,
            tier: transaction.tier,
            status: 'active',
            started_at: new Date().toISOString(),
            billing_period: transaction.billing_period,
            amount_paid: transaction.amount,
            payment_method: transaction.payment_method,
          })

        // Update promo code usage
        if (transaction.promo_code_id) {
          await supabaseClient.rpc('increment_promo_usage', {
            promo_id: transaction.promo_code_id
          })
        }
      }
    } else if (status === 'failed') {
      // Payment failed - no action needed
      console.log('Payment failed for transaction:', externalId)
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
