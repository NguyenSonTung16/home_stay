import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RequireLoginPlaceholder } from '../components/RequireLoginPlaceholder';

export const MHLichSuLichHen: React.FC = () => {
    const navigate = useNavigate();
    const [danhSachPhieuHen, setDanhSachPhieuHen] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { currentUser, openAuthModal } = useAuth();

    useEffect(() => {
        hienThi();
    }, [currentUser]);

    const hienThi = async () => {
        if (!currentUser) {
            setDanhSachPhieuHen([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lichhen`);
            const result = await res.json();
            if (result.success) {
                const userData = currentUser.user || currentUser;
                const myAppointments = result.data.filter((p: any) =>
                    String(p.makh) === String(userData.id) || String(p.makh) === String(userData.makh)
                );
                setDanhSachPhieuHen(myAppointments);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const btn_huyLichHen = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lichhen/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: -1 })
            });
            if (res.ok) {
                alert("Đã hủy lịch hẹn xem phòng!");
                hienThi();
            }
        } catch (error) {
            console.error("Lỗi khi hủy lịch hẹn:", error);
        }
    };

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 1:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                        Đã xác nhận
                    </span>
                );
            case -1:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                        Đã hủy / Từ chối
                    </span>
                );
            case 0:
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                        Chờ xác nhận
                    </span>
                );
        }
    };

    return (
        <div className="bg-[#F7F9FB] text-[#191C1E] font-sans pb-10">
            {/* Main Container */}
            <div className="px-4 sm:px-8 lg:px-12 w-full max-w-[1600px] mx-auto mt-6">
                <div className="mb-6">
                    <h2 className="text-[22px] font-extrabold text-[#00236F]">Lịch Sử Lịch Hẹn</h2>
                    <p className="text-[#54647A] text-[14px] mt-1">
                        Theo dõi lịch sử, trạng thái và chi tiết các lịch hẹn xem phòng mà bạn đã đăng ký.
                    </p>
                </div>

                {!currentUser ? (
                    <RequireLoginPlaceholder 
                        message="Để bảo mật, mỗi tài khoản chỉ xem được lịch hẹn xem phòng tương ứng của chính mình. Vui lòng đăng nhập để xem danh sách!"
                    />
                ) : isLoading ? (
                    <div className="bg-white p-12 rounded-3xl border border-[#E0E3E5] text-center text-[#54647A] w-full max-w-2xl mx-auto my-12">
                        Đang tải danh sách lịch hẹn...
                    </div>
                ) : danhSachPhieuHen.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-[#E0E3E5] text-center w-full max-w-2xl min-w-[340px] mx-auto my-12 flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-[#C5C5D3] text-[56px] mb-3">event_busy</span>
                        <p className="text-[#191C1E] font-bold text-[18px]">Bạn chưa có lịch hẹn nào</p>
                        <p className="text-[#54647A] text-[14px] mt-2 max-w-[400px] w-full mx-auto">Bạn có thể chọn phòng quan tâm và đặt lịch hẹn xem phòng mới.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 bg-[#00236F] text-white px-6 py-3 rounded-xl font-bold text-[14px] whitespace-nowrap hover:bg-[#00184D] transition-all shadow-md active:scale-95"
                        >
                            Khám phá phòng ngay
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Giao diện Bảng cho Desktop */}
                        <div className="hidden md:block bg-white rounded-3xl border border-[#E0E3E5] shadow-sm overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="bg-[#F8FAFC] border-b border-[#E0E3E5]">
                                        <th className="px-6 py-4 font-bold text-[#54647A] text-[12px] uppercase whitespace-nowrap w-28">Mã Phiếu</th>
                                        <th className="px-6 py-4 font-bold text-[#54647A] text-[12px] uppercase whitespace-nowrap w-48">Ngày &amp; Giờ hẹn</th>
                                        <th className="px-6 py-4 font-bold text-[#54647A] text-[12px] uppercase min-w-[220px]">Phòng muốn xem</th>
                                        <th className="px-6 py-4 font-bold text-[#54647A] text-[12px] uppercase min-w-[180px]">Ghi chú của bạn</th>
                                        <th className="px-6 py-4 font-bold text-[#54647A] text-[12px] uppercase whitespace-nowrap w-44">Trạng thái</th>
                                        <th className="px-6 py-4 font-bold text-[#54647A] text-[12px] uppercase text-center whitespace-nowrap w-36">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E0E3E5]">
                                    {danhSachPhieuHen.map((phieu) => (
                                        <tr key={phieu.maphieu} className="hover:bg-[#F7F9FB]/60 transition-colors">
                                            <td className="px-6 py-4 font-extrabold text-[#00236F] whitespace-nowrap">
                                                #{phieu.maphieu}
                                            </td>
                                            <td className="px-6 py-4 text-[13px] whitespace-nowrap">
                                                <span className="font-bold text-[#191C1E]">
                                                    {new Date(phieu.ngayhen).toLocaleDateString('vi-VN')}
                                                </span>
                                                <span className="text-[#54647A] ml-2 font-medium">({phieu.giohen})</span>
                                            </td>
                                            <td className="px-6 py-4 text-[#191C1E] font-semibold text-[13px]">
                                                {phieu.dsphongxem}
                                            </td>
                                            <td className="px-6 py-4 text-[#54647A] text-[13px]">
                                                {phieu.ghichu || 'Không có'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(phieu.trangthai)}
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                {phieu.trangthai === 0 ? (
                                                    <button
                                                        onClick={() => btn_huyLichHen(phieu.maphieu)}
                                                        className="px-4 py-2 bg-[#FEE2E2] text-[#991B1B] rounded-xl font-bold text-[12px] hover:bg-[#FECACA] transition-all active:scale-95"
                                                    >
                                                        Hủy lịch hẹn
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-[#94A3B8] italic">Không thể hủy</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Giao diện Thẻ Card cho Mobile */}
                        <div className="md:hidden flex flex-col gap-4">
                            {danhSachPhieuHen.map((phieu) => (
                                <div
                                    key={phieu.maphieu}
                                    className="bg-white p-4 rounded-2xl border border-[#E0E3E5] shadow-sm flex flex-col gap-3"
                                >
                                    <div className="flex justify-between items-center pb-2 border-b border-[#F2F4F6]">
                                        <span className="font-extrabold text-[#00236F] text-[14px]">
                                            Phiếu hẹn #{phieu.maphieu}
                                        </span>
                                        {getStatusBadge(phieu.trangthai)}
                                    </div>

                                    <div className="space-y-1.5 text-[13px]">
                                        <p><span className="text-[#54647A]">Thời gian:</span> <span className="font-bold text-[#00236F]">{new Date(phieu.ngayhen).toLocaleDateString('vi-VN')} ({phieu.giohen})</span></p>
                                        <p><span className="text-[#54647A]">Phòng xem:</span> <span className="font-medium text-[#191C1E]">{phieu.dsphongxem}</span></p>
                                        {phieu.ghichu && <p><span className="text-[#54647A]">Ghi chú:</span> <span className="text-[#191C1E]">{phieu.ghichu}</span></p>}
                                    </div>

                                    {phieu.trangthai === 0 && (
                                        <div className="pt-2 border-t border-[#F2F4F6]">
                                            <button
                                                onClick={() => btn_huyLichHen(phieu.maphieu)}
                                                className="w-full py-2 bg-[#FEE2E2] text-[#991B1B] rounded-xl font-bold text-[13px]"
                                            >
                                                Hủy lịch hẹn
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};
