import cron from 'node-cron';
import { HoaDonPhiDinhKyRepository } from '../repositories/HoaDonPhiDinhKyRepository';
import { HoaDonPhiDinhKyDTO } from '../models/HoaDonPhiDinhKyDTO';

export class HoaDonPhiDinhKyService {
  private repository = new HoaDonPhiDinhKyRepository();

  public async layPDK(maHopDong: number): Promise<HoaDonPhiDinhKyDTO[]> {
    return await this.repository.layPDK(maHopDong);
  }

  public async chuyenTTHoaDon(maPDK: number, trangThai: 'ChuaThanhToan' | 'DaThanhToan'): Promise<boolean> {
    const check = await this.repository.layTheoId(maPDK);
    if (!check) {
      throw new Error(`Không tìm thấy hóa đơn định kỳ với mã ${maPDK}`);
    }
    return await this.repository.capNhatTT(maPDK, trangThai);
  }

  /**
   * Khởi động Cron Job tự động quét và tạo hóa đơn định kỳ vào ngày 25 hàng tháng
   */
  public static startCronJob(): void {
    console.log('[HoaDonPhiDinhKyService] Khởi động Cron Job tạo hóa đơn tự động lúc 00:00 ngày 25 hàng tháng...');
    
    // Cron expression: 0 0 25 * * -> 00:00 ngày 25 mỗi tháng
    cron.schedule('0 0 25 * *', async () => {
      console.log('[Cron Job] Bắt đầu tự động tạo hóa đơn định kỳ (Tiền phòng)...');
      await HoaDonPhiDinhKyService.runAutoGenerateInvoices();
    });
  }

  /**
   * Logic chính để quét và tạo hóa đơn (Tách ra để có thể gọi từ API test)
   */
  public static async runAutoGenerateInvoices(): Promise<{ processed: number, skipped: number, errors: number }> {
    let processed = 0;
    let skipped = 0;
    let errors = 0;
    const repo = new HoaDonPhiDinhKyRepository();

    try {
      // 1. Lấy tất cả hợp đồng còn hiệu lực
      const activeContracts = await repo.layDanhSachHopDongActive();
      console.log(`[Cron Job] Tìm thấy ${activeContracts.length} hợp đồng đang có hiệu lực.`);

      // 2. Xác định tháng hiện tại (kỳ hóa đơn) theo chuẩn YYYY-MM
      const now = new Date();
      const thang = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // 3. Xử lý từng hợp đồng
      for (const contract of activeContracts) {
        try {
          // Tính tiền phòng: Giá 1 giường * số giường thuê
          const tienPhong = Number(contract.giatien) * Number(contract.sogiuong);
          const maHD = contract.mahd;

          // Kiểm tra xem tháng này đã có hóa đơn chưa
          const exists = await repo.kiemTraHoaDonTonTai(maHD, thang);
          if (exists) {
            console.log(`[Cron Job] Hợp đồng #${maHD} đã có hóa đơn kỳ ${thang}. Bỏ qua.`);
            skipped++;
            continue;
          }

          // Sinh hóa đơn mới
          const maPDK = await repo.taoHoaDonTuDong(maHD, thang, tienPhong, 0); // Tiền dịch vụ tạm set là 0
          console.log(`[Cron Job] Tạo thành công Hóa đơn định kỳ #${maPDK} cho Hợp đồng #${maHD} (Tiền phòng: ${tienPhong}).`);
          processed++;
        } catch (innerError: any) {
          console.error(`[Cron Job] Lỗi khi tạo hóa đơn cho Hợp đồng #${contract.mahd}:`, innerError.message);
          errors++;
        }
      }

      console.log(`[Cron Job] Hoàn tất! Tạo mới: ${processed}, Bỏ qua: ${skipped}, Lỗi: ${errors}.`);
      return { processed, skipped, errors };
    } catch (error: any) {
      console.error('[Cron Job] Lỗi hệ thống khi quét tạo hóa đơn:', error);
      throw error;
    }
  }
}
