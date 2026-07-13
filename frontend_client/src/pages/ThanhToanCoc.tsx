import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface PhieuCoc {
  macoc: number;
  sotien: string;
  ngaycoc: string;
  trangthai: number;
  tenphong: string;
  giatien: string;
}

export default function ThanhToanCoc() {
  const navigate = useNavigate();
  const [phieuList, setPhieuList] = useState<PhieuCoc[]>([]);
  const [selectedPhieu, setSelectedPhieu] = useState<PhieuCoc | null>(null);
  const [ptThanhToan, setPtThanhToan] = useState('Chuyển khoản');
  const [maGiaoDich, setMaGiaoDich] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDanhSach();
  }, []);

  const fetchDanhSach = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('currentUser');
      let maKH = 1;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        maKH = user.MaKH || user.makh || user.id || 1;
      }
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/booking/phieu-coc/chua-thanh-toan?maKH=${maKH}`);
      setPhieuList(res.data.data || []);
    } catch (err: any) {
      setError('Không thể tải danh sách phiếu cọc.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (phieu: PhieuCoc) => {
    setSelectedPhieu(phieu);
    setMaGiaoDich('');
    setPtThanhToan('Chuyển khoản');
    setMessage('');
    setError('');
  };

  const handleThanhToan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhieu) return;
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/booking/thanh-toan/xac-nhan`, {
        maCoc: selectedPhieu.macoc,
        ptThanhToan,
        maGiaoDich,
        minhChungUrl: 'https://example.com/receipt.jpg'
      });
      setMessage(`Thanh toán cho phiếu #${selectedPhieu.macoc} (Phòng ${selectedPhieu.tenphong}) đã được ghi nhận. Chờ quản lý phê duyệt.`);
      setSelectedPhieu(null);
      fetchDanhSach();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: string | number) => {
    return parseInt(String(val)).toLocaleString('vi-VN') + ' đ';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-4 py-3 flex justify-around items-center md:hidden z-50">
      <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-secondary">
        <span className="material-symbols-outlined">home</span>
        <span className="text-[10px]">Trang chủ</span>
      </button>
      <button onClick={() => navigate('/booking')} className="flex flex-col items-center gap-1 text-secondary">
        <span className="material-symbols-outlined">calendar_today</span>
        <span className="text-[10px]">Đặt phòng</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-primary">
        <span className="material-symbols-outlined">payments</span>
        <span className="text-[10px]">Thanh toán</span>
      </button>
      <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-secondary">
        <span className="material-symbols-outlined">person</span>
        <span className="text-[10px]">Cá nhân</span>
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-6 w-full max-w-5xl mx-auto bg-surface min-h-screen pb-24 font-['Inter']">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E0E3E5] text-[#00236F] hover:bg-gray-50 transition-colors shadow-sm">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-[24px] font-bold text-primary font-h1">Thanh toán cọc</h1>
      </div>
      <p className="text-[14px] text-secondary mb-6 font-body">Dưới đây là các phiếu đặt cọc chưa thanh toán. Chọn một phiếu để tiến hành thanh toán.</p>

      {/* Alerts */}
      {message && (
        <div className="p-4 mb-6 bg-success/10 border border-success/30 text-success rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5">check_circle</span>
          <span className="text-[14px] font-body">{message}</span>
          <button onClick={() => setMessage('')} className="ml-auto material-symbols-outlined text-success">close</button>
        </div>
      )}
      {error && (
        <div className="p-4 mb-6 bg-danger/10 border border-danger/30 text-danger rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5">error</span>
          <span className="text-[14px] font-body">{error}</span>
          <button onClick={() => setError('')} className="ml-auto material-symbols-outlined text-danger">close</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-secondary">
          <span className="material-symbols-outlined text-5xl animate-spin mb-3">progress_activity</span>
          <p className="text-[14px] font-body">Đang tải...</p>
        </div>
      ) : phieuList.length === 0 && !message ? (
        <div className="text-center py-16 text-secondary">
          <span className="material-symbols-outlined text-5xl mb-3">receipt_long</span>
          <p className="text-[14px] font-body">Không có phiếu đặt cọc nào cần thanh toán.</p>
          <p className="text-[12px] mt-2 font-caption">Bạn có thể tạo phiếu mới ở trang <strong className="text-primary">Đặt cọc</strong>.</p>
        </div>
      ) : (
        <div className="mb-6">
          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden md:block bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F9FB] border-b border-[#E5E7EB]">
                  <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider">Mã phiếu</th>
                  <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider">Phòng</th>
                  <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider text-right">Số tiền</th>
                  <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-[14px] font-body text-[#1F2937]">
                {phieuList.map(p => {
                  const isSelected = selectedPhieu?.macoc === p.macoc;
                  return (
                    <tr
                      key={p.macoc}
                      onClick={() => handleSelect(p)}
                      className={`border-b border-[#E5E7EB] cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/5' : 'hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-primary">#{p.macoc}</td>
                      <td className="px-4 py-3 font-medium">{p.tenphong}</td>
                      <td className="px-4 py-3 text-secondary">{formatDate(p.ngaycoc)}</td>
                      <td className="px-4 py-3 font-bold text-danger text-right">{formatCurrency(p.sotien)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                            isSelected ? 'bg-primary text-white' : 'bg-[#E5E7EB] text-[#4B5563] hover:bg-[#D1D5DB]'
                          }`}
                        >
                          {isSelected ? 'Đang chọn' : 'Thanh toán'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-based List (hidden on desktop) */}
          <div className="md:hidden space-y-3">
            {phieuList.map(p => {
              const isSelected = selectedPhieu?.macoc === p.macoc;
              return (
                <div
                  key={p.macoc}
                  onClick={() => handleSelect(p)}
                  className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected ? 'border-primary shadow-sm' : 'border-[#D1D5DB]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[12px] font-bold text-primary uppercase">Phiếu #{p.macoc}</span>
                      <h3 className="text-[16px] font-semibold text-[#1F2937]">{p.tenphong}</h3>
                    </div>
                    <span className="text-[16px] font-bold text-danger">{formatCurrency(p.sotien)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#E5E7EB]">
                    <span className="text-[12px] text-secondary">{formatDate(p.ngaycoc)}</span>
                    <button
                      className={`text-[12px] font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                        isSelected ? 'bg-primary text-white' : 'border border-secondary text-secondary'
                      }`}
                    >
                      {isSelected ? 'Đang chọn' : 'Thanh toán'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment form */}
      {selectedPhieu && (
        <div className="bg-white border-[2px] border-primary rounded-lg p-6 shadow-lg">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">payments</span>
            Thanh toán phiếu #{selectedPhieu.macoc} — Phòng {selectedPhieu.tenphong}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Payment info */}
            <div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 mb-4 text-center">
                <p className="text-[12px] font-semibold text-secondary mb-1 uppercase tracking-wider">Số tiền cần thanh toán</p>
                <p className="text-[28px] font-bold text-danger">{formatCurrency(selectedPhieu.sotien)}</p>
              </div>

              <div className="bg-[#F7F9FB] rounded-lg p-5 border border-[#E5E7EB]">
                <p className="font-semibold text-[14px] text-[#1F2937] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">account_balance</span>
                  Thông tin chuyển khoản
                </p>
                <div className="space-y-2 text-[14px] font-body">
                  <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                    <span className="text-secondary">Ngân hàng</span>
                    <span className="font-semibold text-[#1F2937]">Vietcombank (VCB)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E5E7EB] pb-2 pt-1">
                    <span className="text-secondary">Số tài khoản</span>
                    <span className="font-semibold text-primary tracking-wider">1234 5678 90</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E5E7EB] pb-2 pt-1">
                    <span className="text-secondary">Chủ tài khoản</span>
                    <span className="font-semibold text-[#1F2937]">CONG TY HOMESTAY</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-secondary">Nội dung CK</span>
                    <span className="font-bold text-danger bg-danger/10 px-2 py-0.5 rounded">DATCOC {selectedPhieu.macoc}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <form onSubmit={handleThanhToan} className="flex flex-col gap-4">
              <div>
                <label className="block text-[14px] font-semibold text-[#374151] mb-2">Phương thức thanh toán</label>
                <select
                  className="w-full px-4 py-3 border border-[#D1D5DB] bg-white rounded-lg focus:outline-none focus:border-primary focus:ring-[2px] focus:ring-primary/20 text-[14px] font-body text-[#1F2937] transition-shadow"
                  value={ptThanhToan}
                  onChange={e => setPtThanhToan(e.target.value)}
                >
                  <option value="Chuyển khoản">Chuyển khoản ngân hàng</option>
                  <option value="Tiền mặt">Tiền mặt (nộp tại quầy)</option>
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#374151] mb-2">
                  Mã giao dịch {ptThanhToan === 'Chuyển khoản' ? '(Trên app ngân hàng)' : '(Nhân viên ghi nhận)'}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-[#D1D5DB] bg-white rounded-lg focus:outline-none focus:border-primary focus:ring-[2px] focus:ring-primary/20 text-[14px] font-body text-[#1F2937] transition-shadow"
                  placeholder="VD: CK20250712001"
                  value={maGiaoDich}
                  onChange={e => setMaGiaoDich(e.target.value)}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-3 mt-auto pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedPhieu(null)}
                  className="px-[24px] py-[12px] border border-secondary bg-white text-secondary font-body font-semibold rounded-lg hover:bg-[#F9FAFB] transition-colors text-[14px] text-center"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-white px-[24px] py-[12px] rounded-lg font-body font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-[14px]"
                >
                  {submitting ? (
                    <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Đang gửi...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">send</span> Gửi xác nhận</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E0E3E5] flex justify-around items-center px-2 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center text-[#54647A] px-3 py-1.5 cursor-pointer active:scale-95 transition-transform"
        >
            <span className="material-symbols-outlined text-[20px]">home_work</span>
            <span className="text-[11px] font-normal mt-0.5">Tìm kiếm</span>
        </div>

        <div
            onClick={() => navigate('/dat-lich-hen')}
            className="flex flex-col items-center justify-center text-[#54647A] px-3 py-1.5 cursor-pointer active:scale-95 transition-transform"
        >
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            <span className="text-[11px] font-normal mt-0.5">Lịch hẹn</span>
        </div>

        <div
            onClick={() => navigate('/hop-dong')}
            className="flex flex-col items-center justify-center text-[#54647A] px-3 py-1.5 cursor-pointer active:scale-95 transition-transform"
        >
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            <span className="text-[11px] font-normal mt-0.5">Hợp đồng</span>
        </div>

        <div
            onClick={() => navigate('/lich-su-lich-hen')}
            className="flex flex-col items-center justify-center text-[#54647A] px-3 py-1.5 cursor-pointer active:scale-95 transition-transform"
        >
            <span className="material-symbols-outlined text-[20px]">history</span>
            <span className="text-[11px] font-normal mt-0.5">Lịch sử hẹn</span>
        </div>
      </nav>
    </div>
  );
}
