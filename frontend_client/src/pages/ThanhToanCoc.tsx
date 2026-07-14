import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { RequireLoginPlaceholder } from '../components/RequireLoginPlaceholder';

interface PhieuCoc {
  macoc: number;
  sotien: string;
  ngaycoc: string;
  trangthai: number;
  tenphong: string;
  giatien: string;
  sogiuong: number;
  tienich: string | string[];
}

export default function ThanhToanCoc() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [phieuList, setPhieuList] = useState<PhieuCoc[]>([]);
  const [selectedPhieu, setSelectedPhieu] = useState<PhieuCoc | null>(null);
  const [ptThanhToan, setPtThanhToan] = useState('Chuyển khoản');
  const [maGiaoDich, setMaGiaoDich] = useState('');
  const [minhChung, setMinhChung] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    fetchDanhSach();
  }, [currentUser]);

  const fetchDanhSach = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const maKH = currentUser.user?.makh || currentUser.user?.id || (currentUser as any).id;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/booking/phieu-coc/danh-sach?maKH=${maKH}`);
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
    setPtThanhToan('Tiền mặt');
    setMinhChung(null);
    setMessage('');
    setError('');
  };

  const handleThanhToan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhieu) return;
    
    if (ptThanhToan === 'Tiền mặt' && !minhChung && !maGiaoDich) {
      setError('Vui lòng nhập mã giao dịch hoặc tải lên ảnh minh chứng.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      if (ptThanhToan === 'PayPal') {
        const token = currentUser?.token || localStorage.getItem('token');
        const donHangRes = await fetch(`${import.meta.env.VITE_API_URL}/api/don-hang`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'idempotency-key': `IDEM_DatCoc_${selectedPhieu.macoc}_${Date.now()}`
          },
          body: JSON.stringify({
            loaiHoaDon: 'DatCoc',
            phuongThuc: 'PayPal',
            maHoaDon: Number(selectedPhieu.macoc)
          })
        });
        const donHangData = await donHangRes.json();
        if (donHangData.success && donHangData.data?.qrImageUrl) {
          // URL thực sự của paypal nằm trong query data của qrImageUrl
          const rawData = new URL(donHangData.data.qrImageUrl).searchParams.get('data');
          if (rawData) {
            window.location.href = decodeURIComponent(rawData);
            return;
          }
        }
        alert('Lỗi tạo đơn hàng PayPal: ' + (donHangData.message || 'Unknown error'));
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('maCoc', selectedPhieu.macoc.toString());
      formData.append('ptThanhToan', ptThanhToan);
      formData.append('maGiaoDich', maGiaoDich);
      if (minhChung) {
        formData.append('minhChung', minhChung);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/booking/thanh-toan/xac-nhan`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        navigate('/thanh-toan-ket-qua', {
          state: {
            status: 'DaThanhToan',
            maDH: maGiaoDich || `CASH-${selectedPhieu.macoc}`,
            orderDetails: {
              maDH: maGiaoDich || `CASH-${selectedPhieu.macoc}`,
              trangThai: 'DaThanhToan',
              thoiGianHetHan: new Date().toISOString(),
              tongTien: Number(selectedPhieu.sotien),
              loaiHoaDon: 'DatCoc',
              maHoaDon: selectedPhieu.macoc,
              phuongThuc: ptThanhToan
            }
          }
        });
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: string | number) => {
    return parseInt(String(val || 0)).toLocaleString('vi-VN') + ' đ';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const parseTienIch = (tienichData: any) => {
    if (!tienichData) return ["wifi", "mayLanh", "tuCaNhan"];
    if (Array.isArray(tienichData)) return tienichData;
    try {
      return JSON.parse(tienichData);
    } catch {
      return ["wifi", "mayLanh", "tuCaNhan"];
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[12px] font-bold">Chờ Sale duyệt</span>;
      case 1: return <span className="bg-warning/10 text-warning px-3 py-1 rounded-full text-[12px] font-bold">Cần thanh toán</span>;
      case 2: return <span className="bg-success/10 text-success px-3 py-1 rounded-full text-[12px] font-bold">Đặt cọc thành công</span>;
      default: return <span className="bg-danger/10 text-danger px-3 py-1 rounded-full text-[12px] font-bold">Thất bại</span>;
    }
  };

  // Lọc dữ liệu
  const filteredList = phieuList.filter(p => {
    const matchRoom = p.tenphong.toLowerCase().includes(filterRoom.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.trangthai.toString() === filterStatus;
    
    let matchDate = true;
    if (filterDateFrom || filterDateTo) {
      const d = new Date(p.ngaycoc).getTime();
      if (filterDateFrom && d < new Date(filterDateFrom).getTime()) matchDate = false;
      if (filterDateTo && d > new Date(filterDateTo).getTime() + 86400000) matchDate = false; // +1 day to include end date
    }
    return matchRoom && matchStatus && matchDate;
  });

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
  const paginatedPhieu = filteredList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-4 md:p-6 w-full max-w-5xl mx-auto bg-surface min-h-screen pb-24 font-['Inter']">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E0E3E5] text-[#00236F] hover:bg-gray-50 transition-colors shadow-sm">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-[24px] font-bold text-primary font-h1">Phiếu cọc của tôi</h1>
      </div>

      {!currentUser ? (
        <RequireLoginPlaceholder message="Bạn cần đăng nhập để xem phiếu cọc và tiến hành thanh toán." />
      ) : loading ? (
        <div className="text-center py-16 text-secondary">
          <span className="material-symbols-outlined text-5xl animate-spin mb-3">progress_activity</span>
          <p className="text-[14px] font-body">Đang tải...</p>
        </div>
      ) : (
        <div className="mb-6 space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-[#D1D5DB] flex flex-wrap gap-4 items-end shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[12px] font-semibold text-secondary mb-1">Tìm phòng</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
                <input 
                  type="text" 
                  placeholder="Nhập tên phòng..."
                  value={filterRoom}
                  onChange={(e) => { setFilterRoom(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-[#E0E3E5] rounded-lg focus:outline-none focus:border-primary text-[14px]"
                />
              </div>
            </div>
            
            <div className="w-[180px]">
              <label className="block text-[12px] font-semibold text-secondary mb-1">Trạng thái</label>
              <select 
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2 border border-[#E0E3E5] rounded-lg focus:outline-none focus:border-primary text-[14px]"
              >
                <option value="all">Tất cả</option>
                <option value="0">Chờ Sale duyệt</option>
                <option value="1">Cần thanh toán</option>
                <option value="2">Đặt cọc thành công</option>
                <option value="4">Thất bại</option>
              </select>
            </div>

            <div className="flex gap-2 items-center">
              <div>
                <label className="block text-[12px] font-semibold text-secondary mb-1">Từ ngày</label>
                <input 
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border border-[#E0E3E5] rounded-lg focus:outline-none focus:border-primary text-[14px]"
                />
              </div>
              <span className="text-secondary mt-5">-</span>
              <div>
                <label className="block text-[12px] font-semibold text-secondary mb-1">Đến ngày</label>
                <input 
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border border-[#E0E3E5] rounded-lg focus:outline-none focus:border-primary text-[14px]"
                />
              </div>
            </div>
          </div>

          {filteredList.length === 0 ? (
            <div className="text-center py-16 text-secondary bg-white rounded-xl border border-[#D1D5DB]">
              <span className="material-symbols-outlined text-5xl mb-3">receipt_long</span>
              <p className="text-[14px] font-body">Không tìm thấy phiếu đặt cọc nào phù hợp.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#D1D5DB] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse hidden md:table">
                <thead>
                  <tr className="bg-[#F7F9FB] border-b border-[#E5E7EB]">
                    <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider">Mã phiếu</th>
                    <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider">Phòng</th>
                    <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider">Số giường</th>
                    <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider text-right">Số tiền</th>
                    <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-[14px] font-body text-[#1F2937]">
                  {paginatedPhieu.map(p => (
                    <tr
                      key={p.macoc}
                      onClick={() => handleSelect(p)}
                      className="border-b border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-4 py-4 font-semibold text-primary">#{p.macoc}</td>
                      <td className="px-4 py-4 font-medium">{p.tenphong}</td>
                      <td className="px-4 py-4 text-secondary">{p.sogiuong || 1} giường</td>
                      <td className="px-4 py-4 text-secondary">{formatDate(p.ngaycoc)}</td>
                      <td className="px-4 py-4 font-bold text-danger text-right">{formatCurrency(p.sotien)}</td>
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(p.trangthai)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile layout */}
              <div className="md:hidden divide-y divide-[#E5E7EB]">
                {paginatedPhieu.map(p => (
                  <div key={p.macoc} onClick={() => handleSelect(p)} className="p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[12px] font-bold text-primary uppercase">Phiếu #{p.macoc}</span>
                        <h3 className="text-[16px] font-semibold text-[#1F2937]">{p.tenphong} ({p.sogiuong || 1} giường)</h3>
                      </div>
                      <span className="text-[16px] font-bold text-danger">{formatCurrency(p.sotien)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#E5E7EB] border-dashed">
                      <span className="text-[12px] text-secondary">{formatDate(p.ngaycoc)}</span>
                      {getStatusBadge(p.trangthai)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex justify-center items-center rounded-xl border border-[#D1D5DB] text-[#4B5563] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-xl font-bold text-[14px] transition-colors ${
                                currentPage === page 
                                    ? "bg-[#00236F] text-white" 
                                    : "text-[#4B5563] hover:bg-white border border-transparent"
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex justify-center items-center rounded-xl border border-[#D1D5DB] text-[#4B5563] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Details & Payment */}
      {selectedPhieu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E0E3E5] flex items-center justify-between bg-[#F7F9FB]">
              <h2 className="text-[18px] font-bold text-[#00236F] flex items-center gap-2">
                <span className="material-symbols-outlined">receipt_long</span>
                Chi tiết phiếu cọc #{selectedPhieu.macoc}
              </h2>
              <button onClick={() => setSelectedPhieu(null)} className="text-secondary hover:text-danger transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Room info */}
              <div className="bg-[#F7F9FB] rounded-xl p-5 border border-[#E0E3E5] mb-6">
                <h3 className="text-[16px] font-bold text-[#191C1E] mb-4">{selectedPhieu.tenphong}</h3>
                
                <div className="grid grid-cols-2 gap-4 text-[14px]">
                  <div>
                    <span className="block text-[#54647A] text-[12px] mb-1">Trạng thái phiếu</span>
                    {getStatusBadge(selectedPhieu.trangthai)}
                  </div>
                  <div>
                    <span className="block text-[#54647A] text-[12px] mb-1">Ngày lập phiếu</span>
                    <span className="font-semibold">{formatDate(selectedPhieu.ngaycoc)}</span>
                  </div>
                  <div>
                    <span className="block text-[#54647A] text-[12px] mb-1">Số giường cọc</span>
                    <span className="font-semibold">{selectedPhieu.sogiuong || 1} giường</span>
                  </div>
                  <div>
                    <span className="block text-[#54647A] text-[12px] mb-1">Đơn giá/giường/tháng</span>
                    <span className="font-semibold">{formatCurrency(selectedPhieu.giatien)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#E0E3E5]">
                  <span className="block text-[#54647A] text-[12px] mb-2">Tiện ích bao gồm</span>
                  <div className="flex flex-wrap gap-2">
                    {parseTienIch(selectedPhieu.tienich).map((t: string, idx: number) => (
                      <span key={idx} className="bg-white border border-[#D1D5DB] px-2 py-1 rounded-md text-[12px] text-secondary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check</span> {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {selectedPhieu.trangthai === 1 && (
                <>
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6 text-center">
                    <p className="text-[12px] font-semibold text-secondary mb-1 uppercase tracking-wider">Tổng tiền cần thanh toán</p>
                    <p className="text-[32px] font-bold text-danger">{formatCurrency(selectedPhieu.sotien)}</p>
                    <p className="text-[12px] text-secondary mt-1">(Bao gồm tiền cọc 2 tháng cho {selectedPhieu.sogiuong || 1} giường)</p>
                  </div>

                  <form onSubmit={handleThanhToan} className="space-y-4">
                    {error && (
                      <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl text-[14px]">
                        {error}
                      </div>
                    )}
                    {message && (
                      <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-xl text-[14px]">
                        {message}
                      </div>
                    )}


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-semibold text-[#374151] mb-2">Phương thức thanh toán</label>
                        <select
                          className="w-full px-4 py-2.5 border border-[#D1D5DB] bg-white rounded-lg focus:outline-none focus:border-primary text-[14px]"
                          value={ptThanhToan}
                          onChange={e => setPtThanhToan(e.target.value)}
                        >
                          <option value="Tiền mặt">Tiền mặt</option>
                          <option value="PayPal">Thanh toán Online (PayPal)</option>
                        </select>
                      </div>

                      {ptThanhToan !== 'PayPal' && (
                        <div>
                          <label className="block text-[13px] font-semibold text-[#374151] mb-2">Mã giao dịch</label>
                          <input
                            type="text"
                            required={ptThanhToan !== 'Tiền mặt' && !minhChung}
                            className="w-full px-4 py-2.5 border border-[#D1D5DB] bg-white rounded-lg focus:outline-none focus:border-primary text-[14px]"
                            placeholder="Nhập mã giao dịch..."
                            value={maGiaoDich}
                            onChange={e => setMaGiaoDich(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {ptThanhToan === 'Tiền mặt' && (
                      <div>
                        <label className="block text-[13px] font-semibold text-[#374151] mb-2">Hình ảnh minh chứng (Biên lai)</label>
                        <input
                          type="file"
                          accept="image/*"
                          required={!maGiaoDich}
                          onChange={e => setMinhChung(e.target.files ? e.target.files[0] : null)}
                          className="w-full px-4 py-2 border border-[#D1D5DB] bg-white rounded-lg focus:outline-none focus:border-primary text-[14px] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedPhieu(null)}
                        className="flex-1 px-4 py-3 border border-secondary text-secondary font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Để sau
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`flex-[2] text-white px-4 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${ptThanhToan === 'PayPal' ? 'bg-[#003087] hover:bg-[#001C66]' : 'bg-primary hover:bg-primary/90'}`}
                      >
                        {submitting ? 'Đang xử lý...' : (ptThanhToan === 'PayPal' ? 'Chuyển đến PayPal' : 'Thanh toán')}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {selectedPhieu.trangthai !== 1 && (
                <div className="text-center bg-[#F7F9FB] rounded-xl p-8 border border-[#E0E3E5]">
                  <span className="material-symbols-outlined text-[48px] text-secondary mb-2">info</span>
                  <p className="text-[14px] text-secondary font-medium">Phiếu cọc này không trong trạng thái chờ thanh toán.</p>
                  <p className="text-[14px] text-secondary">Bạn chỉ có thể thanh toán các phiếu ở trạng thái "Cần thanh toán".</p>
                  
                  <button
                    onClick={() => setSelectedPhieu(null)}
                    className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-semibold"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
