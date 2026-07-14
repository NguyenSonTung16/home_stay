import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const Roomdetail = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const location = useLocation();
 const roomFromState = location.state?.room;

 const [room, setRoom] = useState<any>(roomFromState || null);
 const [loading, setLoading] = useState(!roomFromState);

 useEffect(() => {
 if (roomFromState) {
 setRoom(roomFromState);
 setLoading(false);
 return;
 }
 const fetchRoom = async () => {
 try {
 const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
 const res = await fetch(`${baseUrl}/api/phong/${id}`);
 if (res.ok) {
 const data = await res.json();
 setRoom(data);
 }
 } catch (err) {
 console.error('Lỗi khi tải chi tiết phòng:', err);
 } finally {
 setLoading(false);
 }
 };
 if (id) fetchRoom();
 }, [id, roomFromState]);

 const roomName = room?.name || room?.tenphong || 'Phòng chi tiết';
 const roomPrice = room?.price || room?.giatien || 500000;
 const roomBranch = room?.branch || room?.chinhanh || 'Tòa A • TP. HCM';
 const roomImage = room?.image || room?.hinhanh || "https://lh3.googleusercontent.com/aida-public/AB6AXuA56wTxeaDwoV4hphGCAobuBPBGMz15TV8sqrs23Iootl2c2REQK3gh2Gyxqbt7NcNQ_qle03YUR-Gn5BhuzjJRM2hupvo8LL6G1RghfLVB2Y_wHJ8818rSHBnELZOC-B0Ero4BL41IXqElpnFUya7HSUap1fl4H8voJyx2eDycgBow7ZOSq3HlE9leUHMOEUGY2MRa0zB-DfBz5LoSzFMPDjEiJGJosgTUnhlKevB8xIMBp0jpuTyV9l8Ae6-XN21x88-3acBFkZmf";

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00236F]"></div>
 </div>
 );
 }

 return (
 <>

 {/* Top App Bar */}
 <header
 className="fixed top-0 w-full z-50 bg-white shadow-sm border-b border-[#E0E3E5] h-14 flex items-center px-4 justify-between">
 <div className="flex items-center gap-4">
 <button aria-label="Quay lại" onClick={() => navigate(-1)}
 className="p-2 -ml-2 rounded-full hover:bg-[#F2F4F6] active:opacity-80 transition-all">
 <span className="material-symbols-outlined text-[#00236F]">arrow_back</span>
 </button>
 <h1 className="font-bold text-[18px] text-[#191C1E] truncate">{roomName}</h1>
 </div>
 <button className="p-2 rounded-full hover:bg-[#F2F4F6] active:opacity-80 transition-all">
 <span className="material-symbols-outlined text-[#00236F]">share</span>
 </button>
 </header>
 <main className="pt-14 pb-32">
 {/* Image Gallery Hero */}
 <section className="relative">
 <div className="w-full aspect-[4/3] bg-[#F2F4F6] overflow-hidden">
 <img alt={roomName} className="w-full h-full object-cover"
 src={roomImage} />
 </div>
 </section>
 {/* Main Info */}
 <section className="px-4 mt-4">
 <div className="flex flex-col gap-2">
 <div className="flex justify-between items-baseline">
 <div className="flex flex-col">
 <span className="text-[#00236F] font-bold text-[24px]">
 {(Number(roomPrice) / 1000000).toFixed(1)}M VNĐ{' '}
 <span className=" font-normal text-[#54647A]">/ tháng</span>
 </span>
 </div>
 <div className="bg-[#EBF5FF] text-[#1E40AF] px-3 py-1 rounded-full font-medium text-[11px] flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
 {room?.status || "Còn trống"}
 </div>
 </div>
 <div className="flex items-center gap-1 text-[#54647A] text-[13px]">
 <span className="material-symbols-outlined text-sm">apartment</span>
 Vị trí: {roomBranch}
 </div>
 </div>
 </section>
 {/* Description */}
 <section className="px-4 mt-6">
 <h2 className="font-bold text-[18px] text-[#191C1E] mb-2">Mô tả chi tiết</h2>
 <p className="text-[13px] text-[#54647A] leading-relaxed">
 Phòng được thiết kế hiện đại, đầy đủ ánh sáng tự nhiên. Phù hợp cho sinh viên và người đi làm trẻ cần
 không gian yên tĩnh và tiện nghi.
 </p>
 </section>
 {/* Amenities Grid */}
 <section className="px-4 mt-6">
 <h2 className="font-bold text-[18px] text-[#191C1E] mb-4">Tiện nghi &amp; Dịch vụ</h2>
 <div className="grid grid-cols-1 gap-2">
 {/* Amenity Item */}
 <div
 className="flex items-start p-4 bg-white rounded-xl border border-[#E0E3E5] shadow-sm hover:border-[#00236F]-fixed-dim transition-colors">
 <div className="w-10 h-10 rounded-lg bg-[#DCE1FF] flex items-center justify-center mr-4">
 <span className="material-symbols-outlined text-[#00236F]">wifi</span>
 </div>
 <div className="flex flex-col">
 <span className="font-semibold text-[13px] text-[#191C1E]">Wi-Fi</span>
 <span className="text-[12px] text-[#54647A]">Tốc độ cao</span>
 </div>
 </div>
 <div
 className="flex items-start p-4 bg-white rounded-xl border border-[#E0E3E5] shadow-sm hover:border-[#00236F]-fixed-dim transition-colors">
 <div className="w-10 h-10 rounded-lg bg-[#DCE1FF] flex items-center justify-center mr-4">
 <span className="material-symbols-outlined text-[#00236F]">ac_unit</span>
 </div>
 <div className="flex flex-col">
 <span className="font-semibold text-[13px] text-[#191C1E]">Máy lạnh</span>
 <span className="text-[12px] text-[#54647A]">Inverter tiết kiệm điện</span>
 </div>
 </div>
 <div
 className="flex items-start p-4 bg-white rounded-xl border border-[#E0E3E5] shadow-sm hover:border-[#00236F]-fixed-dim transition-colors">
 <div className="w-10 h-10 rounded-lg bg-[#DCE1FF] flex items-center justify-center mr-4">
 <span className="material-symbols-outlined text-[#00236F]">lock</span>
 </div>
 <div className="flex flex-col">
 <span className="font-semibold text-[13px] text-[#191C1E]">Tủ cá nhân</span>
 <span className="text-[12px] text-[#54647A]">Khóa từ</span>
 </div>
 </div>
 <div
 className="flex items-start p-4 bg-white rounded-xl border border-[#E0E3E5] shadow-sm hover:border-[#00236F]-fixed-dim transition-colors">
 <div className="w-10 h-10 rounded-lg bg-[#DCE1FF] flex items-center justify-center mr-4">
 <span className="material-symbols-outlined text-[#00236F]">bed</span>
 </div>
 <div className="flex flex-col">
 <span className="font-semibold text-[13px] text-[#191C1E]">Giường tầng</span>
 <span className="text-[12px] text-[#54647A]">Nệm cao su êm ái</span>
 </div>
 </div>
 <div
 className="flex items-start p-4 bg-white rounded-xl border border-[#E0E3E5] shadow-sm hover:border-[#00236F]-fixed-dim transition-colors">
 <div className="w-10 h-10 rounded-lg bg-[#DCE1FF] flex items-center justify-center mr-4">
 <span className="material-symbols-outlined text-[#00236F]">cleaning_services</span>
 </div>
 <div className="flex flex-col">
 <span className="font-semibold text-[13px] text-[#191C1E]">Dịch vụ dọn phòng</span>
 <span className="text-[12px] text-[#54647A]">2 lần/tuần</span>
 </div>
 </div>
 <div
 className="flex items-start p-4 bg-white rounded-xl border border-[#E0E3E5] shadow-sm hover:border-[#00236F]-fixed-dim transition-colors">
 <div className="w-10 h-10 rounded-lg bg-[#DCE1FF] flex items-center justify-center mr-4">
 <span className="material-symbols-outlined text-[#00236F]">soup_kitchen</span>
 </div>
 <div className="flex flex-col">
 <span className="font-semibold text-[13px] text-[#191C1E]">Khu vực bếp chung</span>
 <span className="text-[12px] text-[#54647A]">Đầy đủ dụng cụ</span>
 </div>
 </div>
 <div
 className="flex items-start p-4 bg-white rounded-xl border border-[#E0E3E5] shadow-sm hover:border-[#00236F]-fixed-dim transition-colors">
 <div className="w-10 h-10 rounded-lg bg-[#DCE1FF] flex items-center justify-center mr-4">
 <span className="material-symbols-outlined text-[#00236F]">local_parking</span>
 </div>
 <div className="flex flex-col">
 <span className="font-semibold text-[13px] text-[#191C1E]">Bãi đậu xe</span>
 <span className="text-[12px] text-[#54647A]">An ninh 24/7</span>
 </div>
 </div>
 </div>
 </section>
 {/* Shared Facilities */}
 <section className="px-4 mt-6 pb-10">
 <div className="bg-[#F2F4F6] p-5 rounded-xl border-l-4 border-[#00236F]">
 <h3 className="font-semibold text-[13px] text-[#00236F] mb-2">Tiện ích chung tòa nhà</h3>
 <p className="text-[12px] text-[#54647A]">
 Khu vực sinh hoạt chung, Máy giặt sấy tự động, Hệ thống PCCC hiện đại.
 </p>
 </div>
 </section>
 </main>
 {/* Footer Action Buttons */}
 <footer
 className="fixed bottom-0 w-full z-50 bg-white border-t border-[#E0E3E5] p-4 flex gap-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
 <button
 onClick={() => navigate('/dat-lich-hen', { state: { selectedRooms: room ? [room] : [] } })}
 className="flex-1 py-3 px-4 border border-[#00236F] text-[#00236F] font-semibold text-[13px] rounded-xl hover:bg-[#F2F4F6] transition-colors active:scale-95">
 Hẹn xem phòng
 </button>
 <button
 onClick={() => alert(`Đã bấm đặt cọc cho ${roomName}`)}
 className="flex-[1.5] py-3 px-4 bg-[#00236F] text-white font-semibold text-[13px] rounded-xl shadow-md hover:bg-opacity-90 transition-all active:scale-95">
 Đặt cọc ngay
 </button>
 </footer>
 {/* Interactive Layer: Simple Scroll Indicator */}


 </>
 );
};

export default Roomdetail;
