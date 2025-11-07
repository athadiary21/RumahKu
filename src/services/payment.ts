// Unified Payment Service
// Handles both Midtrans and Xendit

import { supabase } from '@/integrations/supabase/client';
import { midtransService, type CreateTransactionParams as MidtransParams } from './midtrans';
import { xenditService, type CreateInvoiceParams as XenditParams } from './xendit';

export type PaymentGateway = 'midtrans' | 'xendit';

interface CreatePaymentParams {
  gateway: PaymentGateway;
  familyId: string;
  subscriptionId: string;
  tier: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  promoCode?: string;
}

interface PaymentResult {
  success: boolean;
  paymentUrl?: string;
  orderId: string;
  transactionId?: string;
  error?: string;
}

class PaymentService {
  /**
   * Generate unique order ID
   */
  private generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORDER-${timestamp}-${random}`;
  }

  /**
   * Calculate final amount after discount
   */
  private async calculateFinalAmount(
    amount: number,
    tier: string,
    familyId: string,
    promoCode?: string
  ): Promise<{ finalAmount: number; discountAmount: number; promoCodeId?: string }> {
    if (!promoCode) {
      return { finalAmount: amount, discountAmount: 0 };
    }

    // Validate promo code
    const { data, error } = await supabase.rpc('validate_promo_code', {
      p_code: promoCode,
      p_tier: tier,
      p_family_id: familyId,
    });

    if (error || !data || data.length === 0 || !data[0].valid) {
      throw new Error(data?.[0]?.message || 'Invalid promo code');
    }

    const promo = data[0];
    let discountAmount = 0;

    if (promo.discount_type === 'percentage') {
      discountAmount = (amount * promo.discount_value) / 100;
    } else if (promo.discount_type === 'fixed') {
      discountAmount = promo.discount_value;
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    return {
      finalAmount,
      discountAmount,
      promoCodeId: promo.promo_code_id,
    };
  }

  /**
   * Create payment transaction
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const orderId = this.generateOrderId();

      // Calculate final amount with promo code
      const { finalAmount, discountAmount, promoCodeId } = await this.calculateFinalAmount(
        params.amount,
        params.tier,
        params.familyId,
        params.promoCode
      );

      // Get tier name for item description
      const { data: tierData } = await supabase
        .from('subscription_tiers')
        .select('name')
        .eq('tier', params.tier)
        .single();

      const tierName = tierData?.name || params.tier;

      let paymentUrl = '';
      let transactionId = '';

      // Create payment based on gateway
      if (params.gateway === 'midtrans') {
        const midtransParams: MidtransParams = {
          orderId,
          amount: finalAmount,
          customerDetails: {
            firstName: params.customerName,
            email: params.customerEmail,
            phone: params.customerPhone,
          },
          itemDetails: [
            {
              id: params.tier,
              name: `Subscription ${tierName}`,
              price: finalAmount,
              quantity: 1,
            },
          ],
        };

        const result = await midtransService.createTransaction(midtransParams);
        paymentUrl = result.redirect_url;
        transactionId = result.token;
      } else if (params.gateway === 'xendit') {
        const xenditParams: XenditParams = {
          externalId: orderId,
          amount: finalAmount,
          payerEmail: params.customerEmail,
          description: `Subscription ${tierName}`,
          customerName: params.customerName,
          customerPhone: params.customerPhone,
          items: [
            {
              name: `Subscription ${tierName}`,
              quantity: 1,
              price: finalAmount,
            },
          ],
        };

        const result = await xenditService.createInvoice(xenditParams);
        paymentUrl = result.invoice_url;
        transactionId = result.id;
      }

      // Save transaction to database
      const { data: transaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          subscription_id: params.subscriptionId,
          family_id: params.familyId,
          amount: finalAmount,
          currency: 'IDR',
          payment_method: params.gateway,
          payment_gateway: params.gateway,
          transaction_id: transactionId,
          order_id: orderId,
          status: 'pending',
          payment_url: paymentUrl,
          expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            original_amount: params.amount,
            discount_amount: discountAmount,
            promo_code: params.promoCode,
            tier: params.tier,
          },
        })
        .select()
        .single();

      if (transactionError) {
        throw new Error('Failed to save transaction: ' + transactionError.message);
      }

      // Record promo code usage if applicable
      if (promoCodeId && params.promoCode) {
        await supabase.from('promo_code_usage').insert({
          promo_code_id: promoCodeId,
          family_id: params.familyId,
          subscription_id: params.subscriptionId,
          payment_transaction_id: transaction.id,
          discount_amount: discountAmount,
        });

        // Increment promo code usage count
        await supabase.rpc('increment', {
          table_name: 'promo_codes',
          row_id: promoCodeId,
          column_name: 'current_uses',
        });
      }

      return {
        success: true,
        paymentUrl,
        orderId,
        transactionId,
      };
    } catch (error: any) {
      console.error('Payment creation error:', error);
      return {
        success: false,
        orderId: '',
        error: error.message || 'Failed to create payment',
      };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderId: string, gateway: PaymentGateway): Promise<any> {
    try {
      if (gateway === 'midtrans') {
        return await midtransService.checkTransactionStatus(orderId);
      } else if (gateway === 'xendit') {
        // Get transaction ID from database
        const { data: transaction } = await supabase
          .from('payment_transactions')
          .select('transaction_id')
          .eq('order_id', orderId)
          .single();

        if (!transaction?.transaction_id) {
          throw new Error('Transaction not found');
        }

        return await xenditService.getInvoice(transaction.transaction_id);
      }
    } catch (error: any) {
      console.error('Check payment status error:', error);
      throw error;
    }
  }

  /**
   * Handle payment webhook/callback
   */
  async handlePaymentCallback(
    orderId: string,
    status: 'success' | 'failed' | 'expired',
    metadata?: any
  ): Promise<void> {
    try {
      // Update transaction status
      const { data: transaction, error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          status,
          paid_at: status === 'success' ? new Date().toISOString() : null,
          metadata: metadata || {},
        })
        .eq('order_id', orderId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // If payment successful, update subscription
      if (status === 'success' && transaction) {
        const tierFromMetadata = transaction.metadata?.tier;
        
        // Update subscription
        await supabase
          .from('subscriptions')
          .update({
            tier: tierFromMetadata,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            is_trial: false,
          })
          .eq('id', transaction.subscription_id);

        // Log subscription history
        await supabase.from('subscription_history').insert({
          subscription_id: transaction.subscription_id,
          family_id: transaction.family_id,
          action: 'renewed',
          to_tier: tierFromMetadata,
          amount: transaction.amount,
          payment_transaction_id: transaction.id,
          notes: 'Payment successful',
        });

        // Queue success email
        const { data: familyData } = await supabase
          .from('family_groups')
          .select('name, family_members(user_id)')
          .eq('id', transaction.family_id)
          .single();

        if (familyData?.family_members?.[0]) {
          // Get user email
          const { data: { user } } = await supabase.auth.admin.getUserById(
            familyData.family_members[0].user_id
          );

          if (user?.email) {
            await supabase.from('email_notifications').insert({
              recipient_email: user.email,
              recipient_user_id: user.id,
              subject: 'Pembayaran Berhasil - RumahKu',
              body: `Pembayaran subscription ${tierFromMetadata} Anda telah berhasil diproses.`,
              template_name: 'payment_success',
              metadata: {
                order_id: orderId,
                amount: transaction.amount,
                tier: tierFromMetadata,
              },
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Handle payment callback error:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
export type { CreatePaymentParams, PaymentResult };
