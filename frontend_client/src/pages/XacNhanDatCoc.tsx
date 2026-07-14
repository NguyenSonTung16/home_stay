import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

type PhuongThuc = 'ChuyenKhoan' | 'TienMat';
type TrangThai = 'ChoThanhToan' | 'DaThanhToan' | 'DaHuy' | 'ChoXacNhanTienMat';

interface PhieuInfo {
  maPDC: number;
  trangThai: TrangThai;
  tienCoc: number;
  thoiGianHetHan: string;
  tenPhong: string;
  phuongThuc: string | null;
}

interface PaymentData {
  paypalOrderId: string;
  approveUrl: string;
  qrImageUrl: string;
}

const API = import.meta.env.VITE_API_URL || '';

const formatCurrency = (val: number) =>
  val.toLocaleString('vi-VN') + 'đ';

function useCountdown(targetTime: string | null) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!targetTime) return;
    const tick = () => {
      const diff = new Date(targetTime).getTime() - Date.now();
      setRemaining(Math.max(0, diff));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isExpired = remaining === 0 && !!targetTime;
  return { hours, minutes, seconds, isExpired, remaining };
}

export const XacNhanDatCoc: React.FC = () => {
  const { maPDC } = useParams<{ maPDC: string }>();
  const navigate = useNavigate();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phieu, setPhieu] = useState<PhieuInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [phuongThuc, setPhuongThuc] = useState<PhuongThuc>('ChuyenKhoan');
  const [submitting, setSubmitting] = useState(false);

  // Nhánh ChuyenKhoan
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [pollingStatus, setPollingStatus] = useState<TrangThai | null>(null);

  // Nhánh TienMat
  const [maHoaDonTienMat, setMaHoaDonTienMat] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [chungTuSent, setChungTuSent] = useState(false);

  const countdown = useCountdown(phieu?.thoiGianHetHan ?? null);

  const fetchPhieu = useCallback(async () => {
    if (!maPDC) return;
    try {
      const res = await fetch(`${API}/api/booking/dat-coc/${maPDC}/status`);
      const data = await res.json();
      if (data.success) {
        setPhieu(data.data);
        // Nếu đã xong → chuyển sang trang kết quả
        if (['DaThanhToan', 'DaHuy'].includes(data.data.trangThai)) {
          navigate(`/ket-qua-dat-coc/${maPDC}`, { replace: true });
        }
        if (data.data.trangThai === 'ChoXacNhanTienMat') {
          setChungTuSent(true);
        }
      } else {
        setErrorMsg(data.message || 'Không tìm thấy phiếu đặt cọc');
      }
    } catch {
      setErrorMsg('Lỗi kết nối mạng');
    } finally {
      setLoading(false);
    }
  }, [maPDC, navigate]);

  useEffect(() => {
    fetchPhieu();
  }, [fetchPhieu]);

  // Polling khi ChuyenKhoan đang chờ
  useEffect(() => {
    if (paymentData && pollingStatus !== 'DaThanhToan') {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API}/api/booking/dat-coc/${maPDC}/status`);
          const data = await res.json();
          if (data.success) {
            const tt = data.data.trangThai as TrangThai;
            setPollingStatus(tt);
            if (tt === 'DaThanhToan' || tt === 'DaHuy') {
              clearInterval(pollingRef.current!);
              navigate(`/ket-qua-dat-coc/${maPDC}`, { replace: true });
            }
          }
        } catch { /* ignore */ }
      }, 3000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [paymentData, maPDC, navigate, pollingStatus]);

  // ── Tạo thanh toán online ──────────────────────────────────────────────
  const handleTaoThanhToanOnline = async () => {
    if (!phieu) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API}/api/booking/dat-coc/${maPDC}/thanh-toan-online`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPaymentData(data.data);
      } else {
        setErrorMsg(data.message || 'Lỗi tạo đơn thanh toán');
      }
    } catch {
      setErrorMsg('Lỗi kết nối');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Upload ảnh chứng từ ────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API}/api/booking/upload/chung-tu`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setUploadedUrl(data.url);
      } else {
        setErrorMsg('Upload thất bại: ' + data.message);
      }
    } catch {
      setErrorMsg('Lỗi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  // ── Gửi chứng từ tiền mặt ──────────────────────────────────────────────
  const handleGuiChungTu = async () => {
    if (!uploadedUrl || !maHoaDonTienMat) {
      setErrorMsg('Vui lòng nhập mã hóa đơn và upload ảnh chứng từ');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API}/api/booking/dat-coc/${maPDC}/thanh-toan-tien-mat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maHoaDonTienMat, urlChungTu: `${API}${uploadedUrl}` }),
      });
      const data = await res.json();
      if (data.success) {
        setChungTuSent(true);
        fetchPhieu();
      } else {
        setErrorMsg(data.message || 'Gửi chứng từ thất bại');
      }
    } catch {
      setErrorMsg('Lỗi kết nối');
    } finally {
      setSubmitting(false);
    }
  };

  // ── UI: Loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <span className="material-symbols-outlined animate-spin text-[#00236F] text-5xl">progress_activity</span>
      </div>
    );
  }

  if (!phieu) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#F7F9FB] gap-4">
        <span className="material-symbols-outlined text-5xl text-red-400">error</span>
        <p className="text-[#54647A] font-medium">{errorMsg || 'Không tìm thấy phiếu đặt cọc'}</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#00236F] text-white rounded-xl text-sm font-semibold">
          Về trang chủ
        </button>
      </div>
    );
  }

  const isExpired = countdown.isExpired;

  return (
    <div className="w-full min-h-screen bg-[#F7F9FB] pb-28 font-['Inter']">
      {/* Header */}
      <div className="bg-[#00236F] text-white p-6 pt-10 rounded-b-[32px] shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-white/10 transition">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold">Xác Nhận Đặt Cọc</h1>
        </div>
        <div className="bg-white/10 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-white/70 mb-0.5">Phòng</p>
            <p className="font-bold text-base">{phieu.tenPhong || '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70 mb-0.5">Tiền cọc</p>
            <p className="font-bold text-xl text-yellow-300">{formatCurrency(phieu.tienCoc)}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-4">
        {/* Error */}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>{errorMsg}
          </div>
        )}

        {/* Đồng hồ đếm ngược */}
        <div className={`rounded-2xl p-5 text-center border ${isExpired ? 'bg-red-50 border-red-200' : 'bg-white border-[#E0E3E5]'}`}>
          <p className="text-xs font-semibold text-[#54647A] uppercase tracking-wider mb-2">
            {isExpired ? '⚠️ Phiếu đã hết hạn' : '⏰ Thời gian còn lại'}
          </p>
          {!isExpired ? (
            <div className="flex justify-center gap-3">
              {[
                { val: countdown.hours, label: 'Giờ' },
                { val: countdown.minutes, label: 'Phút' },
                { val: countdown.seconds, label: 'Giây' },
              ].map(({ val, label }) => (
                <div key={label} className="bg-[#00236F] text-white rounded-xl w-16 py-2 flex flex-col items-center">
                  <span className="text-2xl font-bold tabular-nums">{String(val).padStart(2, '0')}</span>
                  <span className="text-[10px] font-medium opacity-70">{label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-600 font-bold">Phiếu này đã hết hạn. Vui lòng đặt cọc lại.</p>
          )}
        </div>

        {/* Chọn phương thức */}
        {!isExpired && !chungTuSent && !paymentData && (
          <div className="bg-white rounded-2xl border border-[#E0E3E5] p-5">
            <h3 className="font-bold text-[14px] text-[#191C1E] mb-4">Phương thức thanh toán</h3>
            <div className="space-y-3">
              {([
                { key: 'ChuyenKhoan', label: 'Chuyển khoản / PayPal', icon: 'account_balance_wallet', desc: 'Thanh toán qua PayPal, tự động xác nhận' },
                { key: 'TienMat', label: 'Tiền mặt (nộp tại quầy)', icon: 'payments', desc: 'Upload ảnh biên lai, Quản lý sẽ xác nhận' },
              ] as { key: PhuongThuc; label: string; icon: string; desc: string }[]).map(({ key, label, icon, desc }) => (
                <div
                  key={key}
                  onClick={() => setPhuongThuc(key)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                    phuongThuc === key ? 'border-[#00236F] bg-blue-50/40' : 'border-[#E0E3E5] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#00236F] text-2xl">{icon}</span>
                    <div>
                      <p className="font-bold text-xs text-[#191C1E]">{label}</p>
                      <p className="text-[10px] text-[#54647A]">{desc}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${phuongThuc === key ? 'border-[#00236F]' : 'border-[#C5C5D3]'}`}>
                    {phuongThuc === key && <div className="w-3 h-3 rounded-full bg-[#00236F]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── NHÁNH CHUYỂN KHOẢN ── */}
        {!isExpired && phuongThuc === 'ChuyenKhoan' && (
          <>
            {!paymentData ? (
              <button
                onClick={handleTaoThanhToanOnline}
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-[#00236F] text-white font-bold text-sm shadow-md hover:bg-[#1E3A8A] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {submitting && <span className="material-symbols-outlined animate-spin">progress_activity</span>}
                Tạo đơn thanh toán PayPal
              </button>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E0E3E5] p-5 space-y-4">
                <h3 className="font-bold text-[14px] text-[#191C1E] flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600">qr_code_2</span>
                  Quét QR để thanh toán
                </h3>
                <div className="flex flex-col md:flex-row gap-5 items-center">
                  <img
                    src={paymentData.qrImageUrl}
                    alt="QR thanh toán PayPal"
                    className="w-48 h-48 rounded-xl border border-[#E0E3E5] shadow-sm"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#54647A]">
                      <span className="material-symbols-outlined text-yellow-500 animate-spin">autorenew</span>
                      Đang chờ xác nhận thanh toán...
                    </div>
                    <a
                      href={paymentData.approveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#FFC439] text-[#003087] font-bold text-sm px-5 py-3 rounded-xl hover:brightness-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      Mở trang PayPal
                    </a>
                    <p className="text-[10px] text-[#54647A]">Sau khi thanh toán, trang sẽ tự động cập nhật.</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── NHÁNH TIỀN MẶT ── */}
        {!isExpired && phuongThuc === 'TienMat' && (
          <>
            {chungTuSent ? (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center space-y-3">
                <span className="material-symbols-outlined text-5xl text-amber-500">pending</span>
                <h3 className="font-bold text-[15px] text-amber-800">Đang chờ Quản lý xác nhận</h3>
                <p className="text-xs text-amber-700">Chứng từ của bạn đã được gửi. Quản lý sẽ xem xét và xác nhận trong thời gian sớm nhất.</p>
                <p className="text-[10px] text-amber-600">Bạn sẽ nhận email thông báo khi được xác nhận.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E0E3E5] p-5 space-y-4">
                <h3 className="font-bold text-[14px] text-[#191C1E] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00236F]">receipt_long</span>
                  Upload chứng từ thanh toán
                </h3>

                {/* Mã hóa đơn */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-2">
                    Mã hóa đơn / Biên lai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={maHoaDonTienMat}
                    onChange={e => setMaHoaDonTienMat(e.target.value)}
                    placeholder="VD: HD20250714001"
                    className="w-full px-4 py-3 border border-[#D1D5DB] rounded-xl text-sm focus:outline-none focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/20 transition"
                  />
                </div>

                {/* Upload ảnh */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-2">
                    Ảnh chứng từ <span className="text-red-500">*</span>
                  </label>
                  <label
                    htmlFor="upload-chungtru"
                    className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                      previewUrl ? 'border-[#00236F]/40 bg-blue-50/30' : 'border-[#D1D5DB] hover:border-[#00236F]/50 hover:bg-slate-50'
                    }`}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-xl p-2" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-[#54647A]">
                        <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                        <span className="text-xs font-medium">Nhấn để chọn ảnh (JPG/PNG, tối đa 5MB)</span>
                      </div>
                    )}
                    <input
                      id="upload-chungtru"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  {uploading && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#54647A]">
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      Đang upload...
                    </div>
                  )}
                  {uploadedUrl && !uploading && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Ảnh đã upload thành công
                    </p>
                  )}
                </div>

                <button
                  onClick={handleGuiChungTu}
                  disabled={submitting || uploading || !uploadedUrl || !maHoaDonTienMat}
                  className="w-full py-3.5 rounded-xl bg-[#00236F] text-white font-bold text-sm hover:bg-[#1E3A8A] active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  {submitting && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Gửi chứng từ để xác nhận
                </button>
              </div>
            )}
          </>
        )}

        {/* Expired state */}
        {isExpired && (
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-2xl border border-[#E0E3E5] bg-white text-[#374151] font-bold text-sm hover:bg-slate-50 transition-all"
          >
            Quay về tìm phòng
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default XacNhanDatCoc;
