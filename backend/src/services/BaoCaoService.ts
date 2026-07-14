import { BaoCaoRepository } from '../repositories/BaoCaoRepository';

export class BaoCaoService {
  private repository = new BaoCaoRepository();

  async layDoanhThuPhanRa(filters: {
    tuNgay: string;
    denNgay: string;
    granularity: 'day' | 'week' | 'month' | 'year';
    chiNhanh?: string;
  }): Promise<any[]> {
    const list = await this.repository.layDoanhThuPhanRa(filters);

    // Tính trung bình động (MA7) cho biến động doanh thu gộp
    const maPeriod = 7;
    for (let i = 0; i < list.length; i++) {
      let sum = 0;
      let count = 0;
      for (let j = Math.max(0, i - maPeriod + 1); j <= i; j++) {
        sum += list[j].tong;
        count++;
      }
      list[i].trungBinhDong = count > 0 ? Math.round(sum / count) : 0;
    }

    return list;
  }

  async laySummary(thang: number, nam: number, chiNhanh?: string): Promise<any> {
    // 1. Tính Doanh thu tháng hiện tại
    const currRevenue = await this.repository.layDoanhThuThang(thang, nam, chiNhanh);

    // 2. Tính Doanh thu tháng trước để so sánh %
    let prevThang = thang - 1;
    let prevNam = nam;
    if (prevThang === 0) {
      prevThang = 12;
      prevNam = nam - 1;
    }
    const prevRevenue = await this.repository.layDoanhThuThang(prevThang, prevNam, chiNhanh);

    let phanTramSoVoiThangTruoc = 0;
    if (prevRevenue > 0) {
      phanTramSoVoiThangTruoc = Math.round(((currRevenue - prevRevenue) / prevRevenue) * 100);
    } else if (currRevenue > 0) {
      phanTramSoVoiThangTruoc = 100;
    }

    // 3. Tính Doanh thu dự kiến
    const doanhThuDuKien = await this.repository.layDoanhThuDuKien(thang, nam, chiNhanh);

    // 4. Tính tỷ lệ thu hồi công nợ
    const tongCongNo = await this.repository.layTongCongNo(chiNhanh);
    const sumThuHoai = currRevenue + tongCongNo;
    const tyLeThuHoiCongNo = sumThuHoai > 0
      ? Math.round((currRevenue / sumThuHoai) * 100)
      : 100; // Mặc định là 100% nếu không có nợ và không có doanh thu

    return {
      tongDoanhThu: currRevenue,
      phanTramSoVoiThangTruoc,
      doanhThuDuKien,
      tyLeThuHoiCongNo
    };
  }

  async layDoanhThuTheoChiNhanh(thang: number, nam: number): Promise<any[]> {
    return await this.repository.layDoanhThuTheoChiNhanh(thang, nam);
  }
}
