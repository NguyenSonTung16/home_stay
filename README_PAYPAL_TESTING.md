# Hướng dẫn Kiểm tra Chức năng Hoàn tiền qua PayPal (Payouts)

Chức năng hoàn tiền tự động qua PayPal Payouts đã được lập trình sẵn. Để test chức năng này tại local, bạn cần cấu hình Ngrok để nhận Webhooks từ PayPal.

## 1. Cài đặt và Chạy Ngrok
Ngrok giúp Public cái port `3000` ở localhost của bạn lên Internet, nhờ đó PayPal mới có thể gửi thông báo (Webhook) về máy bạn.

**Các bước:**
1. Tải và cài đặt [ngrok](https://ngrok.com/download) nếu máy bạn chưa có.
2. Mở Terminal (Command Prompt / PowerShell) và chạy lệnh:
   ```bash
   ngrok http 3000
   ```
3. Ngrok sẽ sinh ra một đường link dạng `https://xxxx.ngrok-free.app`. Hãy copy đường link HTTPS này.

## 2. Cấu hình Webhook trên PayPal Dashboard
1. Truy cập [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications) -> Chọn App của bạn.
2. Cuộn xuống phần **Sandbox Webhooks** -> Bấm **Add Webhook**.
3. Ở ô **Webhook URL**, dán đường link Ngrok vừa copy và thêm `/api/webhook/paypal` vào cuối. 
   - Ví dụ: `https://xxxx.ngrok-free.app/api/webhook/paypal`
4. Ở phần **Event types**, tích chọn sự kiện:
   - `Payment payoutsbatch success`
5. Bấm **Save**.

## 3. Quy trình Test luồng Hoàn tiền
1. **Bước 1 (Đóng vai Khách thuê):** Mở trình duyệt web, đăng nhập với quyền khách hàng. Chọn hợp đồng và bấm **Yêu cầu trả phòng**.
   - Tại ô **Số tài khoản / Email PayPal nhận cọc**, hãy **nhập Email của tài khoản PayPal Sandbox (Personal)**. Ví dụ: `sb-hepoi51529093@personal.example.com`.
   - Bấm gửi yêu cầu.

2. **Bước 2 (Đóng vai Kế toán):** Đăng nhập với quyền Kế toán (hoặc Quản lý tài chính).
   - Truy cập trang **Kế toán -> Chờ hoàn cọc**.
   - Tìm phiếu yêu cầu vừa tạo. Bấm nút **Phê duyệt**.
   - *Lúc này Backend sẽ quy đổi số tiền VNĐ sang USD (Tỷ giá 1 USD = 25000 VNĐ) và gọi API PayPal Payouts.*
   - Chờ một chút, nếu màn hình hiện "Phê duyệt thành công! Tiền cọc đang được xử lý qua PayPal" là OK.

3. **Bước 3 (Kiểm tra Ngrok & Webhook):**
   - Vài giây sau, hãy nhìn vào Terminal chạy Backend và Terminal chạy Ngrok. Bạn sẽ thấy dòng log: `[SUCCESS] Payout batch HDX_xxx completed successfully.`. Điều này chứng tỏ tiền đã chuyển xong.

4. **Bước 4 (Kiểm tra tiền vào túi Khách):**
   - Vào trang [Sandbox PayPal](https://sandbox.paypal.com).
   - Đăng nhập bằng Email và Password của tài khoản Personal (Sandbox).
   - Bạn sẽ thấy Số dư trong ví vừa được cộng thêm số USD quy đổi từ tiền hoàn cọc, với ghi chú "Hoan tien coc phong tro cho hop dong X".

Chúc bạn thành công!
