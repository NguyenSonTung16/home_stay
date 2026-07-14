import { DoiSoatRepository } from '../repositories/DoiSoatRepository';
import XLSX from 'xlsx';

export class DoiSoatService {
  private repository = new DoiSoatRepository();

  async layDanhSachChiNhanh(): Promise<string[]> {
    return await this.repository.layDanhSachChiNhanh();
  }

  async layDanhSachDatCoc(filters: any) {
    return await this.repository.layDanhSachDatCoc(filters);
  }

  async layDanhSachHoaDonDinhKy(filters: any) {
    return await this.repository.layDanhSachHoaDonDinhKy(filters);
  }

  async layDanhSachHoaDonDienNuoc(filters: any) {
    return await this.repository.layDanhSachHoaDonDienNuoc(filters);
  }

  async laySummary(loai: 'dat-coc' | 'hoa-don-dinh-ky' | 'hoa-don-dien-nuoc', filters: any) {
    let summary: any;
    if (loai === 'dat-coc') {
      summary = await this.repository.laySummaryDatCoc({
        thang: filters.thang,
        nam: filters.nam,
        chiNhanh: filters.chiNhanh
      });
    } else if (loai === 'hoa-don-dinh-ky') {
      const formattedThang = (filters.thang && filters.nam) 
        ? `${filters.nam}-${String(filters.thang).padStart(2, '0')}` 
        : undefined;
      summary = await this.repository.laySummaryHoaDonDinhKy({
        thang: formattedThang,
        chiNhanh: filters.chiNhanh
      });
    } else {
      const formattedThang = (filters.thang && filters.nam) 
        ? `${filters.nam}-${String(filters.thang).padStart(2, '0')}` 
        : undefined;
      summary = await this.repository.laySummaryHoaDonDienNuoc({
        thang: formattedThang,
        chiNhanh: filters.chiNhanh
      });
    }

    const tyLeDoiSoat = summary.total > 0 
      ? Math.round((summary.processed / summary.total) * 100) 
      : 0;

    return {
      tongDoanhThu: summary.tongDoanhThu,
      choThanhToan: {
        soTien: summary.choThanhToanTien,
        soLuong: summary.choThanhToanSl
      },
      tyLeDoiSoat
    };
  }

  async exportExcel(loai: string, filters: any): Promise<Buffer> {
    let rawData: any[] = [];
    let sheetName = '';

    const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';
    const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

    const getStatusText = (status: string) => {
      switch (status) {
        case 'DaThanhToan': return 'Đã hoàn tất';
        case 'DaHuy': return 'Đã hủy';
        case 'ChoXacNhanTienMat': return 'Chờ xác nhận';
        case 'ChoThanhToan':
        case 'DangCho':
        case 'ChuaThanhToan':
        default: return 'Chờ thanh toán';
      }
    };

    if (loai === 'dat-coc') {
      sheetName = 'Đối soát Đặt cọc';
      const { list } = await this.repository.layDanhSachDatCoc({
        thang: filters.thang,
        nam: filters.nam,
        chiNhanh: filters.chiNhanh,
        trangThai: filters.trangThai
      });
      rawData = list.map(item => ({
        'Mã phiếu cọc': `#${item.macoc}`,
        'Khách hàng': item.hoten || '—',
        'Tên phòng': item.tenphong || '—',
        'Chi nhánh': item.chinhanh || '—',
        'Số tiền cọc': formatCurrency(Number(item.sotien)),
        'Phương thức': item.ptthanhtoan === 'ChuyenKhoan' ? 'Chuyển khoản' : item.ptthanhtoan === 'TienMat' ? 'Tiền mặt' : '—',
        'Mã giao dịch': item.magiaodich || '—',
        'Trạng thái': getStatusText(item.trangthai),
        'Ngày tạo': formatDate(item.thoigiantao),
        'Ngày xác nhận': formatDate(item.thoigianxacnhan)
      }));
    } else if (loai === 'hoa-don-dinh-ky') {
      sheetName = 'Đối soát Phí định kỳ';
      const formattedThang = (filters.thang && filters.nam) 
        ? `${filters.nam}-${String(filters.thang).padStart(2, '0')}` 
        : undefined;
      const { list } = await this.repository.layDanhSachHoaDonDinhKy({
        thang: formattedThang,
        chiNhanh: filters.chiNhanh,
        trangThai: filters.trangThai
      });
      rawData = list.map(item => ({
        'Mã hóa đơn': `#${item.mapdk}`,
        'Khách hàng': item.hoten || '—',
        'Hợp đồng': `#${item.mahd}`,
        'Tên phòng': item.tenphong || '—',
        'Chi nhánh': item.chinhanh || '—',
        'Tháng kỳ phí': item.thang,
        'Tiền phòng': formatCurrency(Number(item.tienphong)),
        'Tiền dịch vụ': formatCurrency(Number(item.tiendichvu)),
        'Tổng tiền': formatCurrency(Number(item.tongtien)),
        'Mã giao dịch': item.madh || '—',
        'Phương thức': item.phuongthuc === 'ChuyenKhoan' ? 'Chuyển khoản' : item.phuongthuc === 'TienMat' ? 'Tiền mặt' : '—',
        'Trạng thái': getStatusText(item.trangthai),
        'Ngày thanh toán': formatDate(item.ngaytao)
      }));
    } else if (loai === 'hoa-don-dien-nuoc') {
      sheetName = 'Đối soát Điện nước';
      const formattedThang = (filters.thang && filters.nam) 
        ? `${filters.nam}-${String(filters.thang).padStart(2, '0')}` 
        : undefined;
      const { list } = await this.repository.layDanhSachHoaDonDienNuoc({
        thang: formattedThang,
        chiNhanh: filters.chiNhanh,
        trangThai: filters.trangThai
      });
      rawData = list.map(item => ({
        'Mã hóa đơn': `#${item.mahddn}`,
        'Khách hàng đại diện': item.hoten || '—',
        'Tên phòng': item.tenphong || '—',
        'Chi nhánh': item.chinhanh || '—',
        'Tháng kỳ phí': item.thang,
        'Số điện cũ': item.csdiencu,
        'Số điện mới': item.csdienmoi,
        'Số nước cũ': item.csnuoccu,
        'Số nước mới': item.csnuocmoi,
        'Tiền điện': formatCurrency(Number(item.tiendien)),
        'Tiền nước': formatCurrency(Number(item.tiennuoc)),
        'Tổng cộng': formatCurrency(Number(item.tongtien)),
        'Mã giao dịch': item.madh || '—',
        'Phương thức': item.phuongthuc === 'ChuyenKhoan' ? 'Chuyển khoản' : item.phuongthuc === 'TienMat' ? 'Tiền mặt' : '—',
        'Trạng thái': getStatusText(item.trangthai),
        'Ngày thanh toán': formatDate(item.ngaytao)
      }));
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rawData);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async layChiTietHoaDonDinhKy(id: number) {
    return await this.repository.layChiTietHoaDonDinhKy(id);
  }

  async layChiTietHoaDonDienNuoc(id: number) {
    return await this.repository.layChiTietHoaDonDienNuoc(id);
  }
}
