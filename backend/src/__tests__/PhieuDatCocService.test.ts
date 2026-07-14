/**
 * Unit tests for PhieuDatCocService
 * Test (a): Race condition — 2 requests cùng giường → 1 thành công, 1 nhận 409
 * Test (b): Webhook idempotency — gọi 2 lần cùng maGiaoDich → chỉ xử lý 1 lần
 * Test (c): Cron job hủy phiếu quá hạn → giường về 'Trong'
 */

import { PhieuDatCocService } from '../services/PhieuDatCocService';

// ─── Mock toàn bộ db và repos ─────────────────────────────────────────────
jest.mock('../config/db', () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  return {
    db: {
      query: jest.fn(),
      connect: jest.fn().mockResolvedValue(mockClient),
    },
  };
});

jest.mock('../repositories/PhieuDatCocRepository');
jest.mock('../repositories/GiuongRepository');
jest.mock('../services/PaypalService');
jest.mock('../services/EmailService');

import { db } from '../config/db';
import { PhieuDatCocRepository } from '../repositories/PhieuDatCocRepository';
import { GiuongRepository } from '../repositories/GiuongRepository';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK FACTORIES
// ─────────────────────────────────────────────────────────────────────────────
const mockPhieuRepo = jest.mocked(PhieuDatCocRepository).prototype;
const mockGiuongRepo = jest.mocked(GiuongRepository).prototype;

const getMockClient = async () => (await db.connect()) as any;

function makeMockClient(giuongTrangThai = 'Trong', phieuTrangThai = 'ChoThanhToan') {
  const client = {
    query: jest.fn(async (sql: string, params?: any[]) => {
      if (sql.includes('BEGIN') || sql.includes('COMMIT') || sql.includes('ROLLBACK')) {
        return { rows: [], rowCount: 0 };
      }
      if (sql.includes('Phong p JOIN LoaiPhong')) {
        return { rows: [{ maphong: 1, tenphong: 'P101', giatien: '2000000' }] };
      }
      if (sql.includes('UPDATE PhieuDatCoc SET PhuongThucThanhToan')) {
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 1 };
    }),
    release: jest.fn(),
  };
  return client;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST (a): Race condition — 2 request cùng giường đồng thời
// ─────────────────────────────────────────────────────────────────────────────
describe('(a) Race condition: 2 requests cùng maGiuong', () => {
  it('chỉ 1 request thành công, request kia nhận lỗi 409', async () => {
    const service = new PhieuDatCocService();

    // Request 1: Giường đang Trong → thành công
    let callCount = 0;
    const clientForReq1 = makeMockClient('Trong');
    const clientForReq2 = makeMockClient('Trong');

    (db.connect as jest.Mock)
      .mockResolvedValueOnce(clientForReq1)
      .mockResolvedValueOnce(clientForReq2);

    mockGiuongRepo.layTheoIdForUpdate
      .mockResolvedValueOnce({ magiuong: 5, maphong: 1, trangthaistr: 'Trong' }) // req1: còn Trong
      .mockResolvedValueOnce({ magiuong: 5, maphong: 1, trangthaistr: 'DangGiuCho' }); // req2: đã bị giữ

    mockPhieuRepo.taoPhieu.mockResolvedValueOnce({
      macoc: 100, magiuong: 5, maphong: 1, tiencoc: 4000000, thoigianhethan: new Date(),
    } as any);

    mockGiuongRepo.capNhatTrangThaiStr.mockResolvedValue(true);

    // Chạy song song
    const [res1, res2] = await Promise.allSettled([
      service.taoDatCoc(1, 5, 1),
      service.taoDatCoc(2, 5, 1),
    ]);

    // Req1 thành công
    expect(res1.status).toBe('fulfilled');
    if (res1.status === 'fulfilled') {
      expect(res1.value.maPDC).toBe(100);
    }

    // Req2 nhận lỗi 409
    expect(res2.status).toBe('rejected');
    if (res2.status === 'rejected') {
      expect(res2.reason.status).toBe(409);
      expect(res2.reason.message).toMatch(/DangGiuCho/);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST (b): Webhook idempotency — gọi 2 lần cùng maGiaoDich
// ─────────────────────────────────────────────────────────────────────────────
describe('(b) Webhook idempotency', () => {
  it('gọi 2 lần cùng maGiaoDich — chỉ xử lý 1 lần (lần 2 trả processed=false)', async () => {
    const service = new PhieuDatCocService();
    const maGiaoDich = 'PAYPAL_ORDER_ABC123';

    // Lần 1: chưa có record → xử lý bình thường
    mockPhieuRepo.layTheoMaGiaoDich
      .mockResolvedValueOnce(null) // lần 1: chưa có
      .mockResolvedValueOnce({ macoc: 10 } as any); // lần 2: đã có

    (db.query as jest.Mock).mockResolvedValue({
      rows: [{ macoc: 10, magiuong: 5, trangthaimoi: 'ChoThanhToan' }],
    });

    const client1 = makeMockClient();
    const client2 = makeMockClient();
    (db.connect as jest.Mock)
      .mockResolvedValueOnce(client1)
      .mockResolvedValueOnce(client2);

    mockPhieuRepo.layTheoIdForUpdate.mockResolvedValueOnce({
      macoc: 10, magiuong: 5, trangthaimoi: 'ChoThanhToan',
    } as any);
    mockPhieuRepo.capNhatTrangThai.mockResolvedValue(true);
    mockGiuongRepo.capNhatTrangThaiStr.mockResolvedValue(true);

    // Lần 1
    const r1 = await service.xuLyWebhookDatCoc(maGiaoDich);
    expect(r1.processed).toBe(true);

    // Lần 2 — đã có record DaThanhToan
    const r2 = await service.xuLyWebhookDatCoc(maGiaoDich);
    expect(r2.processed).toBe(false);

    // Repo chỉ được gọi update 1 lần
    expect(mockPhieuRepo.capNhatTrangThai).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST (c): Cron job hủy phiếu quá hạn
// ─────────────────────────────────────────────────────────────────────────────
describe('(c) Cron job huyPhieuQuaHan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('hủy các phiếu quá hạn và trả giường về Trong', async () => {
    const service = new PhieuDatCocService();

    const expiredPhieuList = [
      { macoc: 1, magiuong: 10, trangthaimoi: 'ChoThanhToan', email: 'a@test.com', hoten: 'A' },
      { macoc: 2, magiuong: 11, trangthaimoi: 'ChoXacNhanTienMat', email: 'b@test.com', hoten: 'B' },
    ];

    mockPhieuRepo.layPhieuQuaHan.mockResolvedValue(expiredPhieuList);

    // Mỗi phiếu cần 1 client
    const clients = expiredPhieuList.map(() => makeMockClient());
    let clientIdx = 0;
    (db.connect as jest.Mock).mockImplementation(() =>
      Promise.resolve(clients[clientIdx++])
    );

    mockPhieuRepo.layTheoIdForUpdate
      .mockResolvedValueOnce(expiredPhieuList[0] as any)
      .mockResolvedValueOnce(expiredPhieuList[1] as any);

    mockPhieuRepo.capNhatTrangThai.mockResolvedValue(true);
    mockGiuongRepo.capNhatTrangThaiStr.mockResolvedValue(true);

    await service.huyPhieuQuaHan();

    // Cả 2 phiếu đều bị hủy
    expect(mockPhieuRepo.capNhatTrangThai).toHaveBeenCalledTimes(2);
    expect(mockPhieuRepo.capNhatTrangThai).toHaveBeenCalledWith(expect.anything(), 1, 'DaHuy', {});
    expect(mockPhieuRepo.capNhatTrangThai).toHaveBeenCalledWith(expect.anything(), 2, 'DaHuy', {});

    // Cả 2 giường đều được nhả về Trong
    expect(mockGiuongRepo.capNhatTrangThaiStr).toHaveBeenCalledTimes(2);
    expect(mockGiuongRepo.capNhatTrangThaiStr).toHaveBeenCalledWith(expect.anything(), 10, 'Trong');
    expect(mockGiuongRepo.capNhatTrangThaiStr).toHaveBeenCalledWith(expect.anything(), 11, 'Trong');
  });

  it('phiếu không quá hạn thì không bị hủy', async () => {
    jest.clearAllMocks();
    const service = new PhieuDatCocService();
    mockPhieuRepo.layPhieuQuaHan.mockResolvedValue([]);
    await service.huyPhieuQuaHan();
    expect(mockPhieuRepo.capNhatTrangThai).not.toHaveBeenCalled();
    expect(mockGiuongRepo.capNhatTrangThaiStr).not.toHaveBeenCalled();
  });
});
