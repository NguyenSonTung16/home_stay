import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function ChiTietHoaDonDienNuoc() {
  const { maDH } = useParams<{ maDH: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Guard role
    if (!user || user.role !== 'KeToan') {
      navigate('/');
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/api/doi-soat/hoa-don-dien-nuoc/${maDH}`, {
          headers: { 'x-vai-tro': user.role }
        });
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải chi tiết hóa đơn.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [maDH, user, navigate]);

  const formatCurrency = (val: number) => val?.toLocaleString('vi-VN') + ' đ';
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DaThanhToan':
        return 'bg-success/10 text-success border border-success/30';
      case 'DaHuy':
        return 'bg-slate-100 text-[#54647A] border border-slate-200';
      case 'ChoXacNhanTienMat':
        return 'bg-warning/10 text-warning border border-warning/30';
      case 'ChoThanhToan':
      case 'DangCho':
      case 'ChuaThanhToan':
      default:
        return 'bg-orange-100 text-orange-700 border border-orange-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DaThanhToan': return 'Đã hoàn tất';
      case 'DaHuy': return 'Đã hủy';
      case 'ChoXacNhanTienMat': return 'Chờ xác nhận';
      case 'ChoThanhToan':
      case 'DangCho':
      case 'ChuaThanhToan':
      default: return 'Chờ thanh toán';
    }
  };

  if (loading) {
    return (
      <div className="p-container-padding flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary mb-2">progress_activity</span>
        <p className="text-secondary text-xs">Đang tải chi tiết hóa đơn...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-container-padding flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <span className="material-symbols-outlined text-5xl text-error mb-2">error</span>
        <p className="font-bold text-primary">{error || 'Không tìm thấy hóa đơn'}</p>
        <button
          onClick={() => navigate('/doi-soat')}
          className="mt-4 px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-[#1E3A8A]/90 transition"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="p-container-padding flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/doi-soat')}
          className="material-symbols-outlined text-secondary hover:text-primary transition-colors text-2xl"
        >
          arrow_back
        </button>
        <div>
          <h1 className="font-h1 text-h1 text-primary">Chi Tiết Hóa Đơn Điện Nước</h1>
          <p className="text-secondary font-body mt-0.5">Mã hóa đơn: #{data.mahddn}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column (8/12): Bill details */}
        <div className="md:col-span-8 space-y-6">
          {/* Electricity and Water Usage breakdown */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-h2 font-h2 text-primary border-b border-outline-variant pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined">analytics</span>
              Chỉ số tiêu thụ & Chi phí
            </h2>
            
            {/* Grid 2 column for Electricity and Water details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Electricity usage block */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                <p className="font-bold text-primary text-xs flex items-center gap-1.5 uppercase tracking-wider text-secondary-container-on">
                  <span className="material-symbols-outlined text-amber-500">flash_on</span>
                  Chỉ số Điện
                </p>
                <div className="space-y-1.5 text-xs text-secondary">
                  <div className="flex justify-between">
                    <span>Chỉ số cũ:</span>
                    <span className="font-bold text-[#191C1E]">{data.csdiencu} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chỉ số mới:</span>
                    <span className="font-bold text-[#191C1E]">{data.csdienmoi} kWh</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/50 pt-2 font-medium">
                    <span>Tiêu thụ:</span>
                    <span className="font-bold text-[#191C1E]">{data.csdienmoi - data.csdiencu} kWh</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-primary pt-1">
                    <span>Tiền điện:</span>
                    <span>{formatCurrency(Number(data.tiendien))}</span>
                  </div>
                </div>
              </div>

              {/* Water usage block */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                <p className="font-bold text-primary text-xs flex items-center gap-1.5 uppercase tracking-wider text-secondary-container-on">
                  <span className="material-symbols-outlined text-blue-500">water_drop</span>
                  Chỉ số Nước
                </p>
                <div className="space-y-1.5 text-xs text-secondary">
                  <div className="flex justify-between">
                    <span>Chỉ số cũ:</span>
                    <span className="font-bold text-[#191C1E]">{data.csnuoccu} m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chỉ số mới:</span>
                    <span className="font-bold text-[#191C1E]">{data.csnuocmoi} m³</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/50 pt-2 font-medium">
                    <span>Tiêu thụ:</span>
                    <span className="font-bold text-[#191C1E]">{data.csnuocmoi - data.csnuoccu} m³</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-primary pt-1">
                    <span>Tiền nước:</span>
                    <span>{formatCurrency(Number(data.tiennuoc))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Section */}
            <div className="border-t border-outline-variant pt-4 flex justify-between items-center text-body">
              <span className="font-bold text-primary text-base">Tổng cộng thanh toán</span>
              <span className="font-extrabold text-primary text-lg">{formatCurrency(Number(data.tongtien))}</span>
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-h2 font-h2 text-primary border-b border-outline-variant pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined">person</span>
              Thông tin khách hàng đại diện phòng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-secondary">
              <div className="space-y-1">
                <p className="uppercase text-[10px] tracking-wider text-[#54647A]">Khách hàng đại diện</p>
                <p className="text-sm font-bold text-[#191C1E]">{data.hoten || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="uppercase text-[10px] tracking-wider text-[#54647A]">Số điện thoại</p>
                <p className="text-sm font-bold text-[#191C1E]">{data.sdt || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="uppercase text-[10px] tracking-wider text-[#54647A]">Email liên hệ</p>
                <p className="text-sm font-bold text-[#191C1E]">{data.email || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="uppercase text-[10px] tracking-wider text-[#54647A]">Số CCCD / Hộ chiếu</p>
                <p className="text-sm font-bold text-[#191C1E]">{data.cccd || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4/12): Transaction Status card */}
        <div className="md:col-span-4 space-y-6">
          {/* Status Box */}
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-4 text-center">
            <p className="uppercase text-[10px] font-bold text-secondary tracking-wider">Trạng thái đối soát</p>
            <div className="flex justify-center">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusBadge(data.trangthai)}`}>
                {getStatusText(data.trangthai)}
              </span>
            </div>

            <div className="border-t border-outline-variant pt-4 text-left space-y-3.5 text-xs font-medium text-secondary">
              <div className="space-y-1">
                <p className="uppercase text-[10px] tracking-wider text-[#54647A]">Phòng / Chi nhánh</p>
                <p className="text-sm font-bold text-[#191C1E]">{data.tenphong || '—'} ({data.chinhanh || '—'})</p>
              </div>
              <div className="space-y-1">
                <p className="uppercase text-[10px] tracking-wider text-[#54647A]">Kỳ phí hóa đơn</p>
                <p className="text-sm font-bold text-[#191C1E]">Tháng {data.thang}</p>
              </div>
              <div className="space-y-1">
                <p className="uppercase text-[10px] tracking-wider text-[#54647A]">Mã giao dịch (PayPal/T.Mặt)</p>
                <p className="text-sm font-bold text-primary font-mono tracking-wider">{data.madh || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="uppercase text-[10px] tracking-wider text-[#54647A]">Phương thức thanh toán</p>
                <p className="text-sm font-bold text-[#191C1E]">
                  {data.phuongthuc === 'ChuyenKhoan' ? 'Chuyển khoản / PayPal' : data.phuongthuc === 'TienMat' ? 'Tiền mặt' : 'Chưa thanh toán'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="uppercase text-[10px] tracking-wider text-[#54647A]">Thời gian thanh toán</p>
                <p className="text-sm font-bold text-[#191C1E]">{formatDate(data.ngaytao)}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
