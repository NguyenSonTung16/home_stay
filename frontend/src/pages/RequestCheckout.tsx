import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export const RequestCheckout: React.FC = () => {
  const [ngayTra, setNgayTra] = useState('');
  const [lyDo, setLyDo] = useState('');
  const [stk, setStk] = useState('');
  const [acceptPenalty, setAcceptPenalty] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [statusData, setStatusData] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const navigate = useNavigate();

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/finance/tra-phong/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data && data.data.yeuCau) {
        setStatusData(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Validate if date is < 30 days
  const isPenaltyRequired = () => {
    if (!ngayTra) return false;
    const selectedDate = new Date(ngayTra);
    const currentDate = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    const diffTime = selectedDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 30 && diffDays >= 0;
  };

  const isInvalidDate = () => {
    if (!ngayTra) return false;
    const selectedDate = new Date(ngayTra);
    const currentDate = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    return selectedDate.getTime() < currentDate.getTime();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isInvalidDate()) {
      setErrorMsg('Ngày trả phòng không được nằm trong quá khứ.');
      return;
    }

    if (isPenaltyRequired() && !acceptPenalty) {
      setErrorMsg('Bạn phải đồng ý với khoản phí phạt để tiếp tục do thông báo trễ.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/finance/tra-phong/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ngayTra,
          lyDo,
          stk,
          viPhamBaoTre: isPenaltyRequired()
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refetch state instead of alert and reload
        await fetchStatus();
      } else {
        setErrorMsg(data.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureDebt = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/finance/tra-phong/capture-debt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          maHD: statusData.hopDong.mahd
        })
      });
      const data = await response.json();
      if (data.success) {
        // Just refetch the state. React will re-render to the success screen
        // and the PayPal popup will close on its own because we did not halt the thread.
        await fetchStatus();
      } else {
        alert('Thanh toán thất bại: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi xử lý thanh toán.');
    }
  };

  if (loadingStatus) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8f9fa] md:bg-white">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  // Render Status Tracker View if a request exists
  if (statusData) {
    const { yeuCau, doiSoat, hopDong } = statusData;
    const isDebt = hopDong.trangthai === 5 || yeuCau.trangthai === 4;
    const isCompleted = hopDong.trangthai === 4 || yeuCau.trangthai === 3 || yeuCau.trangthai === 5;

    return (
      <div className="w-full min-h-screen bg-[#f8f9fa] md:bg-white">
        <div className="max-w-3xl mx-auto md:p-8 p-0 pb-36 animate-fade-in">
          <div className="hidden md:block mb-6">
            <div className="flex items-center gap-2 text-xs text-secondary mb-4">
              <span className="cursor-pointer hover:underline" onClick={() => navigate('/')}>Trang chủ</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="font-bold text-primary">Theo dõi trả phòng</span>
            </div>
            <h1 className="text-3xl font-bold text-[#002B7F] font-h1">Theo dõi trả phòng</h1>
          </div>

          <div className="md:hidden bg-[#002B7F] text-white p-6 rounded-b-2xl shadow-sm mb-6">
            <div className="flex items-center mb-6">
              <span className="material-symbols-outlined text-white mr-4 cursor-pointer" onClick={() => navigate('/')}>arrow_back</span>
              <h1 className="text-lg font-bold font-h1">Theo dõi trả phòng</h1>
            </div>
          </div>

          <div className="md:bg-white md:border md:border-outline-variant md:rounded-xl md:shadow-sm md:p-8 p-4 mt-4 md:mt-0 space-y-6">

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
              {yeuCau.trangthai === 1 && (
                <>
                  <span className="material-symbols-outlined text-4xl text-primary mb-3">pending_actions</span>
                  <h2 className="text-xl font-bold text-primary mb-2">Đã tiếp nhận yêu cầu</h2>
                  <p className="text-secondary">Vui lòng chờ quản lý tòa nhà liên hệ để kiểm tra phòng.</p>
                </>
              )}
              {yeuCau.trangthai === 2 && (
                <>
                  <span className="material-symbols-outlined text-4xl text-primary mb-3">fact_check</span>
                  <h2 className="text-xl font-bold text-primary mb-2">Đã kiểm tra phòng</h2>
                  <p className="text-secondary">Yêu cầu của bạn đang chờ kế toán đối soát tài chính và duyệt hoàn cọc.</p>
                </>
              )}
              {isCompleted && (
                <>
                  <span className="material-symbols-outlined text-4xl text-success mb-3">check_circle</span>
                  <h2 className="text-xl font-bold text-success mb-2">Đã hoàn tất trả phòng</h2>
                  <p className="text-secondary">Hợp đồng của bạn đã được thanh lý thành công.</p>
                </>
              )}
              {isDebt && (
                <>
                  <span className="material-symbols-outlined text-4xl text-error mb-3">warning</span>
                  <h2 className="text-xl font-bold text-error mb-2">Chờ thanh toán công nợ</h2>
                  <p className="text-secondary mb-4">Bạn cần thanh toán khoản chi phí phát sinh để hoàn tất thủ tục thanh lý hợp đồng.</p>
                </>
              )}
            </div>

            {doiSoat && (
              <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 border-b border-outline-variant pb-2">Bảng đối soát tài chính</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary">Tiền cọc gốc:</span>
                    <span className="font-bold">{doiSoat.tienCoc?.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Tiền hoàn định mức:</span>
                    <span className="font-bold text-primary">{doiSoat.tienHoanDinhMuc?.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Chi phí phát sinh & Phạt:</span>
                    <span className="font-bold text-error">-{doiSoat.tongKhauTru?.toLocaleString()}đ</span>
                  </div>
                  <div className="pt-3 border-t border-outline-variant flex justify-between items-center">
                    <span className="font-bold text-base">Tổng số dư:</span>
                    <span className={`font-bold text-xl ${doiSoat.thucNhanChi < 0 ? 'text-error' : 'text-primary'}`}>
                      {doiSoat.thucNhanChi?.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isDebt && doiSoat && (
              <div className="mt-6 bg-error/5 p-6 rounded-xl border border-error/20">
                <h3 className="font-bold text-error mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">payments</span>
                  Thanh toán qua PayPal
                </h3>
                <PayPalScriptProvider options={{ "clientId": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
                  <PayPalButtons
                    createOrder={async () => {
                      const token = localStorage.getItem('token');
                      const response = await fetch('/api/finance/tra-phong/pay-debt', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          maHD: hopDong.mahd,
                          amount: Math.abs(doiSoat.thucNhanChi)
                        })
                      });
                      const data = await response.json();
                      if (data.success && data.data) {
                        return data.data.id;
                      }
                      throw new Error('Could not create order');
                    }}
                    onApprove={async (data) => {
                      await handleCaptureDebt(data.orderID);
                    }}
                    onError={(err) => {
                      alert('Có lỗi xảy ra khi thanh toán qua PayPal.');
                      console.error(err);
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Request Form (Original View)
  return (
    <div className="w-full h-full bg-[#f8f9fa] md:bg-white min-h-screen">
      <div className="max-w-3xl mx-auto md:p-8 p-0 pb-36 animate-fade-in">

        {/* --- DESKTOP HEADER --- */}
        <div className="hidden md:block mb-6">
          <div className="flex items-center gap-2 text-xs text-secondary mb-4">
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/')}>Trang chủ</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-bold text-primary">Yêu cầu trả phòng</span>
          </div>
          <h1 className="text-3xl font-bold text-[#002B7F] font-h1">Yêu cầu trả phòng</h1>
        </div>

        {/* --- MOBILE HEADER BANNER --- */}
        <div className="md:hidden bg-[#002B7F] text-white p-6 rounded-b-2xl shadow-sm">
          <div className="flex items-center mb-6">
            <span className="material-symbols-outlined text-white mr-4" onClick={() => navigate(-1)}>arrow_back</span>
            <h1 className="text-lg font-bold font-h1">Yêu cầu trả phòng</h1>
          </div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/80 mb-2">THÔNG BÁO KẾT THÚC HỢP ĐỒNG</p>
          <h2 className="text-2xl font-bold">Hoàn tất thủ tục trả phòng</h2>
        </div>

        <div className="md:bg-white md:border md:border-outline-variant md:rounded-xl md:shadow-sm md:p-8 p-4 mt-4 md:mt-0">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Ngày dự kiến */}
            <div>
              <label className="block text-sm font-bold text-body mb-2 md:text-[#333]">Ngày dự kiến trả phòng</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  className="w-full p-3.5 pr-12 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body bg-white shadow-sm md:shadow-none"
                  value={ngayTra}
                  onChange={(e) => setNgayTra(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
                  calendar_month
                </span>
              </div>
              {isInvalidDate() && (
                <p className="text-error text-xs mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  Không thể chọn ngày trong quá khứ.
                </p>
              )}
              {!isPenaltyRequired() && !isInvalidDate() && (
                <p className="text-xs text-error mt-2 flex items-center gap-1 md:text-error md:font-medium">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Lưu ý: Phải báo trước tối thiểu 30 ngày theo hợp đồng
                </p>
              )}

              {/* Cảnh báo phạt */}
              {isPenaltyRequired() && (
                <div className="mt-3 bg-error/10 border border-error/30 rounded-xl p-4">
                  <p className="text-error font-medium text-sm mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Báo trước &lt; 30 ngày (Vi phạm hợp đồng)
                  </p>
                  <p className="text-xs text-error/80 mb-3">
                    Chọn ngày này sẽ phát sinh <strong>phí phạt bằng 25% tiền cọc</strong>.
                  </p>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 text-primary rounded border-outline-variant"
                      checked={acceptPenalty}
                      onChange={(e) => setAcceptPenalty(e.target.checked)}
                    />
                    <span className="text-xs font-medium text-error">Tôi chấp nhận phát sinh phí phạt để tiếp tục.</span>
                  </label>
                </div>
              )}
            </div>

            {/* STK / PayPal */}
            <div>
              <label className="block text-sm font-bold text-body mb-2 md:text-[#333]">Số tài khoản / Email PayPal nhận cọc</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Email PayPal hoặc VCB - 123456789"
                  className="w-full p-3.5 pr-12 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body bg-white shadow-sm md:shadow-none"
                  value={stk}
                  onChange={(e) => setStk(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none md:hidden">
                  account_balance
                </span>
              </div>
            </div>

            {/* Lý do */}
            <div>
              <label className="block text-sm font-bold text-body mb-2 md:text-[#333]">Lý do trả phòng</label>
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  placeholder="Vui lòng chia sẻ lý do bạn trả phòng để chúng tôi cải thiện dịch vụ..."
                  className="w-full p-3.5 pr-12 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-body bg-white shadow-sm md:shadow-none"
                  value={lyDo}
                  onChange={(e) => setLyDo(e.target.value)}
                ></textarea>
                <span className="material-symbols-outlined absolute right-4 top-4 text-secondary pointer-events-none md:hidden">
                  rate_review
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-error/10 text-error text-sm rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {errorMsg}
              </div>
            )}

            {/* Submit Button & Cancel */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold bg-[#002B7F] text-white hover:bg-[#001F5C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading && <span className="material-symbols-outlined animate-spin">progress_activity</span>}
                Gửi yêu cầu
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>

              <div className="hidden md:block text-center mt-4">
                <button type="button" onClick={() => navigate(-1)} className="text-sm font-bold text-secondary hover:text-primary transition-colors">
                  Hủy bỏ
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* --- MOBILE SUPPORT BLOCK --- */}
        <div className="md:hidden mx-4 mt-6 bg-[#f1f3f5] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#2d4886] rounded-lg flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white">support_agent</span>
          </div>
          <div>
            <p className="font-bold text-body text-sm mb-0.5">Cần hỗ trợ thêm?</p>
            <p className="text-xs text-secondary">Liên hệ Ban quản lý tòa nhà FIT 4.0</p>
          </div>
        </div>

        {/* --- DESKTOP REFUND INFO BLOCK --- */}
        <div className="hidden md:flex mt-8 bg-[#e8f1ff] border border-[#d0e1ff] rounded-xl p-6 gap-4 items-start max-w-3xl mx-auto">
          <span className="material-symbols-outlined text-[#002B7F] shrink-0">help</span>
          <div>
            <p className="font-bold text-[#002B7F] text-sm mb-1">Quy trình hoàn cọc</p>
            <p className="text-xs text-[#002B7F]/80 leading-relaxed">
              Sau khi gửi yêu cầu, bộ phận quản lý sẽ liên hệ với bạn trong vòng 24h để xác nhận.
              Tiền cọc sẽ được hoàn trả sau 7-10 ngày làm việc kể từ ngày bàn giao phòng chính thức.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
