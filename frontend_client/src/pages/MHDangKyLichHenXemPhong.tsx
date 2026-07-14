import BottomNav from '../components/BottomNav';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const MHDangKyLichHenXemPhong = () => {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
            }
        }
    }, []);

    const [danhSachPhong, setDanhSachPhong] = useState<any[]>([]);

    const [selectedDate, setSelectedDate] = useState<number>(8);
    const [selectedMonthStr, setSelectedMonthStr] = useState<string>("Tháng 10, 2023");
    const [selectedTime, setSelectedTime] = useState<string>("09:30");
    const [txtMoTa, setTxtMoTa] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const str = localStorage.getItem("danhSachPhongQuanTam");
        if (str) {
            try {
                const list = JSON.parse(str);
                if (list && list.length > 0) {
                    setDanhSachPhong(list);
                    return;
                }
            } catch {
                // fall through
            }
        }
        setDanhSachPhong([]);
    }, []);

    const btn_datLich = async () => {
        if (!currentUser || (!currentUser.user && !currentUser.id)) {
            alert("Vui lòng đăng nhập để đặt lịch hẹn!");
            return;
        }

        const userData = currentUser.user || currentUser;
        const maKH = userData.user?.makh || userData.user?.id || userData.makh || userData.id;
        
        // Ensure maKH is a valid number
        const maKHNumber = Number(maKH) || 1;

        const danhSachMaPhong = danhSachPhong
            .map(p => p.MaPhong || p.maphong)
            .filter(Boolean)
            .map(Number)
            .filter(n => !isNaN(n));
            
        const chuoiDSPhong = danhSachPhong
            .map(p => p.tenphong || p.TenPhong || `Phòng #${p.maphong || p.MaPhong}`)
            .filter(Boolean)
            .join(', ');

        const formattedNgayHen = `2023-10-${selectedDate < 10 ? '0' + selectedDate : selectedDate}`;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lichhen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    MaKH: maKHNumber,
                    DanhSachMaPhong: danhSachMaPhong,
                    DSPhongXem: chuoiDSPhong || (danhSachMaPhong.length > 0 ? `Phòng ${danhSachMaPhong.join(', ')}` : 'Chưa chọn phòng'),
                    NgayHen: formattedNgayHen,
                    GioHen: selectedTime,
                    GhiChu: txtMoTa
                })
            });

            const result = await res.json();
            if (result.success) {
                alert(`Đăng ký lịch hẹn xem ${danhSachPhong.length} phòng vào ngày ${selectedDate} lúc ${selectedTime} thành công!`);
                localStorage.removeItem("danhSachPhongQuanTam");
                navigate('/lich-su-lich-hen');
            } else {
                alert(`Đăng ký lịch hẹn thất bại: ${result.message || 'Có lỗi xảy ra'}`);
            }
        } catch (error: any) {
            console.error("Lỗi đặt lịch:", error);
            alert(`Lỗi kết nối khi đặt lịch hẹn: ${error.message || error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const calendarDays = [
        { day: 30, disabled: true },
        { day: 1, disabled: false },
        { day: 2, disabled: false },
        { day: 3, disabled: false },
        { day: 4, disabled: false },
        { day: 5, disabled: false },
        { day: 6, disabled: false },
        { day: 7, disabled: false },
        { day: 8, disabled: false },
        { day: 9, disabled: false },
        { day: 10, disabled: false },
        { day: 11, disabled: false },
        { day: 12, disabled: false },
        { day: 13, disabled: false },
        { day: 14, disabled: false },
    ];

    const timeSlotsRow1 = ["08:00", "09:30", "14:00"];
    const timeSlotsRow2 = ["16:30"];

    return (
        <div className="min-h-screen bg-[#F7F9FB] text-[#191C1E] font-sans pb-28">
            {/* Top Bar */}
            <header className="bg-white border-b border-[#E0E3E5] h-16 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 lg:px-8 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="text-[#00236F] active:scale-95 transition-transform flex items-center"
                    >
                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </button>
                    <h1 className="text-[#00236F] font-bold text-[18px] sm:text-[22px] leading-tight">
                        Đặt lịch xem nhiều phòng
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-[#EBF5FF] border border-[#BFDBFE] text-[#1E40AF] font-bold text-xs">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        <span>{currentUser?.user?.hoten || currentUser?.user?.username || currentUser?.username || currentUser?.hoten || currentUser?.email || "Guest"}</span>
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <main className="pt-24 px-4 sm:px-8 lg:px-12 w-full max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Cột trái trên Desktop / Phần trên Mobile: DANH SÁCH PHÒNG ĐÃ CHỌN */}
                    <div className="lg:col-span-5 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[13px] font-bold text-[#54647A] tracking-wider uppercase">
                                DANH SÁCH PHÒNG ĐÃ CHỌN
                            </h3>
                            <span className="text-[13px] text-[#00236F] font-bold">
                                {danhSachPhong.length} phòng
                            </span>
                        </div>

                        {/* Trên Mobile: lướt ngang chuẩn ảnh MH_lich_hen.png; Trên PC: xếp danh sách rộng rãi thoáng đẹp */}
                        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 hide-scrollbar">
                            {danhSachPhong.map((phong, index) => (
                                <div
                                    key={phong.maphong || index}
                                    className="bg-white border border-[#E0E3E5] rounded-2xl p-3 flex items-center gap-3.5 min-w-[240px] lg:w-full shadow-sm flex-shrink-0 hover:border-[#00236F] transition-colors"
                                >
                                    <img
                                        src={phong.hinhanh || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80"}
                                        alt={phong.tenphong}
                                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                    />
                                    <div className="overflow-hidden flex-1">
                                        <h4 className="text-[#00236F] font-bold text-[14px] truncate">
                                            {phong.tenphong}
                                        </h4>
                                        <p className="text-[#54647A] text-[12px] truncate mt-0.5">
                                            {phong.chinhanh || "Quận 1, TP. HCM"}
                                        </p>
                                        <p className="text-[#00236F] font-bold text-[14px] mt-1">
                                            {(Number(phong.giatien) / 1000000).toFixed(1)}tr
                                            <span className="text-[#54647A] font-normal text-[11px]">/tháng</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cột phải trên Desktop / Phần dưới Mobile: CHỌN NGÀY, GIỜ VÀ GHI CHÚ */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        {/* CHỌN NGÀY XEM PHÒNG */}
                        <div>
                            <div className="flex justify-between items-center mb-2.5">
                                <h3 className="text-[13px] font-bold text-[#54647A] tracking-wider uppercase">
                                    CHỌN NGÀY XEM PHÒNG
                                </h3>
                                <span className="text-[13px] text-[#00236F] font-bold">
                                    {selectedMonthStr}
                                </span>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-[#E0E3E5] shadow-sm">
                                <div className="grid grid-cols-7 text-center pb-3 border-b border-[#F2F4F6]">
                                    {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((wd, i) => (
                                        <span key={i} className="text-[#54647A] text-[12px] font-semibold">
                                            {wd}
                                        </span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-y-3 pt-3 text-center">
                                    {calendarDays.map((item, idx) => {
                                        const isSelected = item.day === selectedDate && !item.disabled;
                                        return (
                                            <div key={idx} className="flex justify-center items-center">
                                                <button
                                                    disabled={item.disabled}
                                                    onClick={() => setSelectedDate(item.day)}
                                                    className={
                                                        isSelected
                                                            ? "w-10 h-10 rounded-xl bg-[#00236F] text-white font-bold text-[14px] flex items-center justify-center shadow-md scale-105 transition-all"
                                                            : item.disabled
                                                                ? "w-10 h-10 text-[#C5C5D3] font-normal text-[14px] cursor-not-allowed"
                                                                : "w-10 h-10 text-[#191C1E] font-medium text-[14px] hover:bg-[#F7F9FB] rounded-xl transition-all"
                                                    }
                                                >
                                                    {item.day}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* CHỌN GIỜ HẸN */}
                        <div>
                            <h3 className="text-[13px] font-bold text-[#54647A] tracking-wider uppercase mb-2.5">
                                CHỌN GIỜ HẸN
                            </h3>

                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-3 gap-3">
                                    {timeSlotsRow1.map(slot => {
                                        const isSelected = selectedTime === slot;
                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setSelectedTime(slot)}
                                                className={
                                                    isSelected
                                                        ? "py-3.5 rounded-xl bg-[#DCE1FF] border-2 border-[#00236F] text-[#00236F] font-bold text-[14px] transition-all text-center shadow-sm"
                                                        : "py-3.5 rounded-xl bg-white border border-[#E0E3E5] text-[#444651] font-medium text-[14px] hover:bg-[#F7F9FB] transition-all text-center"
                                                }
                                            >
                                                {slot}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="w-full">
                                    {timeSlotsRow2.map(slot => {
                                        const isSelected = selectedTime === slot;
                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setSelectedTime(slot)}
                                                className={
                                                    isSelected
                                                        ? "w-full py-3.5 rounded-xl bg-[#DCE1FF] border-2 border-[#00236F] text-[#00236F] font-bold text-[14px] transition-all text-center shadow-sm"
                                                        : "w-full py-3.5 rounded-xl bg-white border border-[#E0E3E5] text-[#444651] font-medium text-[14px] hover:bg-[#F7F9FB] transition-all text-center"
                                                }
                                            >
                                                {slot}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* GHI CHÚ CHO SALE */}
                        <div>
                            <h3 className="text-[13px] font-bold text-[#54647A] tracking-wider uppercase mb-2.5">
                                GHI CHÚ CHO SALE
                            </h3>

                            <div className="relative">
                                <textarea
                                    value={txtMoTa}
                                    onChange={(e) => setTxtMoTa(e.target.value)}
                                    placeholder="Mô tả nhu cầu cụ thể của bạn (ví dụ: cần xem thêm bãi đỗ xe)..."
                                    className="w-full h-32 bg-white border border-[#E0E3E5] rounded-2xl p-4 text-[14px] text-[#191C1E] placeholder-[#757682] focus:outline-none focus:border-[#00236F] resize-none shadow-sm pb-8"
                                />
                                <span className="absolute bottom-3.5 right-4 text-[11px] text-[#757682] font-bold tracking-wider uppercase pointer-events-none">
                                    OPTIONAL
                                </span>
                            </div>
                        </div>

                        {/* NÚT XÁC NHẬN ĐẶT LỊCH */}
                        <button
                            disabled={isSubmitting}
                            onClick={btn_datLich}
                            className="w-full bg-[#00236F] hover:bg-[#1E3A8A] text-white font-bold text-[16px] py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2.5 mt-2 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-[22px]">calendar_add_on</span>
                            <span>{isSubmitting ? "Đang xử lý..." : "Xác nhận đặt lịch"}</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation Bar luôn hiển thị cố định ở cạnh dưới cùng */}
            <BottomNav />

        </div>
    );
};
