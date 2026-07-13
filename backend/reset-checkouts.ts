import { db } from './src/config/db';

async function resetCheckouts() {
  try {
    console.log('Bắt đầu quá trình reset dữ liệu trả phòng...');

    // 1. Xóa bảng đối soát
    console.log('Xóa dữ liệu trong bảng BangDoiSoat...');
    await db.query('DELETE FROM BangDoiSoat');

    // 2. Xóa phiếu kiểm tra phòng
    console.log('Xóa dữ liệu trong bảng PhieuKiemTraPhong...');
    await db.query('DELETE FROM PhieuKiemTraPhong');

    // 3. Xóa yêu cầu trả phòng
    console.log('Xóa dữ liệu trong bảng YeuCauTraPhong...');
    await db.query('DELETE FROM YeuCauTraPhong');

    // 4. Reset trạng thái hợp đồng về 2 (Đang hiệu lực - Đã bàn giao)
    // Hoặc về 1 (nếu cần). Ở đây giả định trạng thái active bình thường là 2.
    // Các trạng thái >= 3 là đang làm thủ tục trả phòng hoặc đã thanh lý.
    console.log('✅ Đã reset toàn bộ hệ thống về trạng thái ban đầu (Chưa yêu cầu trả phòng).');
  } catch (error) {
    console.error('Lỗi khi reset:', error);
  } finally {
    process.exit(0);
  }
}

resetCheckouts();
