import { db } from '../config/db';

export function startCronJobs() {
  console.log('Starting background jobs...');
  
  // Chạy mỗi giờ (3600000 ms)
  setInterval(async () => {
    try {
      console.log('[CRON] Running cancel expired PhieuDatCoc job...');
      
      // Lấy các phiếu cọc trạng thái 1 (Cần thanh toán) quá 24h
      // Hoặc trạng thái 0 (Chờ Sale duyệt) quá 48h (tuỳ business, nhưng spec bảo sau 24h)
      // Spec: quá 24h kể từ lúc tạo đơn (Trạng thái = 1) mà chưa thanh toán -> Đã Hủy (4)
      
      const res = await db.query(`
        UPDATE PhieuDatCoc 
        SET TrangThaiMoi = 'DaHuy' 
        WHERE MaCoc IN (
          SELECT pdc.MaCoc 
          FROM PhieuDatCoc pdc
          LEFT JOIN ChiTietXuLyDatCoc ctdc ON pdc.MaCoc = ctdc.MaCoc
          WHERE (pdc.TrangThaiMoi = 'ChoThanhToan' AND ctdc.ThoiGianHetHan < NOW())
             OR (pdc.TrangThaiMoi = 'ChoDuyet' AND pdc.NgayCoc < CURRENT_DATE - INTERVAL '2 days')
        )
        RETURNING MaCoc, MaPhong
      `);

      if (res.rowCount && res.rowCount > 0) {
        console.log(`[CRON] Automatically canceled ${res.rowCount} expired reservations.`);
        // Note: Because we use virtual capacity calculation for beds, 
        // updating PhieuDatCoc to TrangThai = 4 automatically frees up the reserved capacity.
      }
    } catch (err) {
      console.error('[CRON] Error running cancel job:', err);
    }
  }, 3600000); // 1 hour
}
