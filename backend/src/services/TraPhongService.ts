import { YeuCauTraPhongRepository } from '../repositories/YeuCauTraPhongRepository';
import { PhieuKiemTraPhongRepository } from '../repositories/PhieuKiemTraPhongRepository';
import { PhongService } from './PhongService';

export interface IPhieuKiemTra {
  tinhTrang: string;
  chiTietHuHong: string;
  phiHuHong: number;
  phiVeSinh: number;
  thuHoiKhoa: boolean;
  kyBienBan: boolean;
  maYC: number;
  maNV: number;
  maPhong: number; // Để update trạng thái phòng
}

export class TraPhongService {
  private yeuCauTraPhongRepo = new YeuCauTraPhongRepository();
  private phieuKiemTraRepo = new PhieuKiemTraPhongRepository();
  private phongService = new PhongService();

  async docDanhSachChoTraPhong() {
    return await this.yeuCauTraPhongRepo.docDanhSachYeuCau();
  }

  async traCuuThongTinThue(maHD: number) {
    const thietBi = await this.yeuCauTraPhongRepo.layThongTinPhongThue(maHD);
    const phieuKiemTra = await this.phieuKiemTraRepo.docPhieuKiemTraTheoMaHD(maHD);
    return { thietBi, phieuKiemTra };
  }

  async taoPhieuKiemTra(pkt: any) {
    // 1. Tính toán chi phí hư hỏng từ mảng chiTiet
    const phiHuHong = pkt.chiTiet ? pkt.chiTiet.reduce((sum: number, item: any) => sum + item.severity, 0) : 0;
    const tinhTrang = phiHuHong > 0 ? 'Có hư hỏng' : 'Bình thường';
    const chiTietHuHong = JSON.stringify(pkt.chiTiet || []);

    // 2. Tìm maYC từ maHD
    const maYC = await this.yeuCauTraPhongRepo.layMaYCByMaHD(pkt.maHD);
    if (!maYC) throw new Error('Không tìm thấy yêu cầu trả phòng cho hợp đồng này');

    // 3. Lưu phiếu kiểm tra vào CSDL
    await this.phieuKiemTraRepo.luuThongTinPKT({
      tinhTrang,
      chiTietHuHong,
      phiHuHong,
      phiVeSinh: pkt.phiVeSinh,
      thuHoiKhoa: pkt.thuHoiKhoa,
      kyBienBan: pkt.kyBienBan,
      maYC: maYC,
      maNV: 1 // Hardcode nhân viên hiện tại
    });
    
    // 4. Cập nhật trạng thái phòng thành "Trống" thông qua PhongService (đúng Sequence Diagram)
    await this.phongService.capNhatTrangThaiPhong(pkt.maPhong, "Trống");

    // 5. Cập nhật trạng thái Yêu cầu trả phòng = 2 (Đã xử lý)
    await this.yeuCauTraPhongRepo.capNhatTrangThai(maYC, 2);

    return { success: true, message: 'Cập nhật thành công' };
  }

  async ghiNhanKhieuNai(maHD: number, lyDo: string) {
    const maYC = await this.yeuCauTraPhongRepo.layMaYCByMaHD(maHD);
    if (!maYC) throw new Error('Không tìm thấy yêu cầu trả phòng cho hợp đồng này');

    // Cập nhật trạng thái thành 3 (Tranh chấp) và lưu nguyên nhân vào cột LyDo
    await this.yeuCauTraPhongRepo.capNhatTrangThaiVaLyDo(maYC, 3, lyDo);
    
    return { success: true, message: 'Đã chuyển sang trạng thái tranh chấp' };
  }

  async giaiQuyetKhieuNai(maHD: number) {
    const maYC = await this.yeuCauTraPhongRepo.layMaYCByMaHD(maHD);
    if (!maYC) throw new Error('Không tìm thấy yêu cầu trả phòng cho hợp đồng này');

    // Cập nhật trạng thái về 1 (Chờ kiểm kê) và xóa lý do
    await this.yeuCauTraPhongRepo.capNhatTrangThaiVaLyDo(maYC, 1, null);
    
    return { success: true, message: 'Đã giải quyết khiếu nại, có thể tiếp tục xử lý' };
  }
}
