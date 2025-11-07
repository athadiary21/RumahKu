// Midtrans Payment Gateway Integration
// Documentation: https://docs.midtrans.com/

interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

interface CreateTransactionParams {
  orderId: string;
  amount: number;
  customerDetails: {
    firstName: string;
    email: string;
    phone?: string;
  };
  itemDetails: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

interface MidtransResponse {
  token: string;
  redirect_url: string;
  order_id: string;
}

class MidtransService {
  private config: MidtransConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      serverKey: import.meta.env.VITE_MIDTRANS_SERVER_KEY || '',
      clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '',
      isProduction: import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true',
    };
    
    this.baseUrl = this.config.isProduction
      ? 'https://app.midtrans.com/snap/v1'
      : 'https://app.sandbox.midtrans.com/snap/v1';
  }

  /**
   * Create a payment transaction
   */
  async createTransaction(params: CreateTransactionParams): Promise<MidtransResponse> {
    const payload = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      customer_details: {
        first_name: params.customerDetails.firstName,
        email: params.customerDetails.email,
        phone: params.customerDetails.phone || '',
      },
      item_details: params.itemDetails,
      credit_card: {
        secure: true,
      },
      enabled_payments: [
        'credit_card',
        'bca_va',
        'bni_va',
        'bri_va',
        'permata_va',
        'other_va',
        'gopay',
        'shopeepay',
        'qris',
      ],
    };

    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(this.config.serverKey + ':')}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_messages?.[0] || 'Failed to create transaction');
    }

    return await response.json();
  }

  /**
   * Check transaction status
   */
  async checkTransactionStatus(orderId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl.replace('/snap/v1', '/v2')}/${orderId}/status`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${btoa(this.config.serverKey + ':')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check transaction status');
    }

    return await response.json();
  }

  /**
   * Cancel transaction
   */
  async cancelTransaction(orderId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl.replace('/snap/v1', '/v2')}/${orderId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${btoa(this.config.serverKey + ':')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to cancel transaction');
    }

    return await response.json();
  }

  /**
   * Get Snap token for frontend
   */
  getSnapUrl(token: string): string {
    const snapUrl = this.config.isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    return snapUrl;
  }

  getClientKey(): string {
    return this.config.clientKey;
  }
}

export const midtransService = new MidtransService();
export type { CreateTransactionParams, MidtransResponse };
