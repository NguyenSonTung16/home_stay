import React from 'react';

const Roomdetail = () => {
  return (
    <>
      
    {/*  Top App Bar  */}
    <header
        className="fixed top-0 w-full z-50 bg-surface shadow-sm border-b border-outline-variant h-14 flex items-center px-margin-mobile justify-between">
        <div className="flex items-center gap-4">
            <button aria-label="Quay lại"
                className="p-2 -ml-2 rounded-full hover:bg-surface-container active:opacity-80 transition-all">
                <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <h1 className="font-headline-sm text-headline-sm text-on-surface truncate">Phòng 4 người - Cao cấp</h1>
        </div>
        <button className="p-2 rounded-full hover:bg-surface-container active:opacity-80 transition-all">
            <span className="material-symbols-outlined text-primary">share</span>
        </button>
    </header>
    <main className="pt-14 pb-32">
        {/*  Image Gallery Hero  */}
        <section className="relative">
            <div className="w-full aspect-[4/3] bg-surface-container overflow-hidden">
                <img alt="Phòng ngủ cao cấp" className="w-full h-full object-cover"
                    data-alt="A professionally photographed interior of a modern dormitory room with white walls and sleek furniture. The room features a bunk bed with clean grey linens and a large window letting in bright, soft natural light. The overall aesthetic is clean and corporate with a palette of deep blues and neutral grays, reflecting a high-efficiency living environment for students."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA56wTxeaDwoV4hphGCAobuBPBGMz15TV8sqrs23Iootl2c2REQK3gh2Gyxqbt7NcNQ_qle03YUR-Gn5BhuzjJRM2hupvo8LL6G1RghfLVB2Y_wHJ8818rSHBnELZOC-B0Ero4BL41IXqElpnFUya7HSUap1fl4H8voJyx2eDycgBow7ZOSq3HlE9leUHMOEUGY2MRa0zB-DfBz5LoSzFMPDjEiJGJosgTUnhlKevB8xIMBp0jpuTyV9l8Ae6-XN21x88-3acBFkZmf" />
            </div>
            {/*  Thumbnails  */}
            <div className="flex gap-2 px-margin-mobile -mt-12 relative z-10 overflow-x-auto hide-scrollbar pb-4">
                <div className="flex-shrink-0 w-24 h-24 rounded-xl border-2 border-primary overflow-hidden shadow-lg">
                    <img alt="Góc phòng" className="w-full h-full object-cover"
                        data-alt="A close-up shot of a modern bunk bed ladder and smooth wooden frame in a bright dormitory room. The lighting is warm and inviting, highlighting the high-quality materials and professional finish of the furniture. The background shows soft-focused modern wall art."
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDutl6lG0DeQW2ISj489MgZQK1zS86ap3q-Mi76flZVl3du-GYQALI0ZvDQHUxAvh4cjdNOeLc23woHqeWwQG_3dqNh4rFLS2VyqFQ1h6Y12OZHCZXtuearsi3zesBIzZ-vuvvr669-EhEeTRezr1k7VTPzI-wrmEs-teevB_xB5pQ-me7vFCxLosuA2AkgDbNrDZcmyDdzcNfObEMFYZY_7iCgZzewQEB2SLpA86yGEEcX5trz0f3fn6Q5IiiuFbGTJC17c2F1oX90" />
                </div>
                <div
                    className="flex-shrink-0 w-24 h-24 rounded-xl border-2 border-white overflow-hidden shadow-lg bg-surface">
                    <img alt="Bàn làm việc" className="w-full h-full object-cover"
                        data-alt="A clean, minimalist study desk with a sleek ergonomic chair and a small desk lamp. The setup is organized for high efficiency, with a soft ambient glow from the lamp casting gentle shadows on the white desktop. The wall behind is a neutral light gray."
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnHORDpKe_WgXUNBGKbf-sYPwC36uLu3k4--a9aBwoVouwNpsnpzFBJR6MXDWr8CXLdznvB25WRpqn1iYnbj-M8QwYA9AHKRH581bcTKFh208KDHBXIqP-igko77_3y4gipe4FkDVl9sV0LW9b9v9Q2K-kPhwpTxZlMRw2o-WRik4disabv5KCzA9RdSKCvOEHzeb90_IK55a6yRzlBc5jUMONk0pOJ2Mlusg1ACd4mir7ROV7ul5I7VOblh5WkKyeadE28oyoyBnY" />
                </div>
                <div
                    className="flex-shrink-0 w-24 h-24 rounded-xl border-2 border-white overflow-hidden shadow-lg bg-surface">
                    <img alt="Tủ đồ" className="w-full h-full object-cover"
                        data-alt="A modern storage solution featuring a floor-to-ceiling wooden cabinet with integrated smart locks. The design is systematic and professional, emphasizing security and space optimization in a shared living environment. The lighting is crisp and clear."
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmBUrc6sijPwVDeDwXEJEUWnGC5EuPX1MeDXA7P7Upd3oXHv5qXmi-UqWf8jM4b_xBZlYgFqNPPWIAW9HECIbekjdNXslIyDW9YyvqrFchnEW_bxlZzqyVTF99wrorJfihUeJA7OD9ukgDU0qmQIheuAqQnZThOW4-htO5aQOp3Uid65BAHY1KZHnrigeTz3IHn589Vz5YwQfliHYOgwBCNVVjTtwarRnWQouNwzXvT7bAIS8nFglg3974RCzYCj2cTF5svH2pKJLN" />
                </div>
                <div
                    className="flex-shrink-0 w-24 h-24 rounded-xl border-2 border-white overflow-hidden shadow-lg bg-surface flex items-center justify-center bg-surface-container">
                    <span className="font-label-md text-primary">+5</span>
                </div>
            </div>
        </section>
        {/*  Main Info  */}
        <section className="px-margin-mobile mt-4">
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                    <div className="flex flex-col">
                        <span className="text-primary font-headline-lg-mobile text-headline-lg-mobile">2.2tr <span
                                className="text-body-md font-normal text-on-surface-variant">/ tháng</span></span>
                    </div>
                    <div
                        className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-success"></span>
                        Còn 3 chỗ trống
                    </div>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant font-body-md text-body-md">
                    <span className="material-symbols-outlined text-sm">apartment</span>
                    Vị trí: Tòa A
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
            className="flex-1 py-3 px-4 border border-primary text-primary font-label-md text-label-md rounded-xl hover:bg-surface-container transition-colors active:scale-95">Hẹn
            xem phòng</button>
        <button
            className="flex-[1.5] py-3 px-4 bg-primary text-on-primary font-label-md text-label-md rounded-xl shadow-md hover:bg-opacity-90 transition-all active:scale-95">
            Đặt cọc ngay
        </button>
    </footer>
    {/*  Interactive Layer: Simple Scroll Indicator  */}
    

    </>
  );
};

export default Roomdetail;
