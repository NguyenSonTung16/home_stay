import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

type TrangThai = 'DaThanhToan' | 'DaHuy' | 'ChoXacNhanTienMat' | 'ChoThanhToan';

interface PhieuInfo {
  maPDC: number;
  trangThai: TrangThai;
  tienCoc: number;
  thoiGianHetHan: string;
  tenPhong: string;
  phuongThuc: string | null;
  thoiGianXacNhan: string | null;
  maGiaoDich: string | null;
}

const API = import.meta.env.VITE_API_URL || '';

const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + 'đ';
const formatDate = (d: string | null) => d ? new Date(d).toLocaleString('vi-VN') : '—';

export const KetQuaDatCoc: React.FC = () => {
  const { maPDC } = useParams<{ maPDC: string }>();
  const navigate = useNavigate();
  const [phieu, setPhieu] = useState<PhieuInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!maPDC) return;
      try {
        const res = await fetch(`${API}/api/booking/dat-coc/${maPDC}/status`);
        const data = await res.json();
        if (data.success) setPhieu(data.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchStatus();
  }, [maPDC]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <span className="material-symbols-outlined animate-spin text-[#00236F] text-5xl">progress_activity</span>
      </div>
    );
  }

  // Khai báo cấu hình giao diện theo từng trạng thái phiếu cọc
  let statusConfig = {
    title: '',
    desc: '',
    icon: '',
    iconColor: '',
    iconBg: '',
    cardBg: '',
    titleColor: '',
    infoTitleColor: '',
    borderClass: '',
    stepBox: null as React.ReactNode,
    actions: [] as { label: string; onClick: () => void; isPrimary: boolean }[],
    fields: [] as { label: string; value: string; highlight?: boolean }[]
  };

  if (phieu) {
    if (phieu.trangThai === 'DaThanhToan') {
      statusConfig = {
        title: 'Đặt Cọc Thành Công!',
        icon: 'check_circle',
        iconColor: 'text-green-500',
        iconBg: 'bg-green-100',
        cardBg: 'bg-green-50/50',
        titleColor: 'text-[#191C1E]',
        infoTitleColor: 'text-green-800',
        borderClass: 'border-green-200',
        stepBox: (
          <div className="bg-blue-50 rounded-xl p-4 text-xs text-[#1E3A8A] border border-blue-200 text-left w-full mt-4">
            <p className="font-bold mb-1"> Bước tiếp theo</p>
            <p className="leading-relaxed">Nhân viên sẽ liên hệ với bạn để ký kết hợp đồng thuê phòng.</p>
          </div>
        ),
        actions: [
          { label: 'Xem hợp đồng', onClick: () => navigate('/hop-dong'), isPrimary: true },
          { label: 'Về trang chủ', onClick: () => navigate('/'), isPrimary: false }
        ],
        fields: [
          { label: 'Mã phiếu', value: `#${phieu.maPDC}` },
          { label: 'Phòng', value: phieu.tenPhong || '—' },
          { label: 'Số tiền cọc', value: formatCurrency(phieu.tienCoc), highlight: true },
          { label: 'Phương thức', value: phieu.phuongThuc === 'ChuyenKhoan' ? 'Chuyển khoản' : 'Tiền mặt' },
          { label: 'Mã giao dịch', value: phieu.maGiaoDich || '—' },
          { label: 'Thời gian xác nhận', value: formatDate(phieu.thoiGianXacNhan) },
        ]
      };
    } else if (phieu.trangThai === 'DaHuy') {
      statusConfig = {
        title: 'Phiếu Đã Bị Hủy',
        desc: `Phiếu đặt cọc #${phieu.maPDC} đã bị hủy do hết hạn hoặc bị từ chối`,
        icon: 'cancel',
        iconColor: 'text-red-500',
        iconBg: 'bg-red-100',
        cardBg: 'bg-red-50/50',
        titleColor: 'text-red-600',
        infoTitleColor: 'text-red-800',
        borderClass: 'border-red-200',
        stepBox: (
          <div className="bg-amber-50 rounded-xl p-4 text-xs text-amber-800 border border-amber-200 text-left w-full mt-4">
            <p className="font-bold mb-1">💡 Bạn có thể làm gì?</p>
            <p className="leading-relaxed">Giường đã được nhả ra. Bạn có thể tìm kiếm và đặt cọc phòng khác hoặc liên hệ nhân viên để được hỗ trợ.</p>
          </div>
        ),
        actions: [
          { label: 'Tìm phòng khác', onClick: () => navigate('/'), isPrimary: true },
          { label: 'Về trang chủ', onClick: () => navigate('/'), isPrimary: false }
        ],
        fields: [
          { label: 'Mã phiếu', value: `#${phieu.maPDC}` },
          { label: 'Phòng', value: phieu.tenPhong || '—' },
          { label: 'Hết hạn lúc', value: formatDate(phieu.thoiGianHetHan) },
        ]
      };
    } else if (phieu.trangThai === 'ChoXacNhanTienMat') {
      statusConfig = {
        title: 'Chờ Quản Lý Xác Nhận',
        desc: 'Chứng từ của bạn đã được gửi thành công',
        icon: 'pending',
        iconColor: 'text-amber-500 animate-pulse',
        iconBg: 'bg-amber-100',
        cardBg: 'bg-amber-50/50',
        titleColor: 'text-amber-700',
        infoTitleColor: 'text-amber-800',
        borderClass: 'border-amber-200',
        stepBox: (
          <div className="w-full space-y-2 mt-4">
            {['Chứng từ đã được gửi ✅', 'Quản lý đang xem xét 🔍', 'Bạn sẽ nhận email khi hoàn tất 📧'].map((step, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-xs border ${i === 0 ? 'border-green-200 bg-green-50 text-green-700' : i === 1 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-[#E0E3E5] bg-white text-[#54647A]'}`}>
                <span className="material-symbols-outlined text-[18px]">
                  {i === 0 ? 'check_circle' : i === 1 ? 'search' : 'mail'}
                </span>
                {step}
              </div>
            ))}
          </div>
        ),
        actions: [
          { label: 'Quay về phiếu cọc', onClick: () => navigate(`/xac-nhan-dat-coc/${maPDC}`), isPrimary: true },
          { label: 'Về trang chủ', onClick: () => navigate('/'), isPrimary: false }
        ],
        fields: [
          { label: 'Mã phiếu', value: `#${phieu.maPDC}` },
          { label: 'Phòng', value: phieu.tenPhong || '—' },
          { label: 'Số tiền cọc', value: formatCurrency(phieu.tienCoc) },
          { label: 'Mã giao dịch', value: phieu.maGiaoDich || '—' },
          { label: 'Hạn xác nhận', value: formatDate(phieu.thoiGianHetHan) },
        ]
      };
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F9FB] pb-28 font-['Inter'] flex flex-col">
      {/* Header */}
      <div className="bg-[#00236F] text-white p-6 pt-10 rounded-b-[32px] shadow-sm mb-6 flex items-center gap-3 flex-shrink-0">
        <h1 className="text-lg font-bold">FIT 4.0 HOMESTAY</h1>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-4xl w-full mx-auto px-4 md:px-8 text-xs text-[#54647A] flex items-center gap-2 mb-6">
        <span className="cursor-pointer hover:underline hover:text-[#00236F] transition" onClick={() => navigate('/')}>Trang chủ</span>
        <span>/</span>
        <span className="cursor-pointer hover:underline hover:text-[#00236F] transition" onClick={() => navigate('/thanh-toan-coc')}>Đặt cọc</span>
        <span>/</span>
        <span className="text-[#191C1E] font-medium">Kết quả đặt cọc</span>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto px-4 md:px-8 flex-grow">
        {!phieu ? (
          <div className="bg-white border border-[#E0E3E5] rounded-2xl p-8 text-center text-[#54647A] py-16 shadow-sm">
            <span className="material-symbols-outlined text-5xl mb-3 text-red-400">receipt_long</span>
            <p className="font-semibold text-sm">Không tìm thấy thông tin phiếu cọc.</p>
          </div>
        ) : phieu.trangThai === 'ChoThanhToan' ? (
          <div className="bg-white border border-[#E0E3E5] rounded-2xl p-8 text-center py-12 space-y-4 shadow-sm">
            <span className="material-symbols-outlined text-5xl text-amber-500 animate-bounce">payment</span>
            <p className="text-sm font-semibold text-[#54647A]">Phiếu đặt cọc của bạn chưa được thanh toán hoàn tất.</p>
            <button
              onClick={() => navigate(`/xac-nhan-dat-coc/${maPDC}`)}
              className="px-6 py-3 bg-[#00236F] text-white rounded-xl text-sm font-bold hover:bg-[#1E3A8A] active:scale-95 transition-all shadow"
            >
              Tiếp tục thanh toán
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Layout 2 cột cho Desktop (lg), 1 cột cho Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Cột trái (5/12): Card trạng thái */}
              <div className="lg:col-span-5 bg-white border border-[#E0E3E5] rounded-2xl p-6 flex flex-col items-center text-center shadow-sm w-full">
                <div className={`w-20 h-20 rounded-full ${statusConfig.iconBg} flex items-center justify-center flex-shrink-0 mb-4 shadow-sm`}>
                  <span className={`material-symbols-outlined text-4xl ${statusConfig.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {statusConfig.icon}
                  </span>
                </div>
                <h2 className={`text-xl font-bold ${statusConfig.titleColor} mb-2 leading-tight`}>
                  {statusConfig.title}
                </h2>
                <p className="text-xs text-[#54647A] leading-relaxed w-full px-4">
                  {statusConfig.desc}
                </p>
                {statusConfig.stepBox}
              </div>

              {/* Cột phải (7/12): Card Chi tiết phiếu cọc */}
              <div className={`lg:col-span-7 rounded-2xl border ${statusConfig.borderClass} ${statusConfig.cardBg} p-6 space-y-4 shadow-sm w-full`}>
                <h3 className={`font-bold text-sm ${statusConfig.infoTitleColor} border-b ${statusConfig.borderClass} pb-3`}>
                  Chi tiết phiếu cọc
                </h3>
                <div className="space-y-3.5">
                  {statusConfig.fields.map(({ label, value, highlight }) => (
                    <div key={label} className="grid grid-cols-2 text-xs py-0.5 items-center">
                      <span className="text-[#54647A] font-medium text-left">{label}</span>
                      <span className={`font-semibold text-right break-words ${highlight ? 'text-green-700 text-[14px] bg-green-100/50 px-2 py-0.5 rounded inline-block self-end ml-auto' : 'text-[#191C1E]'}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Thanh hành động cuối trang */}
            <div className="border-t border-[#E0E3E5] pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                {statusConfig.actions.map((act) => (
                  <button
                    key={act.label}
                    onClick={act.onClick}
                    className={`px-6 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] w-full sm:w-auto text-center shadow-sm ${act.isPrimary
                      ? 'bg-[#00236F] text-white hover:bg-[#1E3A8A]'
                      : 'border border-[#E0E3E5] bg-white text-[#374151] hover:bg-slate-50'
                      }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default KetQuaDatCoc;
