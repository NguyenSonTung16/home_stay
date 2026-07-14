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
        SET TrangThai = 4 
        WHERE TrangThai = 1 
          AND NgayCoc < NOW() - INTERVAL '24 hours'
        RETURNING MaCoc, SoGiuong, MaPhong
      `);

      if (res.rowCount && res.rowCount > 0) {
        console.log(`[CRON] Automatically canceled ${res.rowCount} expired reservations.`);
        
        // Nhả trạng thái phòng/giường về Trống (0)
        // Vì hệ thống hiện tại count(TrangThai = 1) trên table Giuong để biết đã cọc,
        // nếu PhieuDatCoc bị huỷ, ta phải chuyển trạng thái Giuong về 0.
        // Nhưng wait, Giuong is reserved using capNhatTrangThaiNhieuGiuong(maGiuongList, 1) during taoPhieuDatCoc.
        // And we don't have a mapping between PhieuDatCoc and Giuong!
        // This is a known flaw in the current database design.
        // As a workaround, we can simply find N beds with TrangThai=1 for that room and set them to 0.
        
        for (const phieu of res.rows) {
          const { maphong, sogiuong } = phieu;
          const giuongHienTaiRes = await db.query(
            'SELECT MaGiuong FROM Giuong WHERE MaPhong = $1 AND TrangThai = 1 LIMIT $2',
            [maphong, sogiuong]
          );
          
          const maGiuongList = giuongHienTaiRes.rows.map(g => g.magiuong);
          if (maGiuongList.length > 0) {
            const ids = maGiuongList.join(',');
            await db.query(`UPDATE Giuong SET TrangThai = 0 WHERE MaGiuong IN (${ids})`);
          }
        }
      }
    } catch (err) {
      console.error('[CRON] Error running cancel job:', err);
    }
  }, 3600000); // 1 hour
}
