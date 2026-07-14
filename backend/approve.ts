import { db } from './src/config/db';

async function simulateAdminApproval() {
  try {
    console.log('--- BẮT ĐẦU MÔ PHỎNG DUYỆT ĐƠN ---');

    // 1. Nhân viên Sale duyệt đơn (Trạng thái 0 -> 1)
    const saleRes = await db.query(`
      UPDATE PhieuDatCoc 
      SET TrangThai = 1 
      WHERE TrangThai = 0
      RETURNING MaCoc
    `);
    
    if (saleRes.rowCount && saleRes.rowCount > 0) {
      console.log(`[Sale] Đã duyệt ${saleRes.rowCount} yêu cầu đặt cọc mới (Trạng thái 0 -> 1).`);
      saleRes.rows.forEach(r => console.log(`   - Mã phiếu: ${r.macoc} hiện đã có thể Thanh toán.`));
    } else {
      console.log(`[Sale] Không có yêu cầu đặt cọc mới nào chờ duyệt.`);
    }

    console.log('-----------------------------------');

    // 2. Kế toán duyệt giao dịch (Trạng thái 2 -> 3)
    const ketoanRes = await db.query(`
      UPDATE PhieuDatCoc 
      SET TrangThai = 3 
      WHERE TrangThai = 2
      RETURNING MaCoc
    `);

    if (ketoanRes.rowCount && ketoanRes.rowCount > 0) {
      console.log(`[Kế toán] Đã phê duyệt ${ketoanRes.rowCount} giao dịch chuyển khoản (Trạng thái 2 -> 3).`);
      ketoanRes.rows.forEach(r => console.log(`   - Mã phiếu: ${r.macoc} giao dịch đã hoàn tất.`));
    } else {
      console.log(`[Kế toán] Không có giao dịch chuyển khoản nào chờ duyệt.`);
    }

    console.log('--- HOÀN TẤT ---');
  } catch (error) {
    console.error('Lỗi khi duyệt đơn:', error);
  } finally {
    process.exit(0);
  }
}

simulateAdminApproval();
