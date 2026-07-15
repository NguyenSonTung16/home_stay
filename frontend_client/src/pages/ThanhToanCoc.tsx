import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useLichSuDatCoc } from '../hooks/useLichSuDatCoc';

const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + 'đ';
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

// Sub-component cho đồng hồ đếm ngược của card "Đang chờ"
const CardCountDown: React.FC<{ targetTime: string }> = ({ targetTime }) => {
  const [remaining, setRemaining] = useState<number>(0);

  React.useEffect(() => {
    const tick = () => {
      const diff = new Date(targetTime).getTime() - Date.now();
      setRemaining(Math.max(0, diff));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isExpired = remaining === 0;

  if (isExpired) {
    return <span className="text-red-500 font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">warning</span> Hết hạn</span>;
  }

  const colorClass = remaining < 3600000 ? 'text-red-500 font-semibold' : 'text-amber-600 font-medium';

  return (
    <span className={`${colorClass} flex items-center gap-1 text-[11px]`}>
      <span className="material-symbols-outlined text-[13px]">schedule</span>
      Còn lại: {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
};

// Skeleton Loader
const SkeletonCard = () => (
  <div className="bg-white border border-[#E0E3E5] rounded-2xl p-5 space-y-4 animate-pulse shadow-sm">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      <div className="h-6 bg-slate-200 rounded-full w-20"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="h-6 bg-slate-200 rounded w-1/4"></div>
      <div className="h-4 bg-slate-200 rounded w-16"></div>
    </div>
    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
      <div className="h-4 bg-slate-200 rounded-full w-4"></div>
    </div>
  </div>
);

export default function ThanhToanCoc() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Tất cả' | 'Đang chờ' | 'Đã hoàn tất' | 'Đã hủy'>('Tất cả');

  // Lấy maKH từ currentUser trong localStorage
  const userDataStr = localStorage.getItem('currentUser');
  const userData = userDataStr ? JSON.parse(userDataStr) : {};
  const maKH = Number(userData.user?.makh || userData.user?.id || userData.makh || userData.id) || 1;

  const { data: list, counts, loading, error } = useLichSuDatCoc(maKH, activeTab);

  // Trả về badge cấu hình cho thẻ trạng thái
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'DaThanhToan':
        return { text: 'Đã hoàn tất', bg: 'bg-green-100 text-green-700 border-green-200' };
      case 'DaHuy':
        return { text: 'Đã hủy', bg: 'bg-gray-100 text-gray-600 border-gray-200' };
      case 'ChoXacNhanTienMat':
        return { text: 'Chờ xác nhận', bg: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'ChoDuyet':
        return { text: 'Chờ Sale duyệt', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'ChoThanhToan':
      default:
        return { text: 'Chờ thanh toán', bg: 'bg-orange-100 text-orange-700 border-orange-200' };
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F9FB] pb-28 font-['Inter'] flex flex-col">
      {/* Header */}
      <div className="bg-[#00236F] text-white p-6 pt-10 rounded-b-[32px] shadow-sm mb-6 flex-shrink-0">
        <h1 className="text-lg font-bold">Lịch Sử Đặt Cọc</h1>
        <p className="text-xs text-white/70 mt-1">Quản lý và theo dõi toàn bộ lịch sử các giao dịch đặt cọc giữ chỗ của bạn.</p>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl w-full mx-auto px-4 flex-grow space-y-6">
        
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>{error}
          </div>
        )}

        {/* Tab lọc trạng thái */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none flex-shrink-0">
          {([
            { key: 'Tất cả', count: counts.all, color: 'bg-slate-100 text-slate-700' },
            { key: 'Đang chờ', count: counts.pending, color: 'bg-orange-100 text-orange-700' },
            { key: 'Đã hoàn tất', count: counts.completed, color: 'bg-green-100 text-green-700' },
            { key: 'Đã hủy', count: counts.canceled, color: 'bg-gray-100 text-gray-600' }
          ] as const).map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                  active
                    ? 'bg-[#00236F] text-white border-[#00236F]'
                    : 'bg-white text-[#54647A] border-[#E0E3E5] hover:bg-slate-50'
                }`}
              >
                {tab.key}
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${active ? 'bg-white text-[#00236F]' : tab.color}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Cards Layout */}
        {loading ? (
          <div className="flex flex-col gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : list.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-[#E0E3E5] rounded-2xl p-8 text-center text-[#54647A] py-16 shadow-sm flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-5xl text-[#C5C5D3]">receipt_long</span>
            <div>
              <p className="font-semibold text-sm text-[#191C1E]">
                {activeTab === 'Tất cả' && 'Bạn chưa có phiếu đặt cọc nào'}
                {activeTab === 'Đang chờ' && 'Không có phiếu nào đang chờ thanh toán'}
                {activeTab === 'Đã hoàn tất' && 'Chưa có giao dịch đặt cọc thành công nào'}
                {activeTab === 'Đã hủy' && 'Chưa có giao dịch đặt cọc nào bị hủy'}
              </p>
              {activeTab === 'Tất cả' && (
                <p className="text-xs text-[#54647A] mt-1">Tìm kiếm phòng và tiến hành đặt cọc ngay.</p>
              )}
            </div>
            {activeTab === 'Tất cả' && (
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-[#00236F] text-white rounded-xl text-xs font-bold hover:bg-[#1E3A8A] active:scale-95 transition-all shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">search</span>
                Tìm phòng ngay
              </button>
            )}
          </div>
        ) : (
          /* Cards List */
          <div className="flex flex-col gap-4">
            {list.map((phieu) => {
              const badge = getBadgeStyle(phieu.trangthai);
              const isPendingPayment = phieu.trangthai === 'ChoThanhToan';
              const isWaitingConfirm = phieu.trangthai === 'ChoXacNhanTienMat';
              const isPendingApproval = phieu.trangthai === 'ChoDuyet';
              const isCompleted = phieu.trangthai === 'DaThanhToan';
              const isCanceled = phieu.trangthai === 'DaHuy';

              return (
                <div
                  key={phieu.macoc}
                  onClick={() => navigate(`/ket-qua-dat-coc/${phieu.macoc}`)}
                  className="bg-white border border-[#E0E3E5] hover:border-[#00236F]/30 hover:shadow-md rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.99] relative group shadow-sm"
                >
                  <div className="space-y-3.5">
                    {/* Dòng trên: Tên phòng + Trạng thái */}
                    <div className="flex justify-between items-center gap-3">
                      <span className="font-bold text-[15px] text-[#191C1E] group-hover:text-[#00236F] transition">
                        Phòng {phieu.tenphong || '—'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {badge.text}
                      </span>
                    </div>

                    {/* Dòng giữa: Số tiền cọc + Phương thức */}
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-extrabold text-[#191C1E]">
                        {formatCurrency(Number(phieu.tiencoc))}
                      </span>
                      <span className="text-[11px] text-[#54647A] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          {phieu.ptthanhtoan === 'ChuyenKhoan' ? 'credit_card' : 'payments'}
                        </span>
                        {phieu.ptthanhtoan === 'ChuyenKhoan' ? 'Chuyển khoản / PayPal' : phieu.ptthanhtoan === 'TienMat' ? 'Tiền mặt' : '—'}
                      </span>
                    </div>

                    {/* Dòng dưới: Countdown / Thời gian */}
                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center gap-4 text-[11px]">
                      <div>
                        {isPendingPayment && <CardCountDown targetTime={phieu.thoigianhethan} />}
                        {isPendingApproval && (
                          <span className="text-[#54647A] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-purple-500">hourglass_empty</span>
                            Chờ Sale xác nhận
                          </span>
                        )}
                        {isWaitingConfirm && (
                          <span className="text-[#54647A] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-amber-500">pending</span>
                            Chờ đối soát từ: {formatDate(phieu.thoigiantao)}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            Duyệt ngày: {formatDate(phieu.thoigianxacnhan)}
                          </span>
                        )}
                        {isCanceled && (
                          <span className="text-red-500 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">cancel</span>
                            Đã hủy (Quá hạn 24h)
                          </span>
                        )}
                      </div>

                      <span className="material-symbols-outlined text-[18px] text-[#C5C5D3] group-hover:text-[#00236F] group-hover:translate-x-0.5 transition-all">
                        chevron_right
                      </span>
                    </div>
                  </div>

                  {/* Nút CTA "Tiếp tục thanh toán" cho card đang chờ */}
                  {isPendingPayment && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Không kích hoạt onClick của Card cha
                          navigate(`/xac-nhan-dat-coc/${phieu.macoc}`);
                        }}
                        className="px-4 py-2 bg-[#00236F] hover:bg-[#1E3A8A] text-white font-bold text-[11px] rounded-lg shadow-sm active:scale-95 transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">payment</span>
                        Tiếp tục thanh toán
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
