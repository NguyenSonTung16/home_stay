/**
 * Migration v2: Bổ sung cột mới vào PhieuDatCoc và Giuong theo spec Thanh Toán Cọc
 * Chạy: npx tsx migrate_phieu_dat_coc_v2.ts
 */
import { db } from './src/config/db';

async function migrate() {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    console.log('[Migration v2] Bắt đầu...');

    // ─── 1. Bổ sung cột cho bảng PhieuDatCoc ───────────────────────────────
    console.log('[Migration v2] Cập nhật bảng PhieuDatCoc...');

    await client.query(`ALTER TABLE PhieuDatCoc ADD COLUMN IF NOT EXISTS MaGiuong INT REFERENCES Giuong(MaGiuong)`);
    await client.query(`ALTER TABLE PhieuDatCoc ADD COLUMN IF NOT EXISTS SoGiuongThue INT DEFAULT 1`);
    await client.query(`ALTER TABLE PhieuDatCoc ADD COLUMN IF NOT EXISTS TienThuePerThang NUMERIC(12,2) DEFAULT 0`);
    await client.query(`ALTER TABLE PhieuDatCoc ADD COLUMN IF NOT EXISTS TienCoc NUMERIC(12,2) DEFAULT 0`);
    await client.query(`ALTER TABLE PhieuDatCoc ADD COLUMN IF NOT EXISTS PhuongThucThanhToan VARCHAR(20)`);
    await client.query(`ALTER TABLE PhieuDatCoc ADD COLUMN IF NOT EXISTS TrangThaiMoi VARCHAR(30) DEFAULT 'ChoThanhToan'`);
    await client.query(`ALTER TABLE PhieuDatCoc ADD COLUMN IF NOT EXISTS UrlChungTu VARCHAR(500)`);
    await client.query(`ALTER TABLE PhieuDatCoc ADD COLUMN IF NOT EXISTS MaHoaDonTienMat VARCHAR(100)`);
    await client.query(`ALTER TABLE PhieuDatCoc ADD COLUMN IF NOT EXISTS NguoiXacNhan INT REFERENCES NhanVien(MaNV)`);
    await client.query(`ALTER TABLE PhieuDatCoc ADD COLUMN IF NOT EXISTS ThoiGianTao TIMESTAMP DEFAULT NOW()`);
    await client.query(`ALTER TABLE PhieuDatCoc ADD COLUMN IF NOT EXISTS ThoiGianHetHan TIMESTAMP`);
    await client.query(`ALTER TABLE PhieuDatCoc ADD COLUMN IF NOT EXISTS ThoiGianXacNhan TIMESTAMP`);
    await client.query(`ALTER TABLE PhieuDatCoc ADD COLUMN IF NOT EXISTS MaKHEmail VARCHAR(200)`);

    // ─── 2. Bổ sung cột TrangThaiStr cho Giuong (giữ INT cũ nguyên vẹn) ───
    console.log('[Migration v2] Cập nhật bảng Giuong...');
    await client.query(`ALTER TABLE Giuong ADD COLUMN IF NOT EXISTS TrangThaiStr VARCHAR(20) DEFAULT 'Trong'`);

    // Sync TrangThaiStr từ TrangThai INT cũ (0=Trong, 1=DangGiuCho, 2=DaCoc)
    await client.query(`
      UPDATE Giuong SET TrangThaiStr = CASE
        WHEN TrangThai = 0 THEN 'Trong'
        WHEN TrangThai = 1 THEN 'DangGiuCho'
        WHEN TrangThai = 2 THEN 'DaCoc'
        ELSE 'Trong'
      END
    `);

    // ─── 3. Sync TrangThaiMoi từ TrangThai INT cũ ─────────────────────────
    await client.query(`
      UPDATE PhieuDatCoc SET TrangThaiMoi = CASE
        WHEN TrangThai = 1 THEN 'ChoThanhToan'
        WHEN TrangThai = 2 THEN 'ChoXacNhanTienMat'
        WHEN TrangThai = 3 THEN 'DaThanhToan'
        ELSE 'ChoThanhToan'
      END
    `);

    // ─── 4. Đặt ThoiGianHetHan cho các phiếu cũ chưa có ──────────────────
    await client.query(`
      UPDATE PhieuDatCoc 
      SET ThoiGianTao = NgayCoc::TIMESTAMP,
          ThoiGianHetHan = NgayCoc::TIMESTAMP + INTERVAL '24 hours'
      WHERE ThoiGianHetHan IS NULL
    `);

    // ─── 5. Tạo thư mục uploads (sẽ tạo bằng mkdir trong app) ─────────────
    await client.query(`
      UPDATE PhieuDatCoc SET SoTien = 0 WHERE SoTien IS NULL
    `);

    await client.query('COMMIT');
    console.log('[Migration v2] Hoàn thành! Các cột đã được bổ sung.');
    process.exit(0);
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Migration v2] Lỗi — đã rollback:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate();
