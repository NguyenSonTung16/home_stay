import { TraPhongService } from '../../src/services/TraPhongService';
import { YeuCauTraPhongRepository } from '../../src/repositories/YeuCauTraPhongRepository';
import { PhongService } from '../../src/services/PhongService';

jest.mock('../../src/repositories/YeuCauTraPhongRepository');
jest.mock('../../src/repositories/PhieuKiemTraPhongRepository');
jest.mock('../../src/services/PhongService');

describe('TraPhongService - Unit Tests', () => {
  let traPhongService: TraPhongService;

  beforeEach(() => {
    jest.clearAllMocks();
    traPhongService = new TraPhongService();
  });

  it('Lấy danh sách yêu cầu chờ trả phòng thành công', async () => {
    const mockData = [{ maYC: 1, trangThai: 1 }];
    (YeuCauTraPhongRepository.prototype.docDanhSachYeuCau as jest.Mock).mockResolvedValue(mockData);

    const result = await traPhongService.docDanhSachChoTraPhong();
    expect(result).toEqual(mockData);
    expect(YeuCauTraPhongRepository.prototype.docDanhSachYeuCau).toHaveBeenCalledTimes(1);
  });

  it('Xác nhận bàn giao phòng và đổi trạng thái phòng thành Trống', async () => {
    (PhongService.prototype.capNhatTrangThaiPhong as jest.Mock).mockResolvedValue(true);

    const pkt = {
      tinhTrang: 'Tốt',
      chiTietHuHong: '',
      phiHuHong: 0,
      phiVeSinh: 0,
      thuHoiKhoa: true,
      kyBienBan: true,
      maYC: 1,
      maNV: 1,
      maPhong: 102
    };

    const result = await traPhongService.taoPhieuKiemTra(pkt);

    expect(result.success).toBe(true);
    expect(PhongService.prototype.capNhatTrangThaiPhong).toHaveBeenCalledWith(102, 'Trống');
  });
});
