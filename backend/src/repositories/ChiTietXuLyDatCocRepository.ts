import { db } from '../config/db';
import { ChiTietXuLyDatCoc } from '../models/PhieuDatCocDTO';

export class ChiTietXuLyDatCocRepository {
  /**
   * Tạo bản ghi chi tiết trong transaction.
   * Thường được gọi ngay sau khi INSERT PhieuDatCoc.
   */
  async taoChiTiet(client: any, maCoc: number, data: {
    maGiuong?: number | null;
    soGiuongThue?: number;
    thoiGianHetHan?: Date | null;
    minhChung?: string | null;
    nguoiXacNhan?: number | null;
    thoiGianXacNhan?: Date | null;
  }): Promise<ChiTietXuLyDatCoc> {
    const res = await client.query(
      `INSERT INTO ChiTietXuLyDatCoc
         (MaCoc, MaGiuong, SoGiuongThue, ThoiGianHetHan, MinhChung, NguoiXacNhan, ThoiGianXacNhan)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        maCoc,
        data.maGiuong ?? null,
        data.soGiuongThue ?? 1,
        data.thoiGianHetHan ?? null,
        data.minhChung ?? null,
        data.nguoiXacNhan ?? null,
        data.thoiGianXacNhan ?? null,
      ]
    );
    return res.rows[0];
  }

  /**
   * Lấy chi tiết theo MaCoc (không transaction).
   */
  async layTheoMaCoc(maCoc: number): Promise<ChiTietXuLyDatCoc | null> {
    const res = await db.query(
      `SELECT * FROM ChiTietXuLyDatCoc WHERE MaCoc = $1`,
      [maCoc]
    );
    return res.rows[0] ?? null;
  }

  /**
   * Lấy chi tiết theo MaCoc trong transaction (FOR UPDATE lock).
   */
  async layTheoMaCocForUpdate(client: any, maCoc: number): Promise<ChiTietXuLyDatCoc | null> {
    const res = await client.query(
      `SELECT * FROM ChiTietXuLyDatCoc WHERE MaCoc = $1 FOR UPDATE`,
      [maCoc]
    );
    return res.rows[0] ?? null;
  }

  /**
   * Cập nhật NguoiXacNhan và ThoiGianXacNhan sau khi nhân viên duyệt tiền mặt.
   */
  async capNhatThoiGianXacNhan(client: any, maCoc: number, maNV: number): Promise<boolean> {
    const res = await client.query(
      `UPDATE ChiTietXuLyDatCoc
       SET NguoiXacNhan = $1, ThoiGianXacNhan = NOW()
       WHERE MaCoc = $2`,
      [maNV, maCoc]
    );
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Cập nhật MinhChung (URL ảnh chứng từ / mã hóa đơn tiền mặt).
   */
  async capNhatMinhChung(client: any, maCoc: number, minhChung: string): Promise<boolean> {
    const res = await client.query(
      `UPDATE ChiTietXuLyDatCoc
       SET MinhChung = $1
       WHERE MaCoc = $2`,
      [minhChung, maCoc]
    );
    // Nếu chưa có dòng con thì INSERT (trường hợp phiếu cũ)
    if ((res.rowCount ?? 0) === 0) {
      await client.query(
        `INSERT INTO ChiTietXuLyDatCoc (MaCoc, MinhChung)
         VALUES ($1, $2)
         ON CONFLICT (MaCoc) DO UPDATE SET MinhChung = EXCLUDED.MinhChung`,
        [maCoc, minhChung]
      );
    }
    return true;
  }

  /**
   * Upsert bảng con — dùng khi cần đảm bảo dòng tồn tại trước khi UPDATE.
   */
  async upsert(client: any, maCoc: number, data: Partial<Omit<ChiTietXuLyDatCoc, 'macoc'>>): Promise<boolean> {
    const res = await client.query(
      `INSERT INTO ChiTietXuLyDatCoc
         (MaCoc, MaGiuong, SoGiuongThue, ThoiGianHetHan, MinhChung, NguoiXacNhan, ThoiGianXacNhan)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (MaCoc) DO UPDATE SET
         MaGiuong = COALESCE(EXCLUDED.MaGiuong, ChiTietXuLyDatCoc.MaGiuong),
         SoGiuongThue = COALESCE(EXCLUDED.SoGiuongThue, ChiTietXuLyDatCoc.SoGiuongThue),
         ThoiGianHetHan = COALESCE(EXCLUDED.ThoiGianHetHan, ChiTietXuLyDatCoc.ThoiGianHetHan),
         MinhChung = COALESCE(EXCLUDED.MinhChung, ChiTietXuLyDatCoc.MinhChung),
         NguoiXacNhan = COALESCE(EXCLUDED.NguoiXacNhan, ChiTietXuLyDatCoc.NguoiXacNhan),
         ThoiGianXacNhan = COALESCE(EXCLUDED.ThoiGianXacNhan, ChiTietXuLyDatCoc.ThoiGianXacNhan)`,
      [
        maCoc,
        data.magiuong ?? null,
        data.sogiuongthue ?? 1,
        data.thoigianhethan ?? null,
        data.minhchung ?? null,
        data.nguoixacnhan ?? null,
        data.thoigianxacnhan ?? null,
      ]
    );
    return (res.rowCount ?? 0) > 0;
  }
}
