import axios from 'axios';

async function testApi() {
  try {
    const res = await axios.get('http://localhost:3000/api/booking/phieu-coc/danh-sach?maKH=1');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error('API Error:', err.response?.data || err.message);
  }
}
testApi();
