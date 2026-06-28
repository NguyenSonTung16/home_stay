import { HoanCocService } from '../../src/services/HoanCocService';
import { HopDongService } from '../../src/services/HopDongService';
import { PhieuKiemTraPhongService } from '../../src/services/PhieuKiemTraPhongService';

// Mock các class phụ thuộc để test độc lập tầng Service
jest.mock('../../src/services/HopDongService');
jest.mock('../../src/services/PhieuKiemTraPhongService');

describe('HoanCocService - Tinh Toan Chi Phi Doi Soat', () => {
  let hoanCocService: HoanCocService;
  let mockHopDongService: jest.Mocked<HopDongService>;
  let mockPhieuKiemTraService: jest.Mocked<PhieuKiemTraPhongService>;

  beforeEach(() => {
    // Xóa tất cả các trạng thái mock trước mỗi test
    jest.clearAllMocks();

    hoanCocService = new HoanCocService();
    // Lấy instance được mock ra để dễ dàng setup giá trị trả về
    mockHopDongService = (hoanCocService as any).hopDongService;
    mockPhieuKiemTraService = (hoanCocService as any).phieuKiemTraService;
  });

  it('Luồng 4c (Hoàn Cọc): Số dư > 0 do tiền cọc lớn hơn tiền phạt', async () => {
    // Setup Mock Data
    mockHopDongService.docThongTinHopDong.mockResolvedValue({ tienCoc: 5000000 });
    mockPhieuKiemTraService.docPhieuKiemTra.mockResolvedValue({
      mapkt: 1,
      phihuhong: 200000,
      phivesinh: 100000
    });

    const maHD = 101;
    const result = await hoanCocService.tinhToanChiPhiDoiSoat(maHD);

    expect(result.tienCoc).toBe(5000000);
    expect(result.tongKhauTru).toBe(300000); // 200k + 100k
    expect(result.thucNhanChi).toBe(4700000); // Số dư > 0 -> Phải trả lại khách 4.7 triệu
  });

  it('Luồng 4a/4b (Khách nợ tiền): Số dư < 0 do tiền phạt lớn hơn tiền cọc', async () => {
    // Setup Mock Data
    mockHopDongService.docThongTinHopDong.mockResolvedValue({ tienCoc: 2000000 });
    mockPhieuKiemTraService.docPhieuKiemTra.mockResolvedValue({
      mapkt: 2,
      phihuhong: 1500000,
      phivesinh: 800000
    });

    const maHD = 102;
    const result = await hoanCocService.tinhToanChiPhiDoiSoat(maHD);

    expect(result.tienCoc).toBe(2000000);
    expect(result.tongKhauTru).toBe(2300000); // 1.5M + 800k
    expect(result.thucNhanChi).toBe(-300000); // Số dư < 0 -> Khách nợ thêm 300k
  });

  it('Ném ra lỗi nếu không tìm thấy Hợp đồng', async () => {
    mockHopDongService.docThongTinHopDong.mockResolvedValue(null);

    await expect(hoanCocService.tinhToanChiPhiDoiSoat(999)).rejects.toThrow('Không tìm thấy hợp đồng');
  });

  it('Ném ra lỗi nếu chưa có Phiếu kiểm tra phòng', async () => {
    mockHopDongService.docThongTinHopDong.mockResolvedValue({ tienCoc: 1000000 });
    mockPhieuKiemTraService.docPhieuKiemTra.mockResolvedValue(null);

    await expect(hoanCocService.tinhToanChiPhiDoiSoat(999)).rejects.toThrow('Chưa có phiếu kiểm tra phòng cho hợp đồng này');
  });
});
