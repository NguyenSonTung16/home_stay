import request from 'supertest';
import express from 'express';
import financeRoutes from '../../src/routes/financeRoutes';
import { HoanCocService } from '../../src/services/HoanCocService';

const app = express();
app.use(express.json());
app.use('/api/finance', financeRoutes);

// Mock HoanCocService tại tầng controller
jest.mock('../../src/services/HoanCocService');

describe('Integration Test: HoanCoc API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/finance/hoan-coc/cho-doi-soat - Trả về danh sách chờ đối soát', async () => {
    // Mock data return
    const mockData = [{ maHD: 101, trangThai: 3 }];
    (HoanCocService.prototype.docDanhSachChoDoiSoat as jest.Mock).mockResolvedValue(mockData);

    const res = await request(app).get('/api/finance/hoan-coc/cho-doi-soat');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockData);
  });

  it('GET /api/finance/hoan-coc/chi-phi/:maHD - Tính chi phí thành công', async () => {
    const mockChiPhi = { maHD: 102, thucNhanChi: 500000 };
    (HoanCocService.prototype.tinhToanChiPhiDoiSoat as jest.Mock).mockResolvedValue(mockChiPhi);

    const res = await request(app).get('/api/finance/hoan-coc/chi-phi/102');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.thucNhanChi).toBe(500000);
  });

  it('GET /api/finance/hoan-coc/chi-phi/:maHD - Trả về 404 nếu không tìm thấy', async () => {
    (HoanCocService.prototype.tinhToanChiPhiDoiSoat as jest.Mock).mockRejectedValue(new Error('Không tìm thấy hợp đồng'));

    const res = await request(app).get('/api/finance/hoan-coc/chi-phi/999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Không tìm thấy hợp đồng');
  });

  it('POST /api/finance/hoan-coc/phe-duyet - Phê duyệt thành công', async () => {
    (HoanCocService.prototype.luuBangDoiSoat as jest.Mock).mockResolvedValue(true);

    const res = await request(app)
      .post('/api/finance/hoan-coc/phe-duyet')
      .send({ maHD: 102, bdsData: { tienCoc: 1, khauTru: 0, thucNhanChi: 1, maPKT: 1, maNV: 1 } });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
