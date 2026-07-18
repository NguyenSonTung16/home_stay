import { HopDongRepository } from '../repositories/HopDongRepository';

export class HopDongService {
  private hopDongRepo = new HopDongRepository();

  async docDanhSachHopDong() {
    // Lấy các hợp đồng có trạng thái chờ hoàn cọc (VD: 3)
    return await this.hopDongRepo.layDanhSachTheoTrangThai(3);
  }

  async docThongTinHopDong(maHD: number) {
    const hopDong = await this.hopDongRepo.layThongTin(maHD);
    if (!hopDong) return null;
    
    // Tích hợp logic truy vấn chéo sang PhieuDatCoc thông qua MaKHDaiDien để lấy TienCoc
    // Giả lập trả về kèm thuộc tính tienCoc sau khi Join DB
    const tienCocTuDB = await this.hopDongRepo.layTienCocCuaHopDong(maHD);
    
    return {
      ...hopDong,
      tienCoc: tienCocTuDB
    };
  }

  async capNhatTrangThai(maHD: number, trangThai: number) {
    return await this.hopDongRepo.capNhatTrangThai(maHD, trangThai);
  }

  async layHopDongActiveTheoMaTK(maTK: number) {
    return await this.hopDongRepo.layHopDongActiveTheoMaTK(maTK);
  }

  async layHopDongGanNhatTheoMaTK(maTK: number) {
    return await this.hopDongRepo.layHopDongGanNhatTheoMaTK(maTK);
  }

  async layDanhSachHopDongTheoMaTK(maTK: number) {
    return await this.hopDongRepo.layDanhSachHopDongTheoMaTK(maTK);
  }
}
