// Supabase Edge Function to send emails
// This function processes email_notifications queue and sends emails

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailNotification {
  id: string
  recipient_email: string
  recipient_name: string
  subject: string
  template_name: string
  template_data: Record<string, any>
}

// Email templates
const templates = {
  subscription_change: (data: Record<string, any>) => `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">RumahKu</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937;">Subscription Update</h2>
          <p>Hi ${data.user_name},</p>
          <p>Your subscription for <strong>${data.family_name}</strong> has been updated.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 10px 0;"><strong>Previous Tier:</strong></td>
                <td style="padding: 10px 0; text-align: right;">${data.old_tier}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>New Tier:</strong></td>
                <td style="padding: 10px 0; text-align: right; color: #10b981; font-weight: bold;">${data.new_tier}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Status:</strong></td>
                <td style="padding: 10px 0; text-align: right;">${data.new_status}</td>
              </tr>
              ${data.expires_at ? `
              <tr>
                <td style="padding: 10px 0;"><strong>Expires:</strong></td>
                <td style="padding: 10px 0; text-align: right;">${new Date(data.expires_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <p>Thank you for using RumahKu!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated email from RumahKu. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `,
  
  expiration_reminder: (data: Record<string, any>) => `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">⚠️ RumahKu</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937;">Subscription Expiring Soon!</h2>
          <p>Hi ${data.user_name},</p>
          <p>Your <strong>${data.tier}</strong> subscription for <strong>${data.family_name}</strong> will expire in <strong style="color: #ef4444;">${data.days_left} day${data.days_left > 1 ? 's' : ''}</strong>.</p>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e;">
              <strong>Expiration Date:</strong> ${new Date(data.expires_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <p>To continue enjoying all features, please renew your subscription before it expires.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://rumahku.app/pricing" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Renew Subscription
            </a>
          </div>
          
          <p>Thank you for using RumahKu!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated email from RumahKu. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `,
}

async function sendEmail(notification: EmailNotification, supabaseClient: any) {
  try {
    // Get email template
    const template = templates[notification.template_name as keyof typeof templates]
    if (!template) {
      throw new Error(`Template ${notification.template_name} not found`)
    }
    
    const htmlContent = template(notification.template_data)
    
    // Here you would integrate with your email service provider
    // For example: SendGrid, Resend, AWS SES, etc.
    
    // Example with Resend API (you need to set RESEND_API_KEY in Supabase secrets)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'RumahKu <noreply@rumahku.app>',
          to: [notification.recipient_email],
          subject: notification.subject,
          html: htmlContent,
        }),
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Resend API error: ${error}`)
      }
    } else {
      // Fallback: Log to console (for development)
      console.log('Email would be sent:', {
        to: notification.recipient_email,
        subject: notification.subject,
        template: notification.template_name,
      })
    }
    
    // Update notification status to sent
    await supabaseClient
      .from('email_notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', notification.id)
    
    return { success: true }
  } catch (error: any) {
    // Update notification status to failed
    await supabaseClient
      .from('email_notifications')
      .update({
        status: 'failed',
        error_message: error.message,
      })
      .eq('id', notification.id)
    
    return { success: false, error: error.message }
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get pending email notifications
    const { data: notifications, error } = await supabaseClient
      .from('email_notifications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10)

    if (error) throw error

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending notifications' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Send emails
    const results = await Promise.all(
      notifications.map((notification) => sendEmail(notification, supabaseClient))
    )

    const successCount = results.filter((r) => r.success).length
    const failedCount = results.filter((r) => !r.success).length

    return new Response(
      JSON.stringify({
        message: 'Email processing complete',
        total: notifications.length,
        sent: successCount,
        failed: failedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
