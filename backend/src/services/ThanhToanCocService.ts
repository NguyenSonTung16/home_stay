import { PhieuDatCocRepository } from '../repositories/PhieuDatCocRepository';
import { db } from '../config/db';

export class ThanhToanCocService {
  private phieuDatCocRepo = new PhieuDatCocRepository();

  async layThongTinThanhToan(maCoc: number): Promise<any> {
    const phieu = await this.phieuDatCocRepo.getById(maCoc);
    if (!phieu) {
      throw new Error('Không tìm thấy phiếu đặt cọc.');
    }
    // Trạng thái sử dụng TrangThaiMoi (VARCHAR)
    if (!['ChoThanhToan', 'ChoDuyet'].includes(phieu.trangthaimoi)) {
      throw new Error('Phiếu đặt cọc không ở trạng thái chờ thanh toán.');
    }

    return {
      success: true,
      data: phieu
    };
  }

  async xacNhanThanhToan(maCoc: number, ptThanhToan: string, maGiaoDich: string, minhChung: string): Promise<any> {
    const phieu = await this.phieuDatCocRepo.getById(maCoc);
    if (!phieu) {
      throw new Error('Không tìm thấy phiếu đặt cọc.');
    }

    // Update status: chỉ cập nhật các cột thuộc PhieuDatCoc (8 cột gốc)
    const success = await this.phieuDatCocRepo.updateStatusAndTransaction(maCoc, 3, ptThanhToan, maGiaoDich);

    // Cập nhật MinhChung trong ChiTietXuLyDatCoc nếu có
    if (minhChung) {
      await db.query(
        `INSERT INTO ChiTietXuLyDatCoc (MaCoc, MinhChung)
         VALUES ($1, $2)
         ON CONFLICT (MaCoc) DO UPDATE SET MinhChung = EXCLUDED.MinhChung`,
        [maCoc, minhChung]
      );
    }

    if (!success) {
      throw new Error('Lỗi khi cập nhật thanh toán.');
    }

    return {
      success: true,
      message: 'Thanh toán thành công! Đặt cọc đã hoàn tất.'
    };
  }

  async huyThanhToanCoc(maCoc: number): Promise<any> {
    const phieu = await this.phieuDatCocRepo.getById(maCoc);
    if (!phieu) {
      throw new Error('Không tìm thấy phiếu đặt cọc.');
    }

    // Hủy bằng cách cập nhật TrangThaiMoi thay vì xóa
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query(`UPDATE PhieuDatCoc SET TrangThaiMoi = 'DaHuy' WHERE MaCoc = $1`, [maCoc]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return {
      success: true,
      message: 'Đã hủy phiếu đặt cọc thành công.'
    };
  }
}
