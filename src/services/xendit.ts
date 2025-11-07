// Xendit Payment Gateway Integration
// Documentation: https://developers.xendit.co/

interface XenditConfig {
  apiKey: string;
  isProduction: boolean;
}

interface CreateInvoiceParams {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  customerName?: string;
  customerPhone?: string;
  items?: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

interface XenditInvoiceResponse {
  id: string;
  external_id: string;
  user_id: string;
  status: string;
  merchant_name: string;
  amount: number;
  payer_email: string;
  description: string;
  invoice_url: string;
  expiry_date: string;
  created: string;
}

class XenditService {
  private config: XenditConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_XENDIT_API_KEY || '',
      isProduction: import.meta.env.VITE_XENDIT_IS_PRODUCTION === 'true',
    };
    
    this.baseUrl = 'https://api.xendit.co';
  }

  /**
   * Create an invoice
   */
  async createInvoice(params: CreateInvoiceParams): Promise<XenditInvoiceResponse> {
    const payload = {
      external_id: params.externalId,
      amount: params.amount,
      payer_email: params.payerEmail,
      description: params.description,
      customer: params.customerName ? {
        given_names: params.customerName,
        email: params.payerEmail,
        mobile_number: params.customerPhone || '',
      } : undefined,
      items: params.items,
      currency: 'IDR',
      invoice_duration: 86400, // 24 hours
      success_redirect_url: `${window.location.origin}/dashboard/settings?tab=subscription&payment=success`,
      failure_redirect_url: `${window.location.origin}/dashboard/settings?tab=subscription&payment=failed`,
    };

    const response = await fetch(`${this.baseUrl}/v2/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(this.config.apiKey + ':')}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create invoice');
    }

    return await response.json();
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: string): Promise<XenditInvoiceResponse> {
    const response = await fetch(`${this.baseUrl}/v2/invoices/${invoiceId}`, {
      headers: {
        'Authorization': `Basic ${btoa(this.config.apiKey + ':')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get invoice');
    }

    return await response.json();
  }

  /**
   * Expire an invoice
   */
  async expireInvoice(invoiceId: string): Promise<XenditInvoiceResponse> {
    const response = await fetch(`${this.baseUrl}/v2/invoices/${invoiceId}/expire!`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(this.config.apiKey + ':')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to expire invoice');
    }

    return await response.json();
  }

  /**
   * Create Virtual Account
   */
  async createVirtualAccount(params: {
    externalId: string;
    bankCode: string;
    name: string;
    expectedAmount: number;
  }): Promise<any> {
    const payload = {
      external_id: params.externalId,
      bank_code: params.bankCode,
      name: params.name,
      expected_amount: params.expectedAmount,
      is_closed: true,
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const response = await fetch(`${this.baseUrl}/callback_virtual_accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(this.config.apiKey + ':')}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create virtual account');
    }

    return await response.json();
  }

  /**
   * Create QR Code payment
   */
  async createQRCode(params: {
    externalId: string;
    amount: number;
    qrCodeType: 'DYNAMIC' | 'STATIC';
  }): Promise<any> {
    const payload = {
      external_id: params.externalId,
      type: params.qrCodeType,
      callback_url: `${window.location.origin}/api/webhooks/xendit`,
      amount: params.amount,
    };

    const response = await fetch(`${this.baseUrl}/qr_codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(this.config.apiKey + ':')}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create QR code');
    }

    return await response.json();
  }
}

export const xenditService = new XenditService();
export type { CreateInvoiceParams, XenditInvoiceResponse };
