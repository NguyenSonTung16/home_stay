-- ============================================================
-- Migration: 001_split_phieu_dat_coc.sql
-- Mục tiêu: Tách bảng PhieuDatCoc (21 cột) thành 2 bảng:
--   - PhieuDatCoc (8 cột gốc)
--   - ChiTietXuLyDatCoc (1-1 với PhieuDatCoc)
-- Theo pattern: YeuCauTraPhong <-> PhieuKiemTraPhong
-- ============================================================

-- ============================================================
-- BƯỚC 1: Tạo bảng ChiTietXuLyDatCoc
-- ============================================================
CREATE TABLE IF NOT EXISTS ChiTietXuLyDatCoc (
    MaCoc           INT NOT NULL,
    MaGiuong        INT,
    SoGiuongThue    INT DEFAULT 1,
    ThoiGianHetHan  TIMESTAMP,
    MinhChung       VARCHAR(500),
    NguoiXacNhan    INT,
    ThoiGianXacNhan TIMESTAMP,
    PRIMARY KEY (MaCoc),
    FOREIGN KEY (MaCoc)         REFERENCES PhieuDatCoc(MaCoc) ON DELETE CASCADE,
    FOREIGN KEY (MaGiuong)      REFERENCES Giuong(MaGiuong),
    FOREIGN KEY (NguoiXacNhan)  REFERENCES NhanVien(MaNV)
);

-- ============================================================
-- BƯỚC 2: Di chuyển dữ liệu từ PhieuDatCoc → ChiTietXuLyDatCoc
-- Chỉ INSERT khi có ít nhất 1 cột nghiệp vụ khác NULL
-- ============================================================
INSERT INTO ChiTietXuLyDatCoc (
    MaCoc, MaGiuong, SoGiuongThue, ThoiGianHetHan,
    MinhChung, NguoiXacNhan, ThoiGianXacNhan
)
SELECT
    MaCoc,
    magiuong,
    COALESCE(sogiuongthue, 1),
    thoigianhethan,
    COALESCE(urlchungtu, mahoadontienmat),
    nguoixacnhan,
    thoigianxacnhan
FROM PhieuDatCoc
WHERE
    magiuong        IS NOT NULL
    OR thoigianhethan IS NOT NULL
    OR urlchungtu     IS NOT NULL
    OR mahoadontienmat IS NOT NULL
    OR nguoixacnhan   IS NOT NULL
    OR thoigianxacnhan IS NOT NULL
ON CONFLICT (MaCoc) DO NOTHING;

-- ============================================================
-- BƯỚC 3: Đồng bộ SoTien ← TienCoc
-- (TienCoc là cột nghiệp vụ v2, SoTien là cột gốc ban đầu)
-- ============================================================
UPDATE PhieuDatCoc
SET SoTien = tiencoc
WHERE (SoTien = 0 OR SoTien IS NULL)
  AND tiencoc IS NOT NULL AND tiencoc > 0;

-- ============================================================
-- BƯỚC 4: Verify trước khi DROP
-- (Chạy tay để kiểm tra — không tự động thực thi)
-- SELECT COUNT(*) FROM PhieuDatCoc;
-- SELECT COUNT(*) FROM ChiTietXuLyDatCoc;
-- SELECT p.macoc, p.sotien, c.magiuong, c.thoigianhethan
--   FROM PhieuDatCoc p LEFT JOIN ChiTietXuLyDatCoc c ON p.macoc = c.macoc LIMIT 10;
-- ============================================================

-- ============================================================
-- BƯỚC 5: DROP các cột thừa khỏi PhieuDatCoc
-- Đưa về đúng 8 cột gốc:
--   macoc, sotien, ngaycoc, trangthaimoi (giữ làm TrangThai chính),
--   magiaodich, ptthanhtoan, makh, maphong
-- ============================================================
ALTER TABLE PhieuDatCoc
    DROP COLUMN IF EXISTS magiuong,
    DROP COLUMN IF EXISTS sogiuongthue,
    DROP COLUMN IF EXISTS tienthueperthang,
    DROP COLUMN IF EXISTS tiencoc,
    DROP COLUMN IF EXISTS phuongthucthanhtoan,
    DROP COLUMN IF EXISTS urlchungtu,
    DROP COLUMN IF EXISTS mahoadontienmat,
    DROP COLUMN IF EXISTS nguoixacnhan,
    DROP COLUMN IF EXISTS thoigiantao,
    DROP COLUMN IF EXISTS thoigianhethan,
    DROP COLUMN IF EXISTS thoigianxacnhan,
    DROP COLUMN IF EXISTS makhemail,
    DROP COLUMN IF EXISTS trangthai;
-- Ghi chú: giữ TrangThaiMoi (đổi tên ngầm là TrangThai logic trong code)
-- Ghi chú: giữ PTThanhToan (bỏ PhuongThucThanhToan đã drop ở trên)

-- ============================================================
-- KẾT QUẢ: PhieuDatCoc còn lại đúng 8 cột:
--   macoc, sotien, ngaycoc, trangthaimoi, magiaodich,
--   ptthanhtoan, makh, maphong
-- ============================================================
