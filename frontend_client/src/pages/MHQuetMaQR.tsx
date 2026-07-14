import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const MHQuetMaQR: React.FC = () => {
  const { maDH } = useParams<{ maDH: string }>();
  const navigate = useNavigate();
  const [trangThai, setTrangThai] = useState<'DangCho' | 'DaThanhToan' | 'ThatBai' | 'HetHan'>('DangCho');
  const [thoiGianHetHan, setThoiGianHetHan] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('15:00');
  const [loading, setLoading] = useState(true);

  // Chi tiết đơn hàng từ API status
  const [tongTien, setTongTien] = useState<number | null>(null);
  const [loaiHoaDon, setLoaiHoaDon] = useState<string>('');
  const [maHoaDon, setMaHoaDon] = useState<number | null>(null);
  const [phuongThuc, setPhuongThuc] = useState<string>('');

  const timerRef = useRef<any>(null);
  const pollingRef = useRef<any>(null);

  const getToken = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.token || localStorage.getItem('token');
      } catch (e) {
        return localStorage.getItem('token');
      }
    }
    return localStorage.getItem('token');
  };

  const fetchStatus = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/don-hang/${maDH}/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data) {
        const order = data.data;
        setTrangThai(order.trangThai);
        setThoiGianHetHan(order.thoiGianHetHan);
        setTongTien(order.tongTien);
        setLoaiHoaDon(order.loaiHoaDon);
        setMaHoaDon(order.maHoaDon);
        setPhuongThuc(order.phuongThuc);

        if (order.trangThai === 'DaThanhToan') {
          cleanup();
          navigate('/thanh-toan-ket-qua', { state: { status: 'DaThanhToan', maDH } });
        } else if (order.trangThai === 'ThatBai') {
          cleanup();
          navigate('/thanh-toan-ket-qua', { state: { status: 'ThatBai', maDH } });
        } else if (order.trangThai === 'HetHan') {
          cleanup();
          navigate('/thanh-toan-ket-qua', { state: { status: 'HetHan', maDH } });
        }
      }
    } catch (error) {
      console.error('Lỗi khi fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollingRef.current) clearInterval(pollingRef.current);
  };

  useEffect(() => {
    fetchStatus();

    // 1. Polling status mỗi 3 giây
    pollingRef.current = setInterval(() => {
      fetchStatus();
    }, 3000);

    return () => cleanup();
  }, [maDH]);

  useEffect(() => {
    if (!thoiGianHetHan) return;

    // 2. Đếm ngược thời gian hết hạn
    timerRef.current = setInterval(() => {
      const expirationTime = new Date(thoiGianHetHan).getTime();
      const difference = expirationTime - Date.now();

      if (difference <= 0) {
        cleanup();
        setTimeLeft('00:00');
        setTrangThai('HetHan');
        navigate('/thanh-toan-ket-qua', { state: { status: 'HetHan', maDH } });
      } else {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        const formatMin = minutes < 10 ? `0${minutes}` : minutes;
        const formatSec = seconds < 10 ? `0${seconds}` : seconds;
        setTimeLeft(`${formatMin}:${formatSec}`);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [thoiGianHetHan]);

  const approveUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${maDH}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(approveUrl)}`;

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <span className="material-symbols-outlined animate-spin text-[#00236F] text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F9FB] pb-12 font-['Inter'] flex flex-col justify-between">
      <div>
        {/* Compact Header */}
        <div className="bg-[#00236F] text-white px-4 py-3.5 shadow-md flex items-center gap-4">
          <button
            onClick={() => navigate('/thanh-toan-dinh-ky')}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-white text-xl">arrow_back</span>
          </button>
          <h1 className="text-base sm:text-lg font-bold">Thanh Toán Hóa Đơn</h1>
        </div>

        {/* Responsive Grid layout */}
        <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* COLUMN 1: Invoice details card and status card */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#E0E3E5] p-5 sm:p-7 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-[#F2F4F6] pb-4">
                  <div>
                    <h2 className="font-bold text-base text-[#191C1E]">Thông tin đơn hàng</h2>
                    <p className="text-[11px] text-[#54647A] mt-0.5">Hệ thống Quản lý Kí túc xá / Nhà trọ</p>
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                    trangThai === 'DaThanhToan' 
                      ? 'bg-green-50 text-green-600 border border-green-200' 
                      : trangThai === 'HetHan'
                      ? 'bg-slate-100 text-slate-500 border border-slate-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse'
                  }`}>
                    {trangThai === 'DaThanhToan' ? 'Đã thanh toán' : trangThai === 'HetHan' ? 'Đã hết hạn' : 'Đang chờ'}
                  </span>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex justify-between py-1 border-b border-[#F8FAFC] gap-4">
                    <span className="text-[#54647A] shrink-0">Mã đơn hàng:</span>
                    <span className="font-bold text-[#191C1E] select-all break-all text-right font-mono">{maDH}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F8FAFC]">
                    <span className="text-[#54647A]">Loại hóa đơn:</span>
                    <span className="font-semibold text-[#191C1E]">
                      {loaiHoaDon === 'DienNuoc' ? 'Hóa đơn Điện nước' : 'Phí thuê phòng & Dịch vụ'}
                    </span>
                  </div>
                  {maHoaDon && (
                    <div className="flex justify-between py-1 border-b border-[#F8FAFC]">
                      <span className="text-[#54647A]">Mã hóa đơn gốc:</span>
                      <span className="font-semibold text-[#191C1E]">#{maHoaDon}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-[#F8FAFC]">
                    <span className="text-[#54647A]">Cổng thanh toán:</span>
                    <span className="font-semibold text-[#00236F] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                      {phuongThuc || 'PayPal'}
                    </span>
                  </div>
                  <div className="pt-4 flex justify-between items-center border-t border-[#F2F4F6]">
                    <span className="font-bold text-sm sm:text-base text-[#191C1E]">Tổng tiền cần trả:</span>
                    <span className="font-extrabold text-lg sm:text-xl text-[#00236F]">
                      {tongTien ? `${Number(tongTien).toLocaleString()} đ` : '---'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Status Card (Moved under invoice info) */}
              <div className="bg-white border border-[#E0E3E5] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-[#F2F4F6] pb-3">
                  <span className="material-symbols-outlined text-[#00236F] text-[18px] sm:text-[20px]">sync_saved_locally</span>
                  <h3 className="font-bold text-xs sm:text-sm text-[#191C1E]">Trạng thái giao dịch</h3>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="flex shrink-0 w-8 h-8 rounded-full bg-[#00236F]/10 items-center justify-center">
                    <span className="material-symbols-outlined animate-spin text-[#00236F] text-[16px] sm:text-[18px]">progress_activity</span>
                  </div>
                  <div className="space-y-0.5 text-left">
                    <p className="font-bold text-xs text-[#191C1E]">
                      {trangThai === 'DangCho' ? 'Đang chờ thanh toán' : trangThai === 'HetHan' ? 'Đơn hàng hết hạn' : 'Đang xử lý'}
                    </p>
                    <p className="text-[10px] text-[#54647A]">PayPal status: <span className="font-mono font-semibold">{trangThai}</span></p>
                  </div>
                </div>

                <p className="text-[10px] sm:text-xs text-[#54647A] leading-relaxed text-left">
                  Hệ thống đang tự động đồng bộ trạng thái thanh toán từ PayPal mỗi 3 giây. Vui lòng không đóng trang này cho đến khi nhận được thông báo kết quả.
                </p>
              </div>
            </div>

            {/* COLUMN 2: QR Code and countdown */}
            <div className="space-y-6">
              {/* Separate Countdown Banner */}
              <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EF4444] animate-spin text-[20px]">hourglass_bottom</span>
                  <span className="text-xs font-semibold text-[#EF4444]">Đơn hàng tự động hủy sau:</span>
                </div>
                <span className="text-xl font-extrabold text-[#EF4444] font-mono">{timeLeft}</span>
              </div>

              {/* Large QR Code Container */}
              <div className="bg-white border border-[#E0E3E5] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center space-y-6">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl shadow-inner flex items-center justify-center w-full max-w-[280px] aspect-square relative overflow-hidden">
                  <div className="qr-scanner-line"></div>
                  <img src={qrImageUrl} alt="PayPal QR Code" className="w-full h-full object-contain" />
                </div>

                <div className="text-center space-y-1.5 w-full px-2">
                  <p className="font-bold text-xs sm:text-sm text-[#191C1E]">Quét mã QR bằng ứng dụng PayPal</p>
                  <p className="text-[10px] sm:text-xs text-[#54647A] leading-relaxed">
                    Mở ứng dụng PayPal trên thiết bị di động, quét mã để thanh toán. Hoặc bấm trực tiếp vào nút bên dưới để mở trang thanh toán PayPal.
                  </p>
                </div>

                <div className="w-full pt-2 flex flex-col gap-3">
                  <a
                    href={approveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl bg-[#00236F] text-white font-bold text-xs sm:text-sm text-center shadow-md hover:bg-[#1E3A8A] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    Thanh toán trực tiếp qua link
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
