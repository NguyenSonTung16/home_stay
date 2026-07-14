import { DonHangService } from '../../src/services/DonHangService';
import { DonHangRepository } from '../../src/repositories/DonHangRepository';
import { DonHangTrangThai } from '../../src/models/DonHangDTO';

jest.mock('../../src/repositories/DonHangRepository');
jest.mock('../../src/repositories/HoaDonDienNuocRepository');
jest.mock('../../src/repositories/HoaDonPhiDinhKyRepository');
jest.mock('../../src/services/EmailService');
jest.mock('../../src/config/db', () => {
  return {
    db: {
      connect: jest.fn().mockResolvedValue({
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn()
      }),
      query: jest.fn().mockResolvedValue({ rows: [] })
    }
  };
});

describe('DonHangService - Unit Tests', () => {
  let donHangService: DonHangService;

  beforeEach(() => {
    jest.clearAllMocks();
    donHangService = new DonHangService();
  });

  it('Xử lý webhook thanh toán lần đầu thành công', async () => {
    const mockOrder = {
      madh: 'ORDER_12345',
      loaihoadon: 'DienNuoc',
      mahoadon: 1,
      tongtien: 525000,
      trangthai: DonHangTrangThai.DangCho,
      thoigianhethan: new Date(Date.now() + 10 * 60 * 1000)
    };

    (DonHangRepository.prototype.layTheoId as jest.Mock).mockResolvedValue(mockOrder);
    (DonHangRepository.prototype.capNhatTTWithClient as jest.Mock).mockResolvedValue(true);

    const result = await donHangService.chuyenTTDonHang('ORDER_12345', DonHangTrangThai.DaThanhToan);
    
    expect(result).toBe(true);
    expect(DonHangRepository.prototype.capNhatTTWithClient).toHaveBeenCalledTimes(1);
  });

  it('Bỏ qua khi webhook gọi trùng lần thứ hai (idempotency)', async () => {
    const mockOrder = {
      madh: 'ORDER_12345',
      loaihoadon: 'DienNuoc',
      mahoadon: 1,
      tongtien: 525000,
      trangthai: DonHangTrangThai.DaThanhToan,
      thoigianhethan: new Date(Date.now() + 10 * 60 * 1000)
    };

    (DonHangRepository.prototype.layTheoId as jest.Mock).mockResolvedValue(mockOrder);

    const result = await donHangService.chuyenTTDonHang('ORDER_12345', DonHangTrangThai.DaThanhToan);
    
    expect(result).toBe(true);
    expect(DonHangRepository.prototype.capNhatTTWithClient).not.toHaveBeenCalled();
  });
});
