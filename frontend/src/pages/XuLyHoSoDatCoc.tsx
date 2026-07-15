import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface HoSo {
  macoc: number;
  sotien: string;
  ngaycoc: string;
  trangthai: number;
  magiaodich: string;
  ptthanhtoan: string;
  hoten: string;
  sdt: string;
  tenphong: string;
  trangthaimoi: string;
}

export default function XuLyHoSoDatCoc() {
  const [danhSach, setDanhSach] = useState<HoSo[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDanhSach();
  }, []);

  const fetchDanhSach = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/booking/ho-so/cho-duyet');
      setDanhSach(res.data.data || []);
    } catch (err: any) {
      setError('Không thể tải danh sách hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const [modalState, setModalState] = useState<{ isOpen: boolean; maCoc: number; hopLe: boolean } | null>(null);

  const handleDuyet = (maCoc: number, hopLe: boolean) => {
    setModalState({ isOpen: true, maCoc, hopLe });
  };

  const confirmAction = async () => {
    if (!modalState) return;
    const { maCoc, hopLe } = modalState;
    setModalState(null); // Close modal
    
    setProcessingId(maCoc);
    setMessage('');
    setError('');

    try {
      await axios.post('/api/booking/ho-so/phe-duyet', {
        maCoc,
        isDuyet: hopLe
      });
      setMessage(`Đã ${hopLe ? 'phê duyệt' : 'từ chối'} hồ sơ #${maCoc} thành công.`);
      fetchDanhSach();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý.');
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (val: string | number) => {
    return parseInt(String(val)).toLocaleString('vi-VN') + ' đ';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="p-6 w-full max-w-6xl mx-auto bg-surface min-h-screen">
      <h1 className="text-[24px] font-bold text-primary mb-2 font-h1">Quản Lý - Xử lý hồ sơ đặt cọc</h1>
      <p className="text-[14px] text-secondary mb-6 font-body">Danh sách các khoản xin giữ chỗ (Chờ Duyệt) hoặc đối chiếu biên lai (Chờ Xác Nhận Tiền Mặt).</p>

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
          <p className="text-[14px] font-body">Đang tải dữ liệu...</p>
        </div>
      ) : danhSach.length === 0 ? (
        <div className="text-center py-16 text-secondary bg-white border border-[#D1D5DB] rounded-lg">
          <span className="material-symbols-outlined text-5xl mb-3">fact_check</span>
          <p className="text-[14px] font-body">Tuyệt vời! Không có hồ sơ nào đang chờ duyệt.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#D1D5DB] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F9FB] border-b border-[#E5E7EB]">
                <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider">Mã / Ngày</th>
                <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider">Khách hàng</th>
                <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider">Phòng</th>
                <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider">Số tiền</th>
                <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider">Mã giao dịch</th>
                <th className="px-4 py-3 text-[12px] font-bold text-[#4B5563] uppercase tracking-wider text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-[14px] font-body text-[#1F2937]">
              {danhSach.map(hs => (
                <tr key={hs.macoc} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-primary">#{hs.macoc}</div>
                    <div className="text-[12px] text-secondary font-caption">{formatDate(hs.ngaycoc)}</div>
                    {hs.trangthaimoi === 'ChoDuyet' || hs.trangthai === 2 ? (
                      <span className="mt-1 inline-block bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded text-[10px]">Xin giữ chỗ</span>
                    ) : (
                      <span className="mt-1 inline-block bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded text-[10px]">Chờ xác nhận tiền</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{hs.hoten}</div>
                    <div className="text-[12px] text-secondary font-caption">{hs.sdt}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-info/10 text-info font-bold px-2 py-1 rounded text-[12px]">{hs.tenphong}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-danger">
                    {formatCurrency(hs.sotien)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{hs.ptthanhtoan}</div>
                    <div className="text-[12px] font-mono font-bold text-[#4B5563] bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-1">
                      {hs.magiaodich}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleDuyet(hs.macoc, true)}
                        disabled={processingId !== null}
                        className="bg-success text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                        title={hs.trangthaimoi === 'ChoDuyet' || hs.trangthai === 2 ? "Duyệt hồ sơ xin giữ chỗ" : "Phê duyệt (Tiền đã vào tài khoản)"}
                      >
                        <span className="material-symbols-outlined text-[16px]">check</span> Duyệt
                      </button>
                      <button
                        onClick={() => handleDuyet(hs.macoc, false)}
                        disabled={processingId !== null}
                        className="bg-danger text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-danger/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                        title={hs.trangthaimoi === 'ChoDuyet' || hs.trangthai === 2 ? "Từ chối xin giữ chỗ" : "Từ chối (Sai thông tin / Không nhận được tiền)"}
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span> Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {modalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            {/* Header */}
            <div className={`p-4 border-b border-[#E5E7EB] flex items-center gap-2 ${modalState.hopLe ? 'bg-success/10' : 'bg-danger/10'}`}>
              <span className={`material-symbols-outlined ${modalState.hopLe ? 'text-success' : 'text-danger'}`}>
                {modalState.hopLe ? 'check_circle' : 'warning'}
              </span>
              <h3 className={`text-[18px] font-bold font-h2 ${modalState.hopLe ? 'text-success' : 'text-danger'}`}>
                Xác nhận {modalState.hopLe ? 'Phê Duyệt' : 'Từ Chối'}
              </h3>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <p className="text-[14px] font-body text-[#1F2937]">
                Bạn có chắc chắn muốn <strong className={modalState.hopLe ? 'text-success' : 'text-danger'}>
                  {modalState.hopLe ? 'PHÊ DUYỆT' : 'TỪ CHỐI'}
                </strong> hồ sơ đặt cọc <strong>#{modalState.maCoc}</strong> không?
              </p>
              {!modalState.hopLe && (
                <p className="text-[12px] font-caption text-secondary mt-2">
                  Lưu ý: Hành động này sẽ từ chối khoản tiền cọc và khách hàng sẽ cần thực hiện lại quá trình thanh toán.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end gap-3">
              <button
                onClick={() => setModalState(null)}
                className="px-[24px] py-[12px] border border-secondary bg-white text-secondary font-body font-semibold rounded-lg hover:bg-[#F9FAFB] transition-colors text-[14px]"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmAction}
                className={`px-[24px] py-[12px] rounded-lg font-body font-semibold text-white transition-colors text-[14px] flex items-center gap-2 ${
                  modalState.hopLe ? 'bg-success hover:bg-success/90' : 'bg-danger hover:bg-danger/90'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {modalState.hopLe ? 'check' : 'close'}
                </span>
                Xác nhận {modalState.hopLe ? 'Duyệt' : 'Từ Chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
