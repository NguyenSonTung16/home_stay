import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatCocModal } from '../components/DatCocModal';

export const MHTimKiemPhong = () => {
    const navigate = useNavigate();

    const [selectedCapacity, setSelectedCapacity] = useState<number | null>(null);
    const [slGiaTien, setSlGiaTien] = useState(10000000);
    const [danhSachPhong, setDanhSachPhong] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Quản lý tiện ích
    const [amenities, setAmenities] = useState({
        wifi: false,
        mayLanh: false,
        tuCaNhan: false
    });

    // Quản lý Danh sách phòng quan tâm (localStorage)
    const [danhSachQuanTam, setDanhSachQuanTam] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Quản lý Modal Đặt cọc
    const [selectedRoomToDeposit, setSelectedRoomToDeposit] = useState<any>(null);


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
                const enrichedData = result.data.map((p: any) => {
                    const fakeTienIch = [];
                    const id = Number(p.MaPhong || p.maphong || 1);
                    if (id % 2 === 0 || id % 3 === 0) fakeTienIch.push("wifi");
                    if (id % 2 !== 0) fakeTienIch.push("mayLanh");
                    if (id % 4 === 0) fakeTienIch.push("tuCaNhan");

                    return {
                        maphong: p.MaPhong || p.maphong,
                        tenphong: p.TenPhong || p.tenphong,
                        chinhanh: p.ChiNhanh || p.chinhanh || "TP. Hồ Chí Minh",
                        giatien: Number(p.GiaTien || p.giatien || 0),
                        succhua: Number(p.SucChua || p.succhua || 0),
                        sogiuongtrong: Number(p.SoGiuongTrong ?? p.sogiuongtrong ?? p.SucChua ?? p.succhua ?? 0),
                        dientich: Number(p.DienTich || p.dientich || 25),
                        trangthai: (p.TrangThai === 1 || p.TrangThai === "Còn trống" || p.trangthai === 1 || p.trangthai === "Còn trống") ? "Còn trống" : "Sắp hết",
                        badgeColor: (p.TrangThai === "Sắp hết" || p.trangthai === "Sắp hết") ? "warning" : "success",
                        tienich: p.TienIch || p.tienich || (fakeTienIch.length > 0 ? fakeTienIch : ["wifi", "mayLanh", "tuCaNhan"]),
                        hinhanh: p.HinhAnh || p.hinhanh || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
                    };
                });
                const availableRooms = enrichedData.filter((p: any) => p.sogiuongtrong > 0);
                setDanhSachPhong(availableRooms);
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
            giatien: p.giatien,
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
                giatien: phong.giatien,
                hinhanh: phong.HinhAnh || phong.hinhanh
            }];
            setDanhSachQuanTam(newList);
            localStorage.setItem("danhSachPhongQuanTam", JSON.stringify(newList));
        } else {
            const newList = danhSachQuanTam.filter((p: any) => (p.maphong || p.MaPhong) !== phongId);
            setDanhSachQuanTam(newList);
            localStorage.setItem("danhSachPhongQuanTam", JSON.stringify(newList));
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

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCapacity, slGiaTien, amenities]);

    const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
    const paginatedRooms = filteredRooms.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="bg-[#F7F9FB] text-[#191C1E] font-sans pb-24">
            {/* Main Container */}
            <div className="px-4 sm:px-6 lg:px-12 w-full max-w-[1800px] mx-auto mt-6">
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
                                        min="0"
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
                        {paginatedRooms.length === 0 ? (
                            <div className="text-center py-20 text-[#54647A] bg-white rounded-3xl border border-[#E0E3E5] shadow-sm">
                                <span className="material-symbols-outlined text-[48px] text-[#C5C5D3] block mb-3 mx-auto">search_off</span>
                                Không tìm thấy phòng phù hợp.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {paginatedRooms.map((phong: any) => {
                            const isWishlisted = danhSachQuanTam.some((p: any) => p.maphong === phong.maphong);
                            const badgeText = phong.trangthai || "Còn trống";
                            const isWarningBadge = badgeText === "Sắp hết" || phong.badgeColor === "warning";

                            return (
                                <div
                                    key={phong.maphong}
                                    onClick={() => navigate(`/phong/${phong.maphong}`, { state: { room: phong } })}
                                    className="bg-white rounded-2xl overflow-hidden border border-[#E0E3E5] shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <div>
                                        {/* Room Image */}
                                        <div className="relative h-48 w-full bg-[#ECEEF0]">
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
                                                    <h4 className="text-[#00236F] font-bold text-[16px] leading-tight">
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
                                            onClick={(e) => { e.stopPropagation(); setSelectedRoomToDeposit(phong); }}
                                            className="flex-1 bg-[#00236F] hover:bg-[#1E3A8A] text-white font-semibold text-[13px] py-2.5 rounded-xl transition-all active:scale-95"
                                        >
                                            Đặt cọc
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); btn_henXemPhong(phong); }}
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
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex justify-center items-center rounded-xl border border-[#C5C5D3] text-[#444651] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-xl font-bold text-[14px] transition-colors ${
                                                currentPage === page 
                                                    ? "bg-[#00236F] text-white" 
                                                    : "text-[#444651] hover:bg-white"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex justify-center items-center rounded-xl border border-[#C5C5D3] text-[#444651] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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

            <DatCocModal 
                isOpen={!!selectedRoomToDeposit} 
                onClose={() => setSelectedRoomToDeposit(null)} 
                roomInfo={selectedRoomToDeposit} 
            />
        </div>
    );
};
