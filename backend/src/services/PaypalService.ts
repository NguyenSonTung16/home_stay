import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export class PaypalService {
  private readonly CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  private readonly SECRET = process.env.PAYPAL_SECRET;
  private readonly API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.CLIENT_ID}:${this.SECRET}`).toString('base64');
      const response = await axios.post(
        `${this.API_BASE}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data.access_token;
    } catch (error: any) {
      console.error('PayPal OAuth Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Thực hiện chuyển tiền qua PayPal Payouts
   */
  public async sendPayout(email: string, amountUSD: number, note: string, senderBatchId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const payload = {
        sender_batch_header: {
          sender_batch_id: senderBatchId,
          email_subject: 'Hoàn tiền cọc phòng trọ',
          email_message: note
        },
        items: [
          {
            recipient_type: 'EMAIL',
            amount: {
              value: amountUSD.toFixed(2),
              currency: 'USD'
            },
            note: note,
            receiver: email
          }
        ]
      };

      const response = await axios.post(`${this.API_BASE}/v1/payments/payouts`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`[PaypalService] Payout sent successfully for batch: ${senderBatchId}`);
      return response.data;
    } catch (error: any) {
      console.error('PayPal Payout Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Tạo Order để thu tiền khách hàng (Customer checkout)
   */
  public async createOrder(amountUSD: number, referenceId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const payload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: referenceId,
            amount: {
              currency_code: 'USD',
              value: amountUSD.toFixed(2)
            }
          }
        ]
      };

      const response = await axios.post(`${this.API_BASE}/v2/checkout/orders`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`[PaypalService] Order created successfully: ${response.data.id}`);
      return response.data; // Trả về order object (bao gồm id và links)
    } catch (error: any) {
      console.error('PayPal Create Order Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Capture Order (sau khi khách hàng phê duyệt thanh toán)
   */
  public async captureOrder(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.API_BASE}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`[PaypalService] Order captured successfully: ${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error('PayPal Capture Order Error:', error.response?.data || error.message);
      throw error;
    }
  }
  /**
   * Lấy chi tiết Order từ PayPal (Dùng để đối soát hoặc kiểm tra trạng thái)
   */
  public async getOrder(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.get(`${this.API_BASE}/v2/checkout/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('PayPal Get Order Error:', error.response?.data || error.message);
      throw error;
    }
  }
}
