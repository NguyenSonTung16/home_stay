import { HopDongService } from './HopDongService';
import { PhieuKiemTraPhongService } from './PhieuKiemTraPhongService';
import { BangDoiSoatRepository } from '../repositories/BangDoiSoatRepository';
import { YeuCauTraPhongRepository } from '../repositories/YeuCauTraPhongRepository';
import { PaypalService } from './PaypalService';

export interface IBangDoiSoat {
  tienCoc: number;
  khauTru: number;
  thucNhanChi: number;
  maPKT: number;
  maNV: number;
}

export class HoanCocService {
  // Inject đúng các Service thay vì gọi trực tiếp DB (Tuân thủ Sequence Diagram)
  private hopDongService = new HopDongService();
  private phieuKiemTraService = new PhieuKiemTraPhongService();
  private bangDoiSoatRepo = new BangDoiSoatRepository();
  private yeuCauRepo = new YeuCauTraPhongRepository();
  private paypalService = new PaypalService();

  /**
   * Bước 1: Lấy danh sách hợp đồng chờ đối soát hoàn cọc
   */
  async docDanhSachChoDoiSoat() {
    // BDsBUS -> HdBUS: docDanhSachHopDong()
    return await this.hopDongService.docDanhSachHopDong(); 
  }

  /**
   * Bước 2 & 3: Tính toán chi phí đối soát
   */
  async tinhToanChiPhiDoiSoat(maHD: number) {
    // BDsBUS -> HdBUS: docThongTinHopDong(maHD)
    const hopDong = await this.hopDongService.docThongTinHopDong(maHD);
    if (!hopDong) throw new Error('Không tìm thấy hợp đồng');

    // BDsBUS -> PktBUS: docPhieuKiemTra(maHD)
    const phieuKiemTra = await this.phieuKiemTraService.docPhieuKiemTra(maHD);
    if (!phieuKiemTra) throw new Error('Chưa có phiếu kiểm tra phòng cho hợp đồng này');

    const yeuCau = await this.yeuCauRepo.docYeuCauTheoHD(maHD);
    if (!yeuCau) throw new Error('Không tìm thấy yêu cầu trả phòng');

    // Tiền cọc lấy chuẩn xác từ HopDongService
    const tienCoc = Number(hopDong.tienCoc || 0); 

    let phiPhatBaoTre = 0;
    let lyDoHienThi = yeuCau.lydo || '';
    if (lyDoHienThi.startsWith('[PENALTY_25]')) {
      phiPhatBaoTre = tienCoc * 0.25;
      lyDoHienThi = lyDoHienThi.replace('[PENALTY_25]', '').trim();
    }

    // Logic tính Tỷ lệ hoàn cọc
    const ngayKy = new Date(hopDong.ngayky);
    const ngayDuKien = new Date(yeuCau.ngaydukien);
    const ngayHetHan = new Date(hopDong.ngayhethan);
    
    ngayDuKien.setHours(0,0,0,0);
    ngayHetHan.setHours(0,0,0,0);

    let tyLeHoanCoc = 100;
    if (ngayDuKien < ngayHetHan) {
      // Trả trước hạn
      const diffTime = Math.abs(ngayDuKien.getTime() - ngayKy.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = diffDays / 30; // Ước tính số tháng
      if (months < 6) {
        tyLeHoanCoc = 50;
      } else {
        tyLeHoanCoc = 70;
      }
    }

    const tienHoanDinhMuc = tienCoc * (tyLeHoanCoc / 100);

    // Khấu trừ = Phí hư hỏng + Phí vệ sinh + Phí phạt báo trễ
    const tongKhauTru = Number(phieuKiemTra.phihuhong || 0) + Number(phieuKiemTra.phivesinh || 0) + phiPhatBaoTre;
    const thucNhanChi = tienHoanDinhMuc - tongKhauTru;

    return {
      maHD,
      maPKT: phieuKiemTra.mapkt,
      tienCoc,
      tyLeHoanCoc,
      tienHoanDinhMuc,
      tongKhauTru,
      thucNhanChi,
      phiPhatBaoTre,
      lyDoHienThi,
      chiTietPhieu: phieuKiemTra,
      stk: yeuCau.stknhancoc
    };
  }

  /**
   * Bước 4: Lưu bảng đối soát và phê duyệt
   */
  async luuBangDoiSoat(maHD: number) {
    try {
      // Tự động tính toán để có số liệu mới nhất
      const chiPhi = await this.tinhToanChiPhiDoiSoat(maHD);
      const bdsData = {
        tienCoc: chiPhi.tienCoc,
        khauTru: chiPhi.tongKhauTru,
        thucNhanChi: chiPhi.thucNhanChi,
        maPKT: chiPhi.maPKT,
        maNV: 1 // Hardcode nhân viên hiện tại
      };

      // GỌI PAYPAL PAYOUT NẾU THỰC NHẬN CHI >= 0
      let paypalResponse = null;
      let newHopDongState = 4; // Mặc định là 4 (Đã thanh lý)
      let newYeuCauState = 3;  // Mặc định là 3 (Đã hoàn tiền / Hoàn tất)

      if (chiPhi.thucNhanChi >= 0) {
        if (chiPhi.thucNhanChi > 0 && chiPhi.stk) {
          const amountUSD = chiPhi.thucNhanChi / 25000; // Tỷ giá 25000 VND = 1 USD
          const email = chiPhi.stk; // Lấy email từ trường stk
          const batchId = `HD${maHD}_${Date.now()}`;
          
          paypalResponse = await this.paypalService.sendPayout(
            email, 
            amountUSD, 
            `Hoan tien coc phong tro cho hop dong ${maHD}`, 
            batchId
          );
        }
      } else {
        // thucNhanChi < 0 -> Khách nợ tiền
        newHopDongState = 5; // Chờ thanh lý / Khách nợ
        newYeuCauState = 4;  // Khách nợ tiền -> Chờ khách thanh toán
      }

      // Cập nhật trạng thái hợp đồng
      await this.hopDongService.capNhatTrangThai(maHD, newHopDongState);

      // Cập nhật trạng thái yêu cầu trả phòng
      const maYC = await this.yeuCauRepo.layMaYCByMaHD(maHD);
      if (maYC) {
        await this.yeuCauRepo.capNhatTrangThai(maYC, newYeuCauState);
      }

      // Lưu bảng đối soát
      const result = await this.bangDoiSoatRepo.themPhanGhiMoi(bdsData);
      
      return {
        success: result,
        paypalResponse
      };
    } catch (error) {
      throw new Error(`Lỗi khi lưu bảng đối soát: ${(error as Error).message}`);
    }
  }
}
