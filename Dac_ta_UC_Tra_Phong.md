# Đặc tả Use Case: Nghiệp vụ Trả phòng

Dưới đây là toàn bộ đặc tả chi tiết của hệ thống liên quan đến quy trình **Yêu cầu trả phòng**, được trích xuất từ tài liệu của bạn.

---

## 1. UC Yêu cầu trả phòng
| Thuộc tính | Mô tả chi tiết |
| :--- | :--- |
| **Tên Use Case** | Yêu cầu trả phòng |
| **Tác nhân** | Khách thuê / Đại diện nhóm |
| **Tiền điều kiện** | Khách thuê đang ở trong phòng/giường thuê có hợp đồng đang hoạt động bình thường. |
| **Hậu điều kiện** | Yêu cầu trả phòng được gửi thành công lên hệ thống ở trạng thái "Chờ tiếp nhận", lịch hẹn kiểm tra phòng được thiết lập và thông báo cho bộ phận Sale. |
| **Luồng sự kiện chính** | 1. **Khách thuê** đăng nhập hệ thống, truy cập vào mục "Phòng thuê của tôi" và chọn nút "Đăng ký trả phòng".<br>2. **Hệ thống** hiển thị biểu mẫu Đăng ký trả phòng (tự động truy xuất Mã hợp đồng, Họ tên, Phòng/giường hiện tại).<br>3. **Khách thuê** nhập các thông tin yêu cầu:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Ngày dự kiến trả phòng mong muốn.<br>&nbsp;&nbsp;&nbsp;&nbsp;- Số tài khoản ngân hàng để nhận lại tiền cọc.<br>&nbsp;&nbsp;&nbsp;&nbsp;- Lý do trả phòng (Lý do cá nhân, hết hạn HĐ...).<br>4. **Khách thuê** kiểm tra thông tin và nhấn nút "Gửi yêu cầu trả phòng".<br>5. **Hệ thống** kiểm tra tính hợp lệ của ngày trả phòng dự kiến (phải sau ngày hiện tại ít nhất 1 ngày).<br>6. **Hệ thống** tạo Bản ghi yêu cầu trả phòng mới với trạng thái ban đầu là "Chờ tiếp nhận".<br>7. **Hệ thống** tự động đẩy đến bộ phận **Nhân viên Sale** để thông báo tiếp nhận yêu cầu. |
| **Luồng thay thế / Ngoại lệ** | **Ngoại lệ 5a - Ngày trả phòng không hợp lệ hoặc vi phạm quy tắc báo trước:**<br>Tại bước 5, nếu Khách thuê chọn ngày trả phòng trong quá khứ hoặc vi phạm thời hạn báo trước tối thiểu (ví dụ theo hợp đồng bắt buộc báo trước 30 ngày đối với trường hợp trả trước hạn):<br>1. Hệ thống ngăn không cho gửi yêu cầu.<br>2. Hiển thị cảnh báo quy định: *"Theo hợp đồng, bạn cần thông báo trả phòng trước tối thiểu 30 ngày. Vui lòng chọn lại ngày trả phòng từ [Ngày X] trở đi để không phát sinh thêm phí phạt báo trễ."*<br>3. Cho phép khách chọn lại ngày hoặc chấp nhận phí phạt gửi trễ để tiếp tục. |

---

## 2. Sơ đồ kiến trúc 3 lớp (3-Layer Architecture)

Dưới đây là sơ đồ lớp (Class Diagram) thể hiện cấu trúc 3 tầng (UI, BUS, DB) theo chuẩn mô hình bạn đã cung cấp:

```mermaid
classDiagram
    %% ======= TẦNG MÀN HÌNH (UI) =======
    class MH_YeuCauTraPhong {
        +dtpNgayTra: DatePicker
        +txtSTKNhanCoc: TextBox
        +txtLyDo: TextArea
        +btnGuiYeuCau: Button
        +hienThiThongTinHopDong() void
        +guiYeuCau() void
    }

    class MH_QuanLyHoSoDatCoc {
        +lsvDanhSachHoSo: ListView
        +btnDuyet: Button
        +btnTuChoi: Button
        +hienThiDanhSach() void
        +xemChiTiet(maHoSo: String) void
    }

    %% ======= TẦNG NGHIỆP VỤ (BUS) =======
    class YeuCauTraPhong_BUS {
        +KiemTraNgayHople(ngayTra: Date) Boolean
        +TinhPhiPhat(ngayTra: Date) Float
        +TaoYeuCauTraPhong(thongTin: Object) void
    }

    class PhongGiuong_BUS {
        +KiemTraTrangThai(maGiuong: String) Boolean
        +KiemTraDieuKien(maGiuong: String, gioiTinh: String, soLuong: Int) Boolean
        +CapNhatTrangThai(maGiuong: String, trangThai: String) void
    }

    class KhachHang_BUS {
        +LayThongTinKhachHang(maKH: String) Object
    }

    class PhieuDatCoc_BUS {
        +TaoYeuCauCoc(thongTin: Object) String
        +TinhTienCoc(maCoc: String) Float
        +KiemTraHan24h(maCoc: String) Boolean
        +CapNhatTrangThai(maCoc: String, trangThai: String) void
        +LayDanhSachChoDuyet() List
    }

    %% ======= TẦNG DỮ LIỆU (DB) =======
    class YeuCauTraPhong_DB {
        +ThemYeuCau(yeuCau: Object) void
    }

    class PhongGiuong_DB {
        +DocTrangThai(maGiuong: String) String
        +CapNhatTrangThai(maGiuong: String, trangThai: String) void
    }

    class KhachHang_DB {
        +DocThongTin(maKH: String) Object
    }

    class PhieuDatCoc_DB {
        +ThemPhieuCoc(phieu: Object) void
        +DocThongTin(maCoc: String) Object
        +CapNhatTrangThai(maCoc: String, trangThai: String) void
        +DocDanhSach(trangThai: String) List
    }

    %% ======= CÁC MỐI QUAN HỆ (UI -> BUS -> DB) =======
    MH_YeuCauTraPhong o-- YeuCauTraPhong_BUS
    MH_QuanLyHoSoDatCoc o-- PhongGiuong_BUS
    MH_QuanLyHoSoDatCoc o-- KhachHang_BUS
    MH_QuanLyHoSoDatCoc o-- PhieuDatCoc_BUS

    YeuCauTraPhong_BUS o-- YeuCauTraPhong_DB
    PhongGiuong_BUS o-- PhongGiuong_DB
    KhachHang_BUS o-- KhachHang_DB
    PhieuDatCoc_BUS o-- PhieuDatCoc_DB
```

---

## 3. Sơ đồ tuần tự (Sequence Diagram) - UC Yêu cầu trả phòng

Dưới đây là sơ đồ tuần tự thể hiện sự tương tác giữa Khách thuê và các lớp trong hệ thống khi thực hiện chức năng yêu cầu trả phòng:

```mermaid
sequenceDiagram
    autonumber
    actor KhachThue as Khách thuê
    participant MH as MH_YeuCauTraPhong
    participant BUS as TraPhongBUS
    participant DB as YeuCauTraPhongDB

    KhachThue->>MH: Chọn "Đăng ký trả phòng"
    MH-->>KhachThue: Hiển thị Form Đăng ký
    
    KhachThue->>MH: Nhập (NgayTra, STK, LyDo) & Bấm "Gửi yêu cầu"
    activate MH
    
    MH->>BUS: taoYeuCauTraPhong(NgayTra, STK, LyDo)
    activate BUS
    BUS->>BUS: kiemTraNgayHople(NgayTra)
    
    alt Ngày trả <= Ngày hiện tại hoặc vi phạm 30 ngày
        BUS-->>MH: Loi("Cần báo trước tối thiểu 30 ngày")
        MH-->>KhachThue: Hiển thị cảnh báo & Chọn lại ngày
    else Ngày hợp lệ
        BUS->>DB: ThemYeuCau(NgayTra, STK, LyDo, "Chờ tiếp nhận")
        activate DB
        DB-->>BUS: ThanhCong
        deactivate DB
        
        BUS->>BUS: guiThongBao(Sale)
        
        BUS-->>MH: ThanhCong
        deactivate BUS
        
        MH-->>KhachThue: Thông báo "Gửi yêu cầu thành công"
        deactivate MH
    end
```
