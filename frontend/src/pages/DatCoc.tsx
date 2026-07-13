import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PhongInfo {
  maphong: number;
  tenphong: string;
  chinhanh: string | null;
  tieuchigioitinh: string | null;
  tenloai: string;
  giatien: string;
  succhua: number;
  sogiuongtrong: string;
  tonggiuong: string;
}

export default function DatCoc() {
  const [rooms, setRooms] = useState<PhongInfo[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<PhongInfo | null>(null);
  const [soGiuong, setSoGiuong] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/booking/phong-trong');
      setRooms(res.data.data || []);
    } catch (err: any) {
      setError('Không thể tải danh sách phòng trống.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (room: PhongInfo) => {
    setSelectedRoom(room);
    setSoGiuong(1);
    setMessage('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!selectedRoom) return;
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      await axios.post('/api/booking/dat-coc', {
        maKH: 1,
        maPhong: selectedRoom.maphong,
        soGiuong: soGiuong,
        soThangThue: 6
      });
      setMessage(`Đặt cọc thành công cho phòng ${selectedRoom.tenphong}! Vui lòng chuyển sang "Thanh toán cọc" để hoàn tất.`);
      setSelectedRoom(null);
      fetchRooms();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đặt cọc.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: string | number) => {
    return parseInt(String(val)).toLocaleString('vi-VN') + ' đ';
  };

  const maxBeds = selectedRoom ? parseInt(String(selectedRoom.sogiuongtrong)) : 1;

  return (
    <div className="p-4 md:p-6 w-full max-w-5xl mx-auto bg-surface min-h-screen">
      <h1 className="text-[24px] font-bold text-primary mb-2 font-h1">Đăng ký Đặt cọc</h1>
      <p className="text-secondary mb-6 text-[14px] font-body">Chọn phòng trống bên dưới để tiến hành đặt cọc giữ chỗ.</p>

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
          <p className="font-body text-[14px]">Đang tải danh sách phòng...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-16 text-secondary">
          <span className="material-symbols-outlined text-5xl mb-3">hotel</span>
          <p className="font-body text-[14px]">Hiện không có phòng nào còn giường trống.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {rooms.map(room => {
            const isSelected = selectedRoom?.maphong === room.maphong;
            const available = parseInt(String(room.sogiuongtrong));
            const total = parseInt(String(room.tonggiuong));

            return (
              <div
                key={room.maphong}
                onClick={() => handleSelectRoom(room)}
                className={`relative cursor-pointer rounded-lg border-[2px] p-5 transition-all bg-white ${
                  isSelected
                    ? 'border-primary shadow-md'
                    : 'border-[#E5E7EB] hover:border-primary/50'
                }`}
              >
                {/* Room type badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[12px] font-medium px-3 py-1 rounded-full ${
                    room.tenloai === 'VIP' || room.tenloai === 'Premium'
                      ? 'bg-warning/20 text-warning font-bold'
                      : 'bg-info/10 text-info font-bold'
                  }`}>
                    {room.tenloai}
                  </span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </div>

                <h2 className="text-[18px] font-semibold text-gray-900 mb-1 font-h2">{room.tenphong}</h2>
                {room.chinhanh && <p className="text-[12px] text-secondary mb-3 font-caption">Chi nhánh: {room.chinhanh}</p>}

                <div className="flex flex-col gap-2 text-[14px] font-body text-secondary">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">bed</span>
                      Giường trống
                    </span>
                    <span className="font-bold text-success">{available} / {total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">group</span>
                      Sức chứa
                    </span>
                    <span className="font-semibold text-gray-700">{room.succhua} người</span>
                  </div>
                  {room.tieuchigioitinh && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">wc</span>
                        Giới tính
                      </span>
                      <span className="font-semibold text-gray-700">{room.tieuchigioitinh}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] text-secondary font-caption">Giá thuê/tháng</span>
                    <span className="text-[18px] font-semibold text-primary">{formatCurrency(room.giatien)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedRoom && (
        <div className="bg-white border-[2px] border-primary rounded-lg p-6 shadow-lg sticky bottom-4">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            Xác nhận đặt cọc — {selectedRoom.tenphong}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">Số giường muốn thuê</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoGiuong(Math.max(1, soGiuong - 1))}
                  className="w-10 h-10 rounded-lg border border-[#D1D5DB] flex items-center justify-center hover:bg-gray-50 transition-colors text-secondary"
                  disabled={soGiuong <= 1}
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="text-[20px] font-bold text-primary w-12 text-center">{soGiuong}</span>
                <button
                  onClick={() => setSoGiuong(Math.min(maxBeds, soGiuong + 1))}
                  className="w-10 h-10 rounded-lg border border-[#D1D5DB] flex items-center justify-center hover:bg-gray-50 transition-colors text-secondary"
                  disabled={soGiuong >= maxBeds}
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
                <span className="text-[12px] text-secondary ml-2">(tối đa {maxBeds} giường)</span>
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">Giá thuê / tháng / giường</label>
              <p className="text-[20px] font-semibold text-gray-900">{formatCurrency(selectedRoom.giatien)}</p>
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">Tiền cọc (2 tháng × {soGiuong} giường)</label>
              <p className="text-[20px] font-bold text-danger">
                {formatCurrency(parseFloat(selectedRoom.giatien) * 2 * soGiuong)}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={() => setSelectedRoom(null)}
              className="px-[24px] py-[12px] border border-secondary bg-white text-secondary font-body font-semibold rounded-lg hover:bg-gray-50 transition-colors text-[14px] text-center"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-primary text-white px-[24px] py-[12px] rounded-lg font-body font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-[14px]"
            >
              {submitting ? (
                <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Đang xử lý...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">lock</span> Xác nhận đặt cọc</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
