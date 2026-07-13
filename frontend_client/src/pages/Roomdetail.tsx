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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>

            {/*  Top App Bar  */}
            <header
                className="fixed top-0 w-full z-50 bg-surface shadow-sm border-b border-outline-variant h-14 flex items-center px-margin-mobile justify-between">
                <div className="flex items-center gap-4">
                    <button aria-label="Quay lại" onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-surface-container active:opacity-80 transition-all">
                        <span className="material-symbols-outlined text-primary">arrow_back</span>
                    </button>
                    <h1 className="font-headline-sm text-headline-sm text-on-surface truncate">{roomName}</h1>
                </div>
                <button className="p-2 rounded-full hover:bg-surface-container active:opacity-80 transition-all">
                    <span className="material-symbols-outlined text-primary">share</span>
                </button>
            </header>
            <main className="pt-14 pb-32">
                {/*  Image Gallery Hero  */}
                <section className="relative">
                    <div className="w-full aspect-[4/3] bg-surface-container overflow-hidden">
                        <img alt={roomName} className="w-full h-full object-cover"
                            src={roomImage} />
                    </div>
                </section>
                {/*  Main Info  */}
                <section className="px-margin-mobile mt-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-baseline">
                            <div className="flex flex-col">
                                <span className="text-primary font-headline-lg-mobile text-headline-lg-mobile">
                                    {(Number(roomPrice) / 1000000).toFixed(1)}M VNĐ{' '}
                                    <span className="text-body-md font-normal text-on-surface-variant">/ tháng</span>
                                </span>
                            </div>
                            <div className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-success"></span>
                                {room?.status || "Còn trống"}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant font-body-md text-body-md">
                            <span className="material-symbols-outlined text-sm">apartment</span>
                            Vị trí: {roomBranch}
                        </div>
                    </div>
                </section>
                {/*  Description  */}
                <section className="px-margin-mobile mt-xl">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Mô tả chi tiết</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                        Phòng được thiết kế hiện đại, đầy đủ ánh sáng tự nhiên. Phù hợp cho sinh viên và người đi làm trẻ cần
                        không gian yên tĩnh và tiện nghi.
                    </p>
                </section>
                {/*  Amenities Grid  */}
                <section className="px-margin-mobile mt-xl">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">Tiện nghi &amp; Dịch vụ</h2>
                    <div className="grid grid-cols-1 gap-sm">
                        {/*  Amenity Item  */}
                        <div
                            className="flex items-start p-md bg-white rounded-xl border border-border-subtle shadow-sm hover:border-primary-fixed-dim transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center mr-md">
                                <span className="material-symbols-outlined text-primary">wifi</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-label-md text-label-md text-on-surface">Wi-Fi</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">Tốc độ cao</span>
                            </div>
                        </div>
                        <div
                            className="flex items-start p-md bg-white rounded-xl border border-border-subtle shadow-sm hover:border-primary-fixed-dim transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center mr-md">
                                <span className="material-symbols-outlined text-primary">ac_unit</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-label-md text-label-md text-on-surface">Máy lạnh</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">Inverter tiết kiệm điện</span>
                            </div>
                        </div>
                        <div
                            className="flex items-start p-md bg-white rounded-xl border border-border-subtle shadow-sm hover:border-primary-fixed-dim transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center mr-md">
                                <span className="material-symbols-outlined text-primary">lock</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-label-md text-label-md text-on-surface">Tủ cá nhân</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">Khóa từ</span>
                            </div>
                        </div>
                        <div
                            className="flex items-start p-md bg-white rounded-xl border border-border-subtle shadow-sm hover:border-primary-fixed-dim transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center mr-md">
                                <span className="material-symbols-outlined text-primary">bed</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-label-md text-label-md text-on-surface">Giường tầng</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">Nệm cao su êm ái</span>
                            </div>
                        </div>
                        <div
                            className="flex items-start p-md bg-white rounded-xl border border-border-subtle shadow-sm hover:border-primary-fixed-dim transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center mr-md">
                                <span className="material-symbols-outlined text-primary">cleaning_services</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-label-md text-label-md text-on-surface">Dịch vụ dọn phòng</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">2 lần/tuần</span>
                            </div>
                        </div>
                        <div
                            className="flex items-start p-md bg-white rounded-xl border border-border-subtle shadow-sm hover:border-primary-fixed-dim transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center mr-md">
                                <span className="material-symbols-outlined text-primary">soup_kitchen</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-label-md text-label-md text-on-surface">Khu vực bếp chung</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">Đầy đủ dụng cụ</span>
                            </div>
                        </div>
                        <div
                            className="flex items-start p-md bg-white rounded-xl border border-border-subtle shadow-sm hover:border-primary-fixed-dim transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center mr-md">
                                <span className="material-symbols-outlined text-primary">local_parking</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-label-md text-label-md text-on-surface">Bãi đậu xe</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">An ninh 24/7</span>
                            </div>
                        </div>
                    </div>
                </section>
                {/*  Shared Facilities  */}
                <section className="px-margin-mobile mt-xl pb-10">
                    <div className="bg-surface-container-low p-lg rounded-xl border-l-4 border-primary">
                        <h3 className="font-label-md text-label-md text-primary mb-sm">Tiện ích chung tòa nhà</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Khu vực sinh hoạt chung, Máy giặt sấy tự động, Hệ thống PCCC hiện đại.
                        </p>
                    </div>
                </section>
            </main>
            {/*  Footer Action Buttons  */}
            <footer
                className="fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant p-margin-mobile flex gap-md shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => navigate('/dat-lich-hen', { state: { selectedRooms: room ? [room] : [] } })}
                    className="flex-1 py-3 px-4 border border-primary text-primary font-label-md text-label-md rounded-xl hover:bg-surface-container transition-colors active:scale-95">
                    Hẹn xem phòng
                </button>
                <button
                    onClick={() => alert(`Đã bấm đặt cọc cho ${roomName}`)}
                    className="flex-[1.5] py-3 px-4 bg-primary text-on-primary font-label-md text-label-md rounded-xl shadow-md hover:bg-opacity-90 transition-all active:scale-95">
                    Đặt cọc ngay
                </button>
            </footer>
            {/*  Interactive Layer: Simple Scroll Indicator  */}


        </>
    );
};

export default Roomdetail;
