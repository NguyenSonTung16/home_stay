import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const MHThanhToan: React.FC = () => {
  const { loaiHoaDon, maHoaDon } = useParams<{ loaiHoaDon: string; maHoaDon: string }>();
  const navigate = useNavigate();
  const [billDetails, setBillDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phuongThuc, setPhuongThuc] = useState('PayPal');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Tạo Idempotency Key duy nhất cho phiên thanh toán này khi mount
  const [idempotencyKey] = useState(() => `IDEM_${loaiHoaDon}_${maHoaDon}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

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

  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const token = getToken();
      if (!token) return;

      if (loaiHoaDon === 'DienNuoc') {
        // Lấy danh sách điện nước rồi tìm hóa đơn khớp ID
        // hoặc gọi API. Do endpoint lấy chi tiết chưa có riêng, ta fetch danh sách của phòng
        const infoRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/hoa-don/active-info`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const infoData = await infoRes.json();
        if (infoData.success && infoData.data?.maPhong) {
          const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/hoa-don/dien-nuoc/${infoData.data.maPhong}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            const bill = data.data.find((b: any) => b.mahddn === Number(maHoaDon));
            setBillDetails(bill);
          }
        }
      } else if (loaiHoaDon === 'PhiDinhKy') {
        const infoRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/hoa-don/active-info`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const infoData = await infoRes.json();
        if (infoData.success && infoData.data?.maHopDong) {
          const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/hoa-don/phi-dinh-ky/${infoData.data.maHopDong}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            const bill = data.data.find((b: any) => b.mapdk === Number(maHoaDon));
            setBillDetails(bill);
          }
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Không thể tải thông tin chi tiết hóa đơn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillDetails();
  }, [loaiHoaDon, maHoaDon]);

  const handleCreateOrder = async () => {
    try {
      setSubmitting(true);
      setErrorMsg('');
      const token = getToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/don-hang`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'idempotency-key': idempotencyKey
        },
        body: JSON.stringify({
          loaiHoaDon,
          phuongThuc,
          maHoaDon: Number(maHoaDon)
        })
      });

      const data = await response.json();
      if (data.success && data.data) {
        // Điều hướng sang màn hình hiển thị QR
        navigate(`/quet-qr/${data.data.maDH}`);
      } else {
        setErrorMsg(data.message || 'Lỗi khi tạo đơn hàng thanh toán.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Lỗi kết nối mạng, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <span className="material-symbols-outlined animate-spin text-[#00236F] text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F9FB] pb-24 font-['Inter']">
      {/* Header */}
      <div className="bg-[#00236F] text-white p-5 pt-10 rounded-b-[32px] shadow-sm mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/thanh-toan-dinh-ky')}
          className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Xác Nhận Thanh Toán</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-5">
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {errorMsg}
          </div>
        )}

        {billDetails ? (
          <>
            {/* Chi tiết hóa đơn */}
            <div className="bg-white rounded-2xl border border-[#E0E3E5] p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-[14px] text-[#191C1E] border-b border-[#F2F4F6] pb-3">Chi tiết hóa đơn</h3>
              <div className="space-y-2.5 text-xs text-[#54647A]">
                <div className="flex justify-between">
                  <span>Loại khoản chi:</span>
                  <span className="font-semibold text-[#191C1E]">
                    {loaiHoaDon === 'DienNuoc' ? 'Điện nước sinh hoạt' : 'Tiền thuê phòng & Dịch vụ'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kỳ thanh toán:</span>
                  <span className="font-semibold text-[#191C1E]">{billDetails.thang}</span>
                </div>
                {loaiHoaDon === 'DienNuoc' && (
                  <>
                    <div className="flex justify-between">
                      <span>Tiền điện:</span>
                      <span className="font-semibold text-[#191C1E]">{Number(billDetails.tiendien).toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiền nước:</span>
                      <span className="font-semibold text-[#191C1E]">{Number(billDetails.tiennuoc).toLocaleString()}đ</span>
                    </div>
                  </>
                )}
                {loaiHoaDon === 'PhiDinhKy' && (
                  <>
                    <div className="flex justify-between">
                      <span>Tiền phòng:</span>
                      <span className="font-semibold text-[#191C1E]">{Number(billDetails.tienphong).toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiền dịch vụ khác:</span>
                      <span className="font-semibold text-[#191C1E]">{Number(billDetails.tiendichvu).toLocaleString()}đ</span>
                    </div>
                  </>
                )}
                <div className="pt-3 border-t border-[#F2F4F6] flex justify-between items-center text-sm">
                  <span className="font-bold text-[#191C1E]">Số tiền cần trả:</span>
                  <span className="font-bold text-[#00236F] text-lg">
                    {Number(billDetails.tongtien).toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Chọn phương thức */}
            <div className="bg-white rounded-2xl border border-[#E0E3E5] p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-[14px] text-[#191C1E]">Chọn cổng thanh toán</h3>
              <div className="space-y-3">
                <div
                  onClick={() => setPhuongThuc('PayPal')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                    phuongThuc === 'PayPal' 
                      ? 'border-[#00236F] bg-blue-50/30' 
                      : 'border-[#E0E3E5] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#00236F] text-2xl">account_balance_wallet</span>
                    <div>
                      <p className="font-bold text-xs text-[#191C1E]">PayPal (Quốc tế)</p>
                      <p className="text-[10px] text-[#54647A]">Thanh toán bằng thẻ Visa/Mastercard hoặc tài khoản PayPal</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    phuongThuc === 'PayPal' ? 'border-[#00236F]' : 'border-[#C5C5D3]'
                  }`}>
                    {phuongThuc === 'PayPal' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00236F]"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Button xác nhận */}
            <button
              onClick={handleCreateOrder}
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-[#00236F] text-white font-bold text-sm shadow-md hover:bg-[#1E3A8A] active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting && (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              )}
              Tiến hành thanh toán
            </button>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E0E3E5] p-6 text-center text-xs text-[#54647A]">
            Không tìm thấy thông tin hóa đơn.
          </div>
        )}
      </div>
    </div>
  );
};
