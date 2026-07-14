import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function testPaypal() {
  const CLIENT_ID = process.env.PAYPAL_CLIENT_ID?.trim();
  const SECRET = process.env.PAYPAL_SECRET?.trim();
  const API_BASE = process.env.PAYPAL_API_BASE?.trim() || 'https://api-m.sandbox.paypal.com';

  console.log('CLIENT_ID length:', CLIENT_ID?.length);
  console.log('SECRET length:', SECRET?.length);

  try {
    const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');
    const response = await axios.post(
      `${API_BASE}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    console.log('SUCCESS! Access token received:', response.data.access_token.substring(0, 10) + '...');
  } catch (error: any) {
    console.error('FAILED! Status:', error.response?.status);
    console.error('Response:', error.response?.data);
  }
}

testPaypal();
