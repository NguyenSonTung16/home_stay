import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface HopDong {
  mahd: number;
  ngayky: string;
  ngayhethan: string;
  tenphong: string;
  hasyeucau: boolean;
}

export default function YeuCauTraPhong() {
  const [contracts, setContracts] = useState<HopDong[]>([]);
  const [selectedHD, setSelectedHD] = useState<HopDong | null>(null);
  const [ngayDuKien, setNgayDuKien] = useState('');
  const [lyDo, setLyDo] = useState('');
  const [stkNhanCoc, setStkNhanCoc] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/booking/hop-dong/dang-hoat-dong?maKH=1');
      setContracts(res.data.data || []);
    } catch (err: any) {
      setError('Không thể tải danh sách hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (hd: HopDong) => {
    if (hd.hasyeucau) return; // Already has a checkout request
    setSelectedHD(hd);
    setNgayDuKien('');
    setLyDo('');
    setStkNhanCoc('');
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHD) return;
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      await axios.post('/api/booking/yeu-cau-tra-phong', {
        maHD: selectedHD.mahd,
        ngayDuKien,
        lyDo,
        stkNhanCoc
      });
      setMessage(`Yêu cầu trả phòng cho hợp đồng #${selectedHD.mahd} (${selectedHD.tenphong}) đã được gửi. Quản lý sẽ liên hệ bạn để kiểm tra phòng.`);
      setSelectedHD(null);
      fetchContracts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">Yêu Cầu Trả Phòng</h1>
      <p className="text-gray-500 mb-6">Chọn hợp đồng bạn muốn trả phòng từ danh sách bên dưới.</p>

      {message && (
        <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-emerald-600 mt-0.5">check_circle</span>
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-red-600 mt-0.5">error</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <span className="material-symbols-outlined text-5xl animate-spin mb-3">progress_activity</span>
          <p>Đang tải...</p>
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-3">description</span>
          <p>Bạn không có hợp đồng nào đang hoạt động.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {contracts.map(hd => {
            const isSelected = selectedHD?.mahd === hd.mahd;
            const daysLeft = getDaysRemaining(hd.ngayhethan);
            const isExpiringSoon = daysLeft <= 30 && daysLeft > 0;

            return (
              <div
                key={hd.mahd}
                onClick={() => handleSelect(hd)}
                className={`rounded-xl border-2 p-5 transition-all ${
                  hd.hasyeucau
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    : isSelected
                      ? 'border-[#1E3A8A] bg-blue-50 shadow-md cursor-pointer ring-2 ring-[#1E3A8A]/20'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      hd.hasyeucau ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-[#1E3A8A]'
                    }`}>
                      <span className="material-symbols-outlined">apartment</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">HĐ #{hd.mahd}</h3>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="font-semibold text-[#1E3A8A]">{hd.tenphong}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>Từ {formatDate(hd.ngayky)}</span>
                        <span>→</span>
                        <span>Đến {formatDate(hd.ngayhethan)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isExpiringSoon && !hd.hasyeucau && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                        Còn {daysLeft} ngày
                      </span>
                    )}
                    {hd.hasyeucau ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">pending</span>
                        Đã gửi yêu cầu
                      </span>
                    ) : isSelected ? (
                      <span className="material-symbols-outlined text-[#1E3A8A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        Đang hoạt động
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Checkout request form */}
      {selectedHD && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-[#1E3A8A] rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1E3A8A]">exit_to_app</span>
            Yêu cầu trả phòng — HĐ #{selectedHD.mahd} ({selectedHD.tenphong})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày dự kiến trả phòng <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                value={ngayDuKien}
                onChange={e => setNgayDuKien(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Số tài khoản nhận hoàn cọc
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                placeholder="VD: VCB 123456789 Nguyen Van A"
                value={stkNhanCoc}
                onChange={e => setStkNhanCoc(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Tài khoản ngân hàng để nhận tiền hoàn cọc sau khi kiểm tra phòng.</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Lý do trả phòng</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
              placeholder="Ví dụ: Hết hạn hợp đồng, chuyển chỗ ở mới, lý do cá nhân..."
              value={lyDo}
              onChange={e => setLyDo(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSelectedHD(null)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#1E3A8A] text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><span className="material-symbols-outlined animate-spin">progress_activity</span> Đang gửi...</>
              ) : (
                <><span className="material-symbols-outlined">send</span> Gửi yêu cầu trả phòng</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
