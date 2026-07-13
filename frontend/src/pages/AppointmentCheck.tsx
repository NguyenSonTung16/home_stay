import React, { useState, useEffect } from 'react';

export const AppointmentCheck: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  const fetchAppointments = async () => {


    setIsLoading(true);
    try {
      const res = await fetch('/api/lichhen');
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setAppointments(result.data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách lịch hẹn:', error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id: number, status: number, phanHoi?: string) => {
    try {
      const res = await fetch(`/api/lichhen/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, phanHoi })
      });
      if (res.ok) {
        await fetchAppointments();
      } else {
        alert('Cập nhật trạng thái không thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái lịch hẹn:', error);
      alert('Đã xảy ra lỗi khi kết nối máy chủ!');
    }
  };

  const openConfirmAction = (item: any, status: number) => {
    const id = item.maphieu ?? item.MaPhieu ?? item.malichhen ?? item.MaLichHen;
    const existingNote = item.phanhoi ?? item.PhanHoi ?? '';
    setResponseNote(existingNote);
    setActionModal({
      id,
      status,
      title: status === 1 ? 'Phê duyệt Lịch hẹn' : 'Từ chối Lịch hẹn'
    });
  };


  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            Đã duyệt
          </span>
        );
      case -1:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
            Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            Chờ duyệt
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const filteredList = appointments
    .filter((item) => {
      const st = Number(item.trangthai ?? item.TrangThai ?? 0);
      if (filterStatus !== 'ALL' && st !== Number(filterStatus)) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const maLH = String(item.maphieu ?? item.MaPhieu ?? item.malichhen ?? item.MaLichHen ?? '').toLowerCase();
        const kh = String(item.hoten ?? item.HoTen ?? item.tenkhachhang ?? item.TenKhachHang ?? item.MaKH ?? item.makh ?? '').toLowerCase();
        return maLH.includes(q) || kh.includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      const idA = Number(a.maphieu ?? a.MaPhieu ?? a.malichhen ?? a.MaLichHen ?? 0);
      const idB = Number(b.maphieu ?? b.MaPhieu ?? b.malichhen ?? b.MaLichHen ?? 0);
      return idA - idB;
    });


  return (
    <div className="p-6 sm:p-8 w-full flex-1">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Xử lý Lịch hẹn Xem Phòng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý, phê duyệt và theo dõi các lịch hẹn xem phòng từ khách hàng
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 font-semibold text-sm transition-all shadow-sm self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
          Tải lại dữ liệu
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: '0', label: 'Chờ duyệt' },
            { id: '1', label: 'Đã duyệt' },
            { id: '-1', label: 'Từ chối' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px]">
          <input
            type="text"
            placeholder="Tìm theo Mã LH, Khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">
            search
          </span>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
            <p className="text-sm">Đang tải danh sách lịch hẹn từ máy chủ...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
            <p className="text-sm font-medium">Không tìm thấy lịch hẹn nào phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                  <th className="py-4 px-6">Mã LH</th>
                  <th className="py-4 px-6">Khách hàng / Mã KH</th>
                  <th className="py-4 px-6">Phòng hẹn xem</th>
                  <th className="py-4 px-6">Thời gian hẹn</th>
                  <th className="py-4 px-6">Ghi chú</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredList.map((item, idx) => {
                  const id = item.maphieu ?? item.MaPhieu ?? item.malichhen ?? item.MaLichHen ?? idx + 1;
                  const khach = item.hoten ?? item.HoTen ?? item.tenkhachhang ?? item.TenKhachHang ?? `Khách hàng #${item.makh ?? item.MaKH ?? 'N/A'}`;
                  const sdt = item.sdt ?? item.SDT ?? item.sodienthoai ?? item.SoDienThoai ?? '';
                  const email = item.email ?? item.Email ?? '';
                  const phong = Array.isArray(item.DanhSachMaPhong)
                    ? `Phòng ${item.DanhSachMaPhong.join(', ')}`
                    : item.dsphongxem ?? item.DSPhongXem ?? item.tenphong ?? item.TenPhong ?? `Phòng #${item.maphong ?? item.MaPhong ?? 'N/A'}`;
                  const ngay = formatDate(item.ngayhen ?? item.NgayHen ?? '');
                  const gio = item.giohen ?? item.GioHen ?? '';
                  const st = Number(item.trangthai ?? item.TrangThai ?? 0);

                  return (
                    <tr 
                      key={id} 
                      onClick={() => setSelectedAppointment(item)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-gray-900">#{id}</td>
                      <td className="py-4 px-6 font-medium text-gray-800">
                        <div>{khach}</div>
                        {sdt && (
                          <div className="text-xs text-gray-400 mt-0.5">📞 {sdt}</div>
                        )}
                        {email && (
                          <div className="text-xs text-blue-600 mt-0.5 font-normal">✉️ {email}</div>
                        )}
                      </td>

                      <td className="py-4 px-6 text-blue-600 font-medium">{phong || 'Chưa chọn'}</td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="font-medium">{ngay}</div>
                        <div className="text-xs text-gray-400">{gio}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-500 max-w-xs truncate">
                        {item.ghichu ?? item.GhiChu ?? '—'}
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(st)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(item);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-xs transition-colors flex items-center gap-1"
                            title="Xem chi tiết mô tả"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Chi tiết
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(id, 1);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium text-xs transition-colors"
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(id, -1);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium text-xs transition-colors"
                          >
                            Từ chối
                          </button>


                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Chi tiết Lịch hẹn */}
      {selectedAppointment && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedAppointment(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-blue-600 text-white">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">Thông tin chi tiết</span>
                <h3 className="text-xl font-extrabold mt-0.5">
                  Lịch hẹn #{selectedAppointment.maphieu ?? selectedAppointment.MaPhieu ?? selectedAppointment.malichhen ?? selectedAppointment.MaLichHen ?? 'N/A'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Trạng thái hiện tại */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-sm font-medium text-gray-600">Trạng thái xử lý:</span>
                <div>{getStatusBadge(Number(selectedAppointment.trangthai ?? selectedAppointment.TrangThai ?? 0))}</div>
              </div>

              {/* Thông tin khách hàng */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Thông tin Khách hàng</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500 block">Khách hàng</span>
                    <span className="text-sm font-bold text-gray-900">
                      {selectedAppointment.hoten ?? selectedAppointment.HoTen ?? selectedAppointment.tenkhachhang ?? selectedAppointment.TenKhachHang ?? `Khách hàng #${selectedAppointment.makh ?? selectedAppointment.MaKH ?? 'N/A'}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Số điện thoại</span>
                    <span className="text-sm font-bold text-gray-900">
                      {selectedAppointment.sdt ?? selectedAppointment.SDT ?? selectedAppointment.sodienthoai ?? selectedAppointment.SoDienThoai ?? 'Không cung cấp'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Email liên hệ</span>
                    <span className="text-sm font-bold text-blue-600">
                      {selectedAppointment.email ?? selectedAppointment.Email ?? 'Chưa cập nhật'}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 block">Mã Khách hàng</span>
                    <span className="text-sm font-semibold text-blue-600">
                      #{selectedAppointment.makh ?? selectedAppointment.MaKH ?? 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Số người tham gia</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {selectedAppointment.songuoi ?? selectedAppointment.SoNguoi ?? 1} người
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin phòng & Thời gian */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Thông tin Hẹn Xem Phòng</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                  <div className="sm:col-span-2">
                    <span className="text-xs text-blue-600 font-semibold block mb-1.5">Chi tiết các Phòng quan tâm (CT_LichHen)</span>
                    {Array.isArray(selectedAppointment.chi_tiet_phong) && selectedAppointment.chi_tiet_phong.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedAppointment.chi_tiet_phong.map((cp: any, idx: number) => (
                          <div key={idx} className="px-3 py-1.5 bg-blue-100 border border-blue-300 rounded-xl text-xs font-bold text-blue-900 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-blue-700">meeting_room</span>
                            <span>#{cp.MaPhong}: {cp.TenPhong || 'Phòng Homestay'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-base font-extrabold text-gray-900">
                        {selectedAppointment.dsphongxem ?? selectedAppointment.DSPhongXem ?? 'Chưa chọn phòng'}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 block">Ngày hẹn</span>
                    <span className="text-sm font-bold text-gray-800">
                      {formatDate(selectedAppointment.ngayhen ?? selectedAppointment.NgayHen ?? '')}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Giờ hẹn</span>
                    <span className="text-sm font-bold text-gray-800">
                      {selectedAppointment.giohen ?? selectedAppointment.GioHen ?? '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chi tiết mô tả / Ghi chú đầy đủ */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Chi tiết mô tả / Ghi chú của khách</h4>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium min-h-[80px]">
                  {selectedAppointment.ghichu || selectedAppointment.GhiChu
                    ? (selectedAppointment.ghichu ?? selectedAppointment.GhiChu)
                    : 'Khách hàng không để lại ghi chú chi tiết nào.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-sm transition-colors"
              >
                Đóng
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedAppointment.maphieu ?? selectedAppointment.MaPhieu ?? selectedAppointment.malichhen ?? selectedAppointment.MaLichHen;
                    handleUpdateStatus(id, -1);
                    setSelectedAppointment(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  Từ chối lịch hẹn
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedAppointment.maphieu ?? selectedAppointment.MaPhieu ?? selectedAppointment.malichhen ?? selectedAppointment.MaLichHen;
                    handleUpdateStatus(id, 1);
                    setSelectedAppointment(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  Phê duyệt lịch hẹn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCheck;


