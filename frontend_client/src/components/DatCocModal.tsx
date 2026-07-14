import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface DatCocModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomInfo: any | null;
}

export const DatCocModal: React.FC<DatCocModalProps> = ({ isOpen, onClose, roomInfo }) => {
  const navigate = useNavigate();
  const { currentUser, openAuthModal } = useAuth();
  
  const [soGiuong, setSoGiuong] = useState(1);
  const [gioiTinh, setGioiTinh] = useState('Nam');
  const [soNguoiO, setSoNguoiO] = useState(1);
  const [ngayDuKienVao, setNgayDuKienVao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen || !roomInfo) return null;

  const handleSubmit = async () => {
    if (!currentUser) {
      onClose();
      openAuthModal();
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/booking/dat-coc`, {
        maKH: currentUser.user.makh || currentUser.user.id,
        maPhong: roomInfo.maphong || roomInfo.MaPhong,
        soGiuong: soGiuong,
        soThangThue: 2, // Đề bài yêu cầu Tiền cọc = (Tiền thuê 2 tháng) x (Số giường thuê)
        gioiTinh,
        soNguoiO: soGiuong, // Số người bằng với số giường
        ngayDuKienVao
      });
      
      setSubmitSuccess(true);
      setSubmitting(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đặt cọc.');
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitSuccess(false);
    setSoGiuong(1);
    setGioiTinh('Nam');
    setNgayDuKienVao('');
    setError('');
    onClose();
  };

  const giaTien = Number(roomInfo.giatien || roomInfo.GiaTien || 0);
  const totalCoc = giaTien * 2 * soGiuong;
  const maxBeds = Number(roomInfo.sogiuongtrong ?? roomInfo.succhua ?? 4);
  const roomCapacity = Number(roomInfo.succhua || 4);

  // --- Success Confirmation Screen ---
  if (submitSuccess) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
        onClick={handleClose}
      >
        <div 
          className="bg-white rounded-[20px] w-[90vw] md:w-[450px] min-w-[320px] flex flex-col shadow-2xl overflow-hidden border border-[#E0E3E5]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#00236F] text-white p-5 flex justify-between items-center">
            <h2 className="font-bold text-[18px]">Đặt cọc thành công</h2>
            <button onClick={handleClose} className="text-white/80 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Success Content */}
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-green-500" style={{ fontSize: '44px' }}>check_circle</span>
            </div>
            
            <h3 className="font-bold text-[18px] text-[#00236F] mb-2">
              Yêu cầu đặt cọc đã được gửi!
            </h3>
            
            <p className="text-[#54647A] text-[14px] leading-relaxed mb-6">
              Hệ thống đã tiếp nhận yêu cầu đặt cọc phòng <strong>{roomInfo.tenphong || roomInfo.TenPhong}</strong> của bạn. 
              Vui lòng chờ nhân viên Sale xử lý hồ sơ. Bạn sẽ được thông báo khi có thể tiến hành thanh toán.
            </p>

            <div className="w-full bg-[#F7F9FB] rounded-xl p-4 border border-[#E0E3E5] mb-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#00236F] text-[18px]">info</span>
                <span className="text-[13px] font-semibold text-[#191C1E]">Thông tin yêu cầu</span>
              </div>
              <div className="space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#54647A]">Phòng</span>
                  <span className="font-medium text-[#191C1E]">{roomInfo.tenphong || roomInfo.TenPhong}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#54647A]">Số giường</span>
                  <span className="font-medium text-[#191C1E]">{soGiuong} giường</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#54647A]">Giới tính</span>
                  <span className="font-medium text-[#191C1E]">{gioiTinh}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#54647A]">Tiền cọc dự kiến</span>
                  <span className="font-bold text-[#EF4444]">{totalCoc.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>

            <div className="w-full bg-amber-50 rounded-xl p-3 border border-amber-200 flex items-start gap-2 text-left mb-2">
              <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">schedule</span>
              <p className="text-[12px] text-amber-700 leading-relaxed">
                Trạng thái hiện tại: <strong>Chờ Sale duyệt</strong>. Bạn có thể theo dõi tiến trình trong mục "Lịch sử cọc".
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-[#E0E3E5] bg-[#F7F9FB] flex gap-3">
            <button 
              onClick={handleClose}
              className="flex-1 py-3 bg-white border border-[#C5C5D3] text-[#191C1E] font-semibold text-[14px] rounded-xl hover:bg-gray-50"
            >
              Đóng
            </button>
            <button 
              onClick={() => { handleClose(); navigate('/thanh-toan-coc'); }}
              className="flex-1 py-3 bg-[#00236F] text-white font-semibold text-[14px] rounded-xl hover:bg-[#1E3A8A] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Xem danh sách cọc
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Deposit Form Screen ---
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[20px] w-[90vw] md:w-[450px] min-w-[320px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#E0E3E5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#00236F] text-white p-5 flex justify-between items-center">
          <h2 className="font-bold text-[18px]">Xác nhận đặt cọc</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
              <img 
                src={roomInfo.hinhanh || roomInfo.HinhAnh || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5"} 
                alt={roomInfo.tenphong || roomInfo.TenPhong}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#00236F]">{roomInfo.tenphong || roomInfo.TenPhong}</h3>
              <p className="text-[#54647A] text-[13px]">{roomInfo.chinhanh || "TP. Hồ Chí Minh"}</p>
              <p className="text-[#00236F] font-bold text-[14px] mt-1">
                {giaTien.toLocaleString('vi-VN')}đ <span className="text-[12px] font-normal">/ giường / tháng</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#191C1E] mb-2">Số giường cần thuê</label>
              <select 
                className="w-full p-3.5 rounded-xl border border-[#C5C5D3] focus:border-[#00236F] outline-none text-[14px]"
                value={soGiuong}
                onChange={(e) => setSoGiuong(Number(e.target.value))}
                disabled={maxBeds === 0}
              >
                {maxBeds === 0 ? (
                  <option value={0}>Phòng đã hết giường trống</option>
                ) : (
                  Array.from({length: maxBeds}, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} giường {n === roomCapacity ? '(Nguyên phòng)' : ''}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#191C1E] mb-2">Giới tính người ở</label>
              <select 
                className="w-full p-3.5 rounded-xl border border-[#C5C5D3] focus:border-[#00236F] outline-none text-[14px]"
                value={gioiTinh}
                onChange={(e) => setGioiTinh(e.target.value)}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#191C1E] mb-2">Ngày dự kiến dọn vào</label>
              <input 
                type="date"
                required
                className="w-full p-3.5 rounded-xl border border-[#C5C5D3] focus:border-[#00236F] outline-none text-[14px]"
                value={ngayDuKienVao}
                onChange={(e) => setNgayDuKienVao(e.target.value)}
              />
            </div>

            <div className="bg-[#F7F9FB] rounded-xl p-4 border border-[#E0E3E5]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#54647A] text-[13px]">Tiền cọc 1 giường (2 tháng)</span>
                <span className="text-[#191C1E] font-semibold text-[13px]">{(giaTien * 2).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#E0E3E5]">
                <span className="text-[#191C1E] font-bold text-[14px]">Tổng tiền cọc</span>
                <span className="text-[#EF4444] font-bold text-[18px]">{totalCoc.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-[12px] rounded-xl flex items-center gap-1.5 font-medium border border-red-100">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#E0E3E5] bg-[#F7F9FB] flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-[#C5C5D3] text-[#191C1E] font-semibold text-[14px] rounded-xl hover:bg-gray-50"
          >
            Hủy
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 bg-[#00236F] text-white font-semibold text-[14px] rounded-xl hover:bg-[#1E3A8A] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><span className="material-symbols-outlined animate-spin">progress_activity</span> Đang xử lý</>
            ) : (
              currentUser ? "Xác nhận Đặt cọc" : "Đăng nhập để Đặt cọc"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
