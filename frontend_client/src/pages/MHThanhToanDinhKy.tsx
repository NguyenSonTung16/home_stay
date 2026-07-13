import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const MHThanhToanDinhKy: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dienNuoc' | 'phiDinhKy'>('dienNuoc');
  const [loading, setLoading] = useState(true);
  const [activeInfo, setActiveInfo] = useState<any>(null);
  const [dienNuocList, setDienNuocList] = useState<any[]>([]);
  const [phiDinhKyList, setPhiDinhKyList] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const getToken = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.token || localStorage.getItem('token');
      } catch (e) {
        return localStorage.getItem('token');
      }
    }
    return localStorage.getItem('token');
  };

  const fetchActiveInfoAndBills = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // 1. Lấy thông tin phòng & hợp đồng active
      const infoRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/hoa-don/active-info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const infoData = await infoRes.json();
      
      if (infoData.success && infoData.data) {
        const { maPhong, maHopDong } = infoData.data;
        setActiveInfo(infoData.data);

        // 2. Fetch danh sách hóa đơn điện nước
        if (maPhong) {
          const dnRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/hoa-don/dien-nuoc/${maPhong}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const dnData = await dnRes.json();
          if (dnData.success) {
            setDienNuocList(dnData.data || []);
          }
        }

        // 3. Fetch danh sách hóa đơn phí định kỳ
        if (maHopDong) {
          const pdkRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/hoa-don/phi-dinh-ky/${maHopDong}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const pdkData = await pdkRes.json();
          if (pdkData.success) {
            setPhiDinhKyList(pdkData.data || []);
          }
        }
      } else {
        setActiveInfo(null);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Lỗi khi tải thông tin hóa đơn định kỳ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveInfoAndBills();
  }, []);

  const handleThanhToan = (loai: 'DienNuoc' | 'PhiDinhKy', id: number) => {
    navigate(`/thanh-toan/${loai}/${id}`);
  };

  // Nav bar dưới cho thiết bị di động
  const renderBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E0E3E5] flex justify-around items-center px-2 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div
        onClick={() => navigate('/')}
        className="flex flex-col items-center justify-center text-[#54647A] px-3 py-1.5 cursor-pointer active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-[20px]">home_work</span>
        <span className="text-[11px] font-normal mt-0.5">Tìm kiếm</span>
      </div>

      <div
        onClick={() => navigate('/dat-lich-hen')}
        className="flex flex-col items-center justify-center text-[#54647A] px-3 py-1.5 cursor-pointer active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
        <span className="text-[11px] font-normal mt-0.5">Lịch hẹn</span>
      </div>

      <div
        onClick={() => navigate('/hop-dong')}
        className="flex flex-col items-center justify-center text-[#54647A] px-3 py-1.5 cursor-pointer active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-[20px]">receipt_long</span>
        <span className="text-[11px] font-normal mt-0.5">Hợp đồng</span>
      </div>

      <div
        onClick={() => navigate('/thanh-toan-dinh-ky')}
        className="flex flex-col items-center justify-center bg-[#00236F] text-white rounded-xl px-4 py-1.5 cursor-pointer active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-[20px]">payments</span>
        <span className="text-[11px] font-semibold mt-0.5">Thanh toán</span>
      </div>
    </nav>
  );

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <span className="material-symbols-outlined animate-spin text-[#00236F] text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!getToken()) {
    return (
      <div className="w-full min-h-screen bg-[#F7F9FB] flex flex-col items-center justify-center pb-20">
        <span className="material-symbols-outlined text-6xl text-[#C5C5D3] mb-4">lock</span>
        <p className="text-[#54647A] font-medium">Vui lòng đăng nhập để xem hóa đơn thanh toán</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-[#00236F] text-white rounded-xl text-sm font-semibold"
        >
          Quay về Trang chủ
        </button>
        {renderBottomNav()}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F9FB] pb-24 font-['Inter']">
      <div className="bg-[#00236F] text-white p-6 pt-10 rounded-b-[32px] shadow-sm mb-6 flex flex-col items-center">
        <h1 className="text-xl font-bold text-center">Thanh Toán Định Kỳ</h1>
        {activeInfo && (
          <span className="mt-2 text-xs bg-white/20 px-3 py-1 rounded-full text-white/90">
            Phòng: {activeInfo.tenPhong || 'Chưa xác định'} | HĐ: #{activeInfo.maHopDong}
          </span>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {errorMsg && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            {errorMsg}
          </div>
        )}

        {!activeInfo ? (
          <div className="bg-white rounded-[20px] p-8 text-center border border-[#E0E3E5] shadow-sm">
            <span className="material-symbols-outlined text-5xl text-[#C5C5D3] mb-3">house</span>
            <h3 className="font-bold text-[#191C1E] text-base mb-1">Không tìm thấy hợp đồng thuê</h3>
            <p className="text-xs text-[#54647A]">Bạn cần có hợp đồng thuê phòng còn hiệu lực để xem và thanh toán hóa đơn định kỳ.</p>
          </div>
        ) : (
          <>
            {/* TABS SELECTOR */}
            <div className="bg-white p-1.5 rounded-2xl border border-[#E0E3E5] flex gap-1 mb-5">
              <button
                onClick={() => setActiveTab('dienNuoc')}
                className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'dienNuoc' 
                    ? 'bg-[#00236F] text-white shadow-sm' 
                    : 'text-[#54647A] hover:bg-slate-50'
                }`}
              >
                Điện nước
              </button>
              <button
                onClick={() => setActiveTab('phiDinhKy')}
                className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'phiDinhKy' 
                    ? 'bg-[#00236F] text-white shadow-sm' 
                    : 'text-[#54647A] hover:bg-slate-50'
                }`}
              >
                Phí thuê phòng & DV
              </button>
            </div>

            {/* BILL LISTS */}
            <div className="space-y-4">
              {activeTab === 'dienNuoc' ? (
                dienNuocList.length === 0 ? (
                  <p className="text-center text-xs text-[#54647A] py-8">Không có hóa đơn điện nước nào.</p>
                ) : (
                  dienNuocList.map((item) => (
                    <div key={item.mahddn} className="bg-white border border-[#E0E3E5] rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-center border-b border-[#F2F4F6] pb-3">
                        <div>
                          <h4 className="font-bold text-[14px] text-[#191C1E]">Hóa đơn Điện Nước</h4>
                          <p className="text-[11px] text-[#54647A]">Kỳ thanh toán: {item.thang}</p>
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          item.trangthai === 'DaThanhToan' 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {item.trangthai === 'DaThanhToan' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs text-[#54647A]">
                        <div>
                          <p className="text-[10px] text-slate-400">Số Điện (cũ - mới)</p>
                          <p className="font-semibold text-[#191C1E]">{item.csdiencu} - {item.csdienmoi} kWh</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Số Nước (cũ - mới)</p>
                          <p className="font-semibold text-[#191C1E]">{item.csnuoccu} - {item.csnuocmoi} m³</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Tiền điện</p>
                          <p className="font-semibold text-[#191C1E]">{Number(item.tiendien).toLocaleString()}đ</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Tiền nước</p>
                          <p className="font-semibold text-[#191C1E]">{Number(item.tiennuoc).toLocaleString()}đ</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-[#F2F4F6] flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-slate-400">Tổng cộng</p>
                          <p className="font-bold text-base text-[#00236F]">{Number(item.tongtien).toLocaleString()}đ</p>
                        </div>
                        {item.trangthai === 'ChuaThanhToan' && (
                          <button
                            onClick={() => handleThanhToan('DienNuoc', item.mahddn)}
                            className="bg-[#00236F] hover:bg-[#1E3A8A] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm"
                          >
                            Thanh toán
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )
              ) : (
                phiDinhKyList.length === 0 ? (
                  <p className="text-center text-xs text-[#54647A] py-8">Không có hóa đơn phí định kỳ nào.</p>
                ) : (
                  phiDinhKyList.map((item) => (
                    <div key={item.mapdk} className="bg-white border border-[#E0E3E5] rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-center border-b border-[#F2F4F6] pb-3">
                        <div>
                          <h4 className="font-bold text-[14px] text-[#191C1E]">Tiền phòng & Dịch vụ</h4>
                          <p className="text-[11px] text-[#54647A]">Kỳ thanh toán: {item.thang}</p>
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          item.trangthai === 'DaThanhToan' 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {item.trangthai === 'DaThanhToan' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs text-[#54647A]">
                        <div>
                          <p className="text-[10px] text-slate-400">Tiền thuê phòng</p>
                          <p className="font-semibold text-[#191C1E]">{Number(item.tienphong).toLocaleString()}đ</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Phí dịch vụ khác</p>
                          <p className="font-semibold text-[#191C1E]">{Number(item.tiendichvu).toLocaleString()}đ</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-[#F2F4F6] flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-slate-400">Tổng cộng</p>
                          <p className="font-bold text-base text-[#00236F]">{Number(item.tongtien).toLocaleString()}đ</p>
                        </div>
                        {item.trangthai === 'ChuaThanhToan' && (
                          <button
                            onClick={() => handleThanhToan('PhiDinhKy', item.mapdk)}
                            className="bg-[#00236F] hover:bg-[#1E3A8A] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm"
                          >
                            Thanh toán
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </>
        )}
      </div>
      {renderBottomNav()}
    </div>
  );
};
