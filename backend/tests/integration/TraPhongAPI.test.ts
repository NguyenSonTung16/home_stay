import request from 'supertest';
import express from 'express';
import financeRoutes from '../../src/routes/financeRoutes';
import { TraPhongService } from '../../src/services/TraPhongService';

const app = express();
app.use(express.json());
app.use('/api/finance', financeRoutes);

// Mock TraPhongService
jest.mock('../../src/services/TraPhongService');

describe('Integration Test: TraPhong API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/finance/tra-phong/cho-tra-phong - Trả về danh sách chờ trả phòng', async () => {
    const mockData = [{ maYC: 10, maHD: 9999, phong: 'P.102' }];
    (TraPhongService.prototype.docDanhSachChoTraPhong as jest.Mock).mockResolvedValue(mockData);

    const res = await request(app).get('/api/finance/tra-phong/cho-tra-phong');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockData);
  });

  it('POST /api/finance/tra-phong/xac-nhan-ban-giao - Cập nhật trạng thái thành công', async () => {
    (TraPhongService.prototype.taoPhieuKiemTra as jest.Mock).mockResolvedValue({ success: true, message: 'Cập nhật thành công' });

    const res = await request(app)
      .post('/api/finance/tra-phong/xac-nhan-ban-giao')
      .send({
        maHD: 'HD-9999',
        maPhong: 102,
        phiVeSinh: 50000,
        thuHoiKhoa: true,
        kyBienBan: true
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
