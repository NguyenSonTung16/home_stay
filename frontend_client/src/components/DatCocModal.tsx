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
        soNguoiO,
        ngayDuKienVao
      });
      
      onClose();
      navigate('/thanh-toan-coc');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đặt cọc.');
      setSubmitting(false);
    }
  };

  const giaTien = Number(roomInfo.giatien || roomInfo.GiaTien || 0);
  const totalCoc = giaTien * 2 * soGiuong;
  const maxBeds = Number(roomInfo.sogiuongtrong ?? roomInfo.succhua ?? 4);
  const roomCapacity = Number(roomInfo.succhua || 4);

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

            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-[13px] font-semibold text-[#191C1E] mb-2">Số lượng người</label>
                <input 
                  type="number"
                  min="1"
                  max={soGiuong * 2}
                  className="w-full p-3.5 rounded-xl border border-[#C5C5D3] focus:border-[#00236F] outline-none text-[14px]"
                  value={soNguoiO}
                  onChange={(e) => setSoNguoiO(Number(e.target.value))}
                />
              </div>
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
