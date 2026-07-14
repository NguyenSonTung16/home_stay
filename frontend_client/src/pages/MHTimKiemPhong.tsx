import BottomNav from '../components/BottomNav';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from '../components/AuthModal';

export const MHTimKiemPhong = () => {
    const navigate = useNavigate();

    const [selectedCapacity, setSelectedCapacity] = useState<number | null>(null);
    const [slGiaTien, setSlGiaTien] = useState(10000000);
    const [danhSachPhong, setDanhSachPhong] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Quản lý tiện ích
    const [amenities, setAmenities] = useState({
        wifi: true,
        mayLanh: true,
        tuCaNhan: false
    });

    // Quản lý Danh sách phòng quan tâm (localStorage)
    const [danhSachQuanTam, setDanhSachQuanTam] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Quản lý Đăng nhập / Người dùng
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Quản lý Đặt cọc
    const [selectedDepositRoom, setSelectedDepositRoom] = useState<any>(null);
    const [soGiuongDeposit, setSoGiuongDeposit] = useState(1);
    const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

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

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
    };

    const btn_submitDeposit = async () => {
        if (!selectedDepositRoom) return;

        // Bắt đăng nhập nếu chưa có
        if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
        }

        setIsSubmittingDeposit(true);
        try {
            const userId = currentUser.user?.makh || currentUser.makh || currentUser.user?.id || currentUser.id || 1; 

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/booking/dat-coc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    maKH: userId,
                    maPhong: selectedDepositRoom.maphong || selectedDepositRoom.MaPhong,
                    soGiuong: soGiuongDeposit,
                    soThangThue: 6
                })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert(`Đặt cọc thành công cho phòng ${selectedDepositRoom.tenphong || selectedDepositRoom.TenPhong}! Chuyển hướng tới trang thanh toán...`);
                setSelectedDepositRoom(null);
                navigate('/thanh-toan-coc');
            } else {
                alert(data.message || 'Có lỗi xảy ra khi đặt cọc.');
            }
        } catch (error) {
            alert('Lỗi kết nối máy chủ khi đặt cọc.');
        } finally {
            setIsSubmittingDeposit(false);
        }
    };


    const loadDanhSachQuanTam = () => {
        const str = localStorage.getItem("danhSachPhongQuanTam");
        if (str) {
            try {
                setDanhSachQuanTam(JSON.parse(str));
            } catch {
                setDanhSachQuanTam([]);
            }
        }
    };

    const hienThi = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams();
            if (slGiaTien > 0) query.append("gia", slGiaTien.toString());

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/phong/search?${query.toString()}`);
            const result = await res.json();
            if (result.success && result.data && Array.isArray(result.data)) {
                const enrichedData = result.data.map((p: any) => ({
                    maphong: p.MaPhong || p.maphong,
                    tenphong: p.TenPhong || p.tenphong,
                    chinhanh: p.ChiNhanh || p.chinhanh || "TP. Hồ Chí Minh",
                    giatien: Number(p.GiaTien || p.giatien || 0),
                    succhua: Number(p.SucChua || p.succhua || 0),
                    dientich: Number(p.DienTich || p.dientich || 25),
                    trangthai: (p.TrangThai === 1 || p.TrangThai === "Còn trống" || p.trangthai === 1 || p.trangthai === "Còn trống") ? "Còn trống" : "Sắp hết",
                    badgeColor: (p.TrangThai === "Sắp hết" || p.trangthai === "Sắp hết") ? "warning" : "success",
                    tienich: p.TienIch || p.tienich || ["wifi", "mayLanh", "tuCaNhan"],
                    hinhanh: p.HinhAnh || p.hinhanh || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
                }));
                setDanhSachPhong(enrichedData);
            } else {
                setDanhSachPhong([]);
            }
        } catch (error) {
            console.error("Lỗi kết nối máy chủ API lấy danh sách phòng:", error);
            setDanhSachPhong([]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelect = (maphong: number) => {
        setDanhSachPhong(prev => prev.map(p => (p.MaPhong || p.maphong) === maphong ? { ...p, selected: !p.selected } : p));
    };

    const btn_themQuanTam = () => {
        const selectedIds = danhSachPhong.filter(p => p.selected).map(p => ({
            maphong: p.MaPhong || p.maphong,
            tenphong: p.TenPhong || p.tenphong,
            giathue: p.GiaTien || p.giathue,
            hinhanh: p.HinhAnh || p.hinhanh
        }));
        
        const existingIds = danhSachQuanTam.map((p: any) => p.maphong || p.MaPhong);
        const newItems = selectedIds.filter(p => !existingIds.includes(p.maphong));
        
        if (newItems.length > 0) {
            const newList = [...danhSachQuanTam, ...newItems];
            setDanhSachQuanTam(newList);
            localStorage.setItem("danhSachPhongQuanTam", JSON.stringify(newList));
            alert(`Đã thêm ${newItems.length} phòng vào danh sách quan tâm!`);
        } else {
            alert("Các phòng đã chọn đều đã có trong danh sách quan tâm.");
        }
        
        // Reset selected state
        setDanhSachPhong(prev => prev.map(p => ({ ...p, selected: false })));
        setIsModalOpen(false);
    };

    const btn_xoaQuanTam = (maPhong: number) => {
        const newList = danhSachQuanTam.filter((p: any) => (p.maphong || p.MaPhong) !== maPhong);
        setDanhSachQuanTam(newList);
        localStorage.setItem("danhSachPhongQuanTam", JSON.stringify(newList));
    };

    const btn_henXemPhong = (phong: any) => {
        const phongId = phong.MaPhong || phong.maphong;
        const daTonTai = danhSachQuanTam.some((p: any) => (p.maphong || p.MaPhong) === phongId);
        if (!daTonTai) {
            const newList = [...danhSachQuanTam, {
                maphong: phongId,
                tenphong: phong.TenPhong || phong.tenphong,
                giathue: phong.GiaTien || phong.giathue,
                hinhanh: phong.HinhAnh || phong.hinhanh
            }];
            setDanhSachQuanTam(newList);
            localStorage.setItem("danhSachPhongQuanTam", JSON.stringify(newList));
            alert(`Đã thêm "${phong.TenPhong || phong.tenphong}" vào danh sách quan tâm!`);
        } else {
            alert("Phòng này đã có trong danh sách quan tâm của bạn.");
        }
    };

    const btn_chuyenDenDatLich = () => {
        if (danhSachQuanTam.length === 0) {
            alert("Bạn chưa chọn phòng nào trong danh sách quan tâm!");
            return;
        }
        setIsModalOpen(false);
        navigate('/dat-lich-hen');
    };

    useEffect(() => {
        loadDanhSachQuanTam();
        hienThi();
    }, []);

    const filteredRooms = danhSachPhong.filter(phong => {
        // 1. Lọc theo Loại phòng (Số người)
        if (selectedCapacity && Number(phong.succhua) !== selectedCapacity) {
            return false;
        }
        // 2. Lọc theo Khoảng giá tối đa
        if (Number(phong.giatien) > slGiaTien) {
            return false;
        }
        // 3. Lọc theo Tiện ích đi kèm
        const dsTienIch: string[] = phong.tienich || [];
        if (amenities.wifi && !dsTienIch.includes("wifi")) {
            return false;
        }
        if (amenities.mayLanh && !dsTienIch.includes("mayLanh")) {
            return false;
        }
        if (amenities.tuCaNhan && !dsTienIch.includes("tuCaNhan")) {
            return false;
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-[#F7F9FB] text-[#191C1E] font-sans pb-24">
            {/* Top App Bar chuẩn 100% hình ảnh mobile MH_tim_kiem_phong.png */}
            <header className="bg-white border-b border-[#E0E3E5] h-14 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <button className="text-[#00236F] active:scale-95 transition-transform flex items-center">
                        <span className="material-symbols-outlined text-[26px]">menu</span>
                    </button>
                    <h1 className="text-[#00236F] font-bold text-[20px] tracking-tight">FIT 4.0</h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Nút Phòng quan tâm hiển thị trên Desktop hoặc khi có danh sách */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="hidden md:flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-[#DCE1FF] border border-[#00236F] text-[#00236F] font-semibold text-[13px] transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                        <span>Phòng quan tâm</span>
                        {danhSachQuanTam.length > 0 && (
                            <span className="bg-[#EF4444] text-white rounded-full px-1.5 py-0.5 text-[11px] font-bold">
                                {danhSachQuanTam.length}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-2">
                        {currentUser ? (
                            <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-[#EBF5FF] border border-[#BFDBFE] text-[#1E40AF] font-bold text-xs cursor-pointer" onClick={handleLogout} title="Nhấn để đăng xuất">
                                <span className="material-symbols-outlined text-[18px]">person</span>
                                <span>{currentUser.user?.username || currentUser.username || currentUser.hoten || currentUser.email || "Guest"}</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-[#00236F] text-white font-bold text-[13px] hover:bg-[#00184D] transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[18px]">login</span>
                                <span>Đăng nhập</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <main className="pt-20 px-4 sm:px-6 lg:px-12 w-full max-w-[1800px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* CỘT TRÁI TRÊN PC / TRÊN CÙNG MOBILE: BỘ LỌC TÌM KIẾM */}
                    <div className="lg:col-span-4 lg:sticky lg:top-20">
                        <div className="mt-2 mb-4">
                            <h2 className="text-[#00236F] font-bold text-[24px] leading-tight">Tìm kiếm phòng</h2>
                            <p className="text-[#54647A] text-[13px] mt-0.5">Khám phá không gian sống phù hợp nhất</p>
                        </div>

                        {/* Filter Section chuẩn chi tiết MH_tim_kiem_phong.png */}
                        <section className="bg-white rounded-3xl p-5 border border-[#E0E3E5] shadow-sm flex flex-col gap-5">
                            {/* Loại phòng */}
                            <div>
                                <label className="text-[#444651] font-semibold text-[13px] mb-2.5 block">
                                    Loại phòng (Số người)
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[2, 4, 6, 8].map(cap => {
                                        const isActive = selectedCapacity === cap;
                                        return (
                                            <button
                                                key={cap}
                                                onClick={() => setSelectedCapacity(isActive ? null : cap)}
                                                className={
                                                    isActive
                                                        ? "py-2.5 px-1 rounded-xl border-2 border-[#00236F] bg-[#DCE1FF] text-[#00236F] font-bold text-[13px] transition-all active:scale-95 text-center"
                                                        : "py-2.5 px-1 rounded-xl border border-[#C5C5D3] bg-white text-[#444651] font-medium text-[13px] transition-all active:scale-95 text-center hover:bg-[#F7F9FB]"
                                                }
                                            >
                                                {cap} người
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Khoảng giá */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-[#444651] font-semibold text-[13px]">Khoảng giá tối đa</label>
                                    <span className="text-[#00236F] font-bold text-[14px]">
                                        {(slGiaTien / 1000000).toFixed(1)}M VNĐ
                                    </span>
                                </div>
                                <div className="px-1 py-1">
                                    <input
                                        className="w-full accent-[#00236F] h-2 bg-[#DCE1FF] rounded-lg cursor-pointer"
                                        max="10000000"
                                        min="1500000"
                                        step="500000"
                                        type="range"
                                        value={slGiaTien}
                                        onChange={(e) => setSlGiaTien(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            {/* Tiện ích */}
                            <div>
                                <label className="text-[#444651] font-semibold text-[13px] mb-2.5 block">
                                    Tiện ích đi kèm
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setAmenities({ ...amenities, wifi: !amenities.wifi })}
                                        className={
                                            amenities.wifi
                                                ? "flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#DCE1FF] border-2 border-[#00236F] text-[#00236F] text-[12px] font-bold transition-all"
                                                : "flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F2F4F6] border border-[#E0E3E5] text-[#444651] text-[12px] font-medium transition-all hover:bg-[#EAECEE]"
                                        }
                                    >
                                        <span className="material-symbols-outlined text-[17px]">wifi</span>
                                        <span>Wi-Fi tốc độ cao</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setAmenities({ ...amenities, mayLanh: !amenities.mayLanh })}
                                        className={
                                            amenities.mayLanh
                                                ? "flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#DCE1FF] border-2 border-[#00236F] text-[#00236F] text-[12px] font-bold transition-all"
                                                : "flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F2F4F6] border border-[#E0E3E5] text-[#444651] text-[12px] font-medium transition-all hover:bg-[#EAECEE]"
                                        }
                                    >
                                        <span className="material-symbols-outlined text-[17px]">ac_unit</span>
                                        <span>Máy lạnh Inverter</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setAmenities({ ...amenities, tuCaNhan: !amenities.tuCaNhan })}
                                        className={
                                            amenities.tuCaNhan
                                                ? "flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#DCE1FF] border-2 border-[#00236F] text-[#00236F] text-[12px] font-bold transition-all"
                                                : "flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F2F4F6] border border-[#E0E3E5] text-[#444651] text-[12px] font-medium transition-all hover:bg-[#EAECEE]"
                                        }
                                    >
                                        <span className="material-symbols-outlined text-[17px]">lock</span>
                                        <span>Tủ khóa riêng</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* CỘT PHẢI TRÊN PC / PHẦN DƯỚI MOBILE: DANH SÁCH PHÒNG */}
                    <div className="lg:col-span-8">
                        {/* Results Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-[#00236F] font-bold text-[18px]">
                                Danh sách phòng có sẵn ({filteredRooms.length})
                            </h3>
                            <button className="flex items-center gap-1 text-[#00236F] font-bold text-[13px] bg-white px-3.5 py-1.5 rounded-xl border border-[#E0E3E5] shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">sort</span>
                                <span>Mới nhất</span>
                            </button>
                        </div>

                        {/* Room List / Grid - 2 cột trên PC, 1 cột trên mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {filteredRooms.map((phong: any) => {
                                const isWishlisted = danhSachQuanTam.some((p: any) => p.maphong === phong.maphong);
                                const badgeText = phong.trangthai || "Còn trống";
                                const isWarningBadge = badgeText === "Sắp hết" || phong.badgeColor === "warning";

                                return (
                                    <div
                                        key={phong.maphong}
                                        className="bg-white rounded-2xl overflow-hidden border border-[#E0E3E5] shadow-sm flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Room Image */}
                                            <div
                                                className="relative h-48 w-full bg-[#ECEEF0] cursor-pointer"
                                                onClick={() => navigate(`/phong/${phong.maphong}`, { state: { room: phong } })}
                                            >
                                                <img
                                                    alt={phong.tenphong}
                                                    className="w-full h-full object-cover"
                                                    src={phong.hinhanh || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"}
                                                />
                                                <div className="absolute top-3 right-3">
                                                    <span
                                                        className={
                                                            isWarningBadge
                                                                ? "bg-[#D97706]/90 text-white font-medium text-[11px] px-3 py-1 rounded-full shadow-sm"
                                                                : "bg-[#10B981]/90 text-white font-medium text-[11px] px-3 py-1 rounded-full shadow-sm"
                                                        }
                                                    >
                                                        {badgeText}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="p-4 flex flex-col gap-2.5">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4
                                                            className="text-[#00236F] font-bold text-[16px] leading-tight cursor-pointer hover:underline"
                                                            onClick={() => navigate(`/phong/${phong.maphong}`, { state: { room: phong } })}
                                                        >
                                                            {phong.tenphong}
                                                        </h4>
                                                        <p className="text-[#54647A] text-[12px] mt-0.5">
                                                            {phong.chinhanh || "Tòa A • Tầng 1"}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[#00236F] font-bold text-[17px]">
                                                            {(Number(phong.giatien) / 1000000).toFixed(1)}M
                                                        </p>
                                                        <p className="text-[#54647A] text-[9px] uppercase font-medium tracking-wider">
                                                            VNĐ / THÁNG
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-[#54647A] text-[12px]">
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[17px]">group</span>
                                                        <span>{phong.succhua || 4} người</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[17px]">square_foot</span>
                                                        <span>{phong.dientich || 25}m²</span>
                                                    </div>
                                                </div>

                                                {/* Hiển thị tiện ích có sẵn của phòng */}
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {phong.tienich?.includes("wifi") && (
                                                        <span className="inline-flex items-center gap-1 bg-[#D0E1FB]/50 text-[#00236F] px-2 py-0.5 rounded-lg text-[11px] font-semibold">
                                                            <span className="material-symbols-outlined text-[13px]">wifi</span> Wi-Fi
                                                        </span>
                                                    )}
                                                    {phong.tienich?.includes("mayLanh") && (
                                                        <span className="inline-flex items-center gap-1 bg-[#D0E1FB]/50 text-[#00236F] px-2 py-0.5 rounded-lg text-[11px] font-semibold">
                                                            <span className="material-symbols-outlined text-[13px]">ac_unit</span> Máy lạnh
                                                        </span>
                                                    )}
                                                    {phong.tienich?.includes("tuCaNhan") && (
                                                        <span className="inline-flex items-center gap-1 bg-[#D0E1FB]/50 text-[#00236F] px-2 py-0.5 rounded-lg text-[11px] font-semibold">
                                                            <span className="material-symbols-outlined text-[13px]">lock</span> Tủ cá nhân
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons chuẩn 100% hình ảnh */}
                                        <div className="p-4 pt-0 flex gap-2.5">
                                            <button
                                                onClick={() => {
                                                    setSelectedDepositRoom(phong);
                                                    setSoGiuongDeposit(1);
                                                }}
                                                className="flex-1 bg-[#00236F] hover:bg-[#1E3A8A] text-white font-semibold text-[13px] py-2.5 rounded-xl transition-all active:scale-95"
                                            >
                                                Đặt cọc
                                            </button>
                                            <button
                                                onClick={() => btn_henXemPhong(phong)}
                                                className={
                                                    isWishlisted
                                                        ? "flex-1 bg-[#D0E1FB] border border-[#00236F] text-[#00236F] font-semibold text-[13px] py-2.5 rounded-xl transition-all active:scale-95"
                                                        : "flex-1 bg-white border border-[#00236F] text-[#00236F] hover:bg-[#F7F9FB] font-semibold text-[13px] py-2.5 rounded-xl transition-all active:scale-95"
                                                }
                                            >
                                                {isWishlisted ? "Đã quan tâm" : "Hẹn xem phòng"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Wishlist Button cho Mobile khi có phòng trong danh sách */}
            {danhSachQuanTam.length > 0 && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="md:hidden fixed bottom-20 right-4 bg-[#00236F] text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 z-40 active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-[20px] text-[#FFB4AB]">favorite</span>
                    <span className="text-xs font-semibold">Phòng quan tâm ({danhSachQuanTam.length})</span>
                </button>
            )}

            {/* Bottom Navigation Bar luôn hiển thị ở dưới cùng */}
            <BottomNav />

            {/* Modal Danh Sách Phòng Quan Tâm */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#E0E3E5]">
                        <div className="p-5 border-b border-[#E0E3E5] flex justify-between items-center bg-[#F7F9FB]">
                            <div>
                                <h2 className="font-bold text-[19px] text-[#00236F]">Danh Sách Phòng Quan Tâm</h2>
                                <p className="text-[12px] text-[#54647A] mt-0.5">
                                    {danhSachQuanTam.length} phòng đã được bạn chọn
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-9 h-9 rounded-full bg-white border border-[#E0E3E5] flex items-center justify-center text-[#54647A] hover:text-[#00236F] hover:bg-gray-100 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {danhSachQuanTam.length === 0 ? (
                                <div className="text-center py-12 text-[#54647A] text-[14px]">
                                    <span className="material-symbols-outlined text-[48px] text-[#C5C5D3] block mb-2 mx-auto">heart_broken</span>
                                    Danh sách quan tâm của bạn đang trống. Hãy bấm nút "Hẹn xem phòng" trên thẻ phòng để lưu nhé!
                                </div>
                            ) : (
                                /* Lưới responsive: 2 cột rộng rãi trên PC, 1 cột trên Mobile */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {danhSachQuanTam.map(phong => (
                                        <div
                                            key={phong.maphong}
                                            className="flex items-center justify-between p-3.5 bg-white hover:bg-[#F7F9FB] rounded-2xl border border-[#E0E3E5] shadow-sm transition-all"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                {/* Thumbnail ảnh phòng */}
                                                <div className="w-16 h-16 rounded-xl bg-[#ECEEF0] overflow-hidden shrink-0 border border-[#E0E3E5]">
                                                    <img
                                                        src={phong.hinhanh || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80"}
                                                        alt={phong.tenphong}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[15px] text-[#00236F]">{phong.tenphong}</h4>
                                                    <p className="text-[12px] text-[#54647A]">{phong.chinhanh}</p>
                                                    <p className="text-[14px] font-bold text-[#00236F] mt-0.5">
                                                        {Number(phong.giatien).toLocaleString()}đ<span className="text-[11px] font-normal text-[#54647A]">/tháng</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => btn_xoaQuanTam(phong.maphong)}
                                                className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-[#EF4444] flex items-center justify-center transition-colors shrink-0"
                                                title="Xóa khỏi danh sách quan tâm"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {danhSachQuanTam.length > 0 && (
                            <div className="p-5 border-t border-[#E0E3E5] bg-[#F7F9FB] flex justify-end gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="py-2.5 px-6 bg-white border border-[#C5C5D3] hover:bg-gray-50 text-[#191C1E] font-semibold text-[13px] rounded-xl transition-colors"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={btn_chuyenDenDatLich}
                                    className="py-2.5 px-6 bg-[#00236F] hover:bg-[#1E3A8A] text-white font-semibold text-[13px] rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <span>Đăng ký Lịch Hẹn ({danhSachQuanTam.length} phòng)</span>
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={(user) => {
                    setCurrentUser(user);
                    if (selectedDepositRoom) {
                        btn_submitDeposit();
                    }
                }}
            />

            {/* Modal Xác nhận Đặt cọc */}
            {selectedDepositRoom && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-[90vw] max-w-[500px] flex flex-col shadow-2xl overflow-hidden border border-[#E0E3E5]">
                        <div className="p-5 border-b border-[#E0E3E5] flex justify-between items-center bg-[#F7F9FB]">
                            <h2 className="font-bold text-[19px] text-[#00236F] flex items-center gap-2">
                                <span className="material-symbols-outlined">edit_note</span>
                                Xác nhận đặt cọc
                            </h2>
                            <button
                                onClick={() => setSelectedDepositRoom(null)}
                                className="w-9 h-9 rounded-full bg-white border border-[#E0E3E5] flex items-center justify-center text-[#54647A] hover:text-[#00236F] hover:bg-gray-100 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="text-[18px] font-bold text-[#191C1E] mb-2">{selectedDepositRoom.tenphong || selectedDepositRoom.TenPhong}</h3>
                            <p className="text-[13px] text-[#54647A] mb-4">Chi nhánh: {selectedDepositRoom.chinhanh}</p>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-[13px] font-semibold text-[#444651] mb-2">Số giường muốn thuê</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSoGiuongDeposit(Math.max(1, soGiuongDeposit - 1))}
                                            className="w-10 h-10 rounded-xl border border-[#C5C5D3] flex items-center justify-center hover:bg-gray-50 transition-colors text-[#54647A]"
                                            disabled={soGiuongDeposit <= 1}
                                        >
                                            <span className="material-symbols-outlined">remove</span>
                                        </button>
                                        <span className="text-[20px] font-bold text-[#00236F] w-12 text-center">{soGiuongDeposit}</span>
                                        <button
                                            onClick={() => {
                                                // TODO: Thay bằng số giường trống thực tế của phòng, tạm thời hardcode là 4
                                                const maxBeds = 4;
                                                setSoGiuongDeposit(Math.min(maxBeds, soGiuongDeposit + 1));
                                            }}
                                            className="w-10 h-10 rounded-xl border border-[#C5C5D3] flex items-center justify-center hover:bg-gray-50 transition-colors text-[#54647A]"
                                            disabled={soGiuongDeposit >= 4} // Giả định max là 4
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                        </button>
                                        <span className="text-[12px] text-[#54647A] ml-2">(Tối đa 4 giường)</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-[#F7F9FB] rounded-xl border border-[#E0E3E5] flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-[#54647A]">Giá thuê/giường/tháng</span>
                                        <span className="font-semibold text-[#191C1E]">
                                            {Number(selectedDepositRoom.giatien).toLocaleString()} đ
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[15px] pt-2 border-t border-[#E0E3E5]">
                                        <span className="font-bold text-[#444651]">Tiền cọc (2 tháng)</span>
                                        <span className="font-bold text-[#EF4444] text-[18px]">
                                            {Number(selectedDepositRoom.giatien * 2 * soGiuongDeposit).toLocaleString()} đ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-[#E0E3E5] bg-[#F7F9FB] flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedDepositRoom(null)}
                                className="py-2.5 px-6 bg-white border border-[#C5C5D3] hover:bg-gray-50 text-[#191C1E] font-semibold text-[13px] rounded-xl transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={btn_submitDeposit}
                                disabled={isSubmittingDeposit}
                                className="py-2.5 px-6 bg-[#00236F] hover:bg-[#1E3A8A] text-white font-semibold text-[13px] rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmittingDeposit ? (
                                    <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Đang xử lý...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[18px]">lock</span> Xác nhận đặt cọc</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
