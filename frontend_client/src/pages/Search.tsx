import React from 'react';

const Search = () => {
  return (
    <>
      
    {/*  Top App Bar  */}
    <header
        className="bg-surface-container-lowest dark:bg-inverse-surface shadow-sm shadow-[0px_2px_4px_rgba(30,58,138,0.05)] flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full fixed top-0 z-50">
        <div className="flex items-center gap-4">
            <button className="transition-all duration-200 active:scale-95 text-primary dark:text-inverse-primary">
                <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary">FIT 4.0</h1>
        </div>
        <div className="h-10 w-10 rounded-full bg-surface-variant overflow-hidden">
            <span
                className="material-symbols-outlined text-on-surface-variant flex items-center justify-center w-full h-full"
                style={{}}>account_circle</span>
        </div>
    </header>
    <main className="pt-20 pb-24 px-margin-mobile">
        <div className="flex flex-col gap-6">
            {/*  Search Title  */}
            <div className="flex flex-col gap-1">
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">Tìm kiếm phòng</h2>
                <p className="text-on-surface-variant font-body-sm">Tìm kiếm không gian sống tối ưu cho bạn</p>
            </div>
            {/*  Advanced Filters Section  */}
            <section
                className="bg-surface-container-lowest rounded-xl p-4 shadow-[0px_2px_4px_rgba(30,58,138,0.05)] border border-outline-variant flex flex-col gap-5">
                {/*  Capacity Filter  */}
                <div className="flex flex-col gap-3">
                    <label className="font-label-md text-label-md text-on-surface-variant">Loại phòng (Số người)</label>
                    <div className="flex justify-between gap-2">
                        <button
                            className="flex-1 py-2 px-1 rounded-lg border font-label-md transition-all active:scale-95 border-outline-variant text-on-surface-variant">2
                            người</button>
                        <button
                            className="flex-1 py-2 px-1 rounded-lg border font-label-md transition-all active:scale-95 hover:bg-surface-variant bg-primary-fixed border-primary text-primary">4
                            người</button>
                        <button
                            className="flex-1 py-2 px-1 rounded-lg border border-outline-variant text-on-surface-variant font-label-md transition-all active:scale-95 hover:bg-surface-variant">6
                            người</button>
                        <button
                            className="flex-1 py-2 px-1 rounded-lg border border-outline-variant text-on-surface-variant font-label-md transition-all active:scale-95 hover:bg-surface-variant">8
                            người</button>
                    </div>
                </div>
                {/*  Price Range Filter  */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <label className="font-label-md text-label-md text-on-surface-variant">Khoảng giá</label>
                        <span className="text-primary font-label-md">1.5M - 5.0M VNĐ</span>
                    </div>
                    <div className="px-2">
                        <input className="w-full" max="10000000" min="1000000" step="500000" type="range" value="4500000" />
                    </div>
                </div>
                {/*  Amenities Filter  */}
                <div className="flex flex-col gap-3">
                    <label className="font-label-md text-label-md text-on-surface-variant">Tiện ích</label>
                    <div className="flex flex-wrap gap-2">
                        <label
                            className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full cursor-pointer border border-transparent transition-all active:scale-95 has-[:checked]:border-primary has-[:checked]:bg-primary-fixed">
                            <input checked="" className="hidden" type="checkbox" />
                            <span className="material-symbols-outlined text-[18px]">wifi</span>
                            <span className="font-label-sm text-label-sm">Wi-Fi</span>
                        </label>
                        <label
                            className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full cursor-pointer border border-transparent transition-all active:scale-95 has-[:checked]:border-primary has-[:checked]:bg-primary-fixed">
                            <input checked="" className="hidden" type="checkbox" />
                            <span className="material-symbols-outlined text-[18px]">ac_unit</span>
                            <span className="font-label-sm text-label-sm">Máy lạnh</span>
                        </label>
                        <label
                            className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full cursor-pointer border border-transparent transition-all active:scale-95 has-[:checked]:border-primary has-[:checked]:bg-primary-fixed">
                            <input className="hidden" type="checkbox" />
                            <span className="material-symbols-outlined text-[18px]">lock</span>
                            <span className="font-label-sm text-label-sm">Tủ cá nhân</span>
                        </label>
                    </div>
                </div>
            </section>
            {/*  Results Section  */}
            <div className="flex flex-col gap-4" id="results-container">
                <div className="flex justify-between items-center">
                    <h3 className="font-headline-sm text-headline-sm text-primary">Kết quả (3)</h3>
                    <button className="text-primary font-label-md flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">sort</span>
                        Mới nhất
                    </button>
                </div>
                {/*  Room Card 1  */}
                <div
                    className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_2px_4px_rgba(30,58,138,0.05)] border border-outline-variant transition-transform active:scale-[0.98]">
                    <div className="relative h-48">
                        <img alt="Room A101" className="w-full h-full object-cover"
                            data-alt="A modern and clean shared dormitory room featuring minimalist wooden bunk beds, crisp white linens, and large windows allowing natural sunlight to flood the space. The room is decorated in a contemporary corporate aesthetic with subtle blue accents and polished light-wood floors. The mood is professional, airy, and highly organized, reflecting a premium living environment."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY6e0N1ZZN8qljnkH8awCRYxjSLma9CQuRrOH5Pp4oX43Cwl-UXIOnk_Wi2jo2938KrXAv2kxMzKQrRyCguT1dCFBKqZgS0SwtVYG82qBzaC9ODQqIDlloStz1nMwDooNz9cxjM7YTQUnCKM3R3x0S16Aq6D_hkYw8JVYLVbDhWUid1LuN5umbz1PLBY6V6Eo_MhgjjjU-WC4t72ZesDQ29V0TNN9b8DP1Ted_s4rMROdRDu0w5uBIN5KVgqA8PT4rhK3v6L5yKi2t" />
                        <div className="absolute top-3 right-3">
                            <span
                                className="bg-success/10 text-success font-label-sm px-3 py-1 rounded-full backdrop-blur-md border border-success/20">Còn
                                trống</span>
                        </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-headline-sm text-headline-sm text-primary">Phòng A.101</h4>
                                <p className="text-on-surface-variant font-body-sm">Tòa A • Tầng 1</p>
                            </div>
                            <div className="text-right">
                                <p className="text-primary font-headline-sm">2.5M</p>
                                <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">VNĐ / THÁNG</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-on-surface-variant">
                                <span className="material-symbols-outlined text-[18px]">group</span>
                                <span className="text-label-sm">4 người</span>
                            </div>
                            <div className="flex items-center gap-1 text-on-surface-variant">
                                <span className="material-symbols-outlined text-[18px]">square_foot</span>
                                <span className="text-label-sm">25m²</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                className="flex-1 bg-primary text-on-primary font-label-md py-2 rounded-lg transition-all active:scale-95">Đặt
                                cọc</button>
                            <button
                                className="flex-1 border border-primary text-primary font-label-md py-2 rounded-lg transition-all active:scale-95">Hẹn
                                xem phòng</button>
                        </div>
                    </div>
                </div>
                {/*  Room Card 2  */}
                <div
                    className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_2px_4px_rgba(30,58,138,0.05)] border border-outline-variant transition-transform active:scale-[0.98]">
                    <div className="relative h-48">
                        <img alt="Block B Room" className="w-full h-full object-cover"
                            data-alt="A sophisticated private studio room designed for corporate housing, featuring a sleek desk setup, ergonomic chair, and high-quality gray upholstered bed. The lighting is warm and directional, highlighting the clean lines and premium textures of the space. The color palette is dominated by professional grays, deep blues, and warm whites, creating a focused yet comfortable atmosphere for a modern professional."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAinGOWlp9BTFe3UFMgnIsz7Vo3LSH0-fzZ44sHoklOeU99N9GViNifD0OR8yxl3hwRuIKsxeNGdDCaPtpHnQvWtsxrE6iyCrrxZ9BSMZ1vmHCobcs3S_4DyfNwdO7uwhlyPGHaVj3b5oa8btD5fy5zkANfQiFbzWNMOYYIv5IcVFJvACmpCQgJJzoOXFLPzT3VrNMvEE4BwyZ1_VufYlr9NBUlh9I4zeBsAmQjIdJzSOqBLLXFxAyRQA7-a8jx2zzlfluTzTraE9XJ" />
                        <div className="absolute top-3 right-3">
                            <span
                                className="bg-warning/10 text-warning font-label-sm px-3 py-1 rounded-full backdrop-blur-md border border-warning/20">Sắp
                                hết</span>
                        </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-headline-sm text-headline-sm text-primary">Phòng B.305</h4>
                                <p className="text-on-surface-variant font-body-sm">Block B • Tầng 3</p>
                            </div>
                            <div className="text-right">
                                <p className="text-primary font-headline-sm">3.8M</p>
                                <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">VNĐ / THÁNG</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-on-surface-variant">
                                <span className="material-symbols-outlined text-[18px]">group</span>
                                <span className="text-label-sm">2 người</span>
                            </div>
                            <div className="flex items-center gap-1 text-on-surface-variant">
                                <span className="material-symbols-outlined text-[18px]">square_foot</span>
                                <span className="text-label-sm">18m²</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                className="flex-1 bg-primary text-on-primary font-label-md py-2 rounded-lg transition-all active:scale-95">Đặt
                                cọc</button>
                            <button
                                className="flex-1 border border-primary text-primary font-label-md py-2 rounded-lg transition-all active:scale-95">Hẹn
                                xem phòng</button>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Empty State (Hidden by default, shown via JS toggle)  */}
            <div className="hidden flex flex-col items-center justify-center py-16 px-8 text-center gap-4" id="empty-state">
                <div
                    className="bg-surface-container h-24 w-24 rounded-full flex items-center justify-center text-outline mb-2">
                    <span className="material-symbols-outlined text-[48px]">search_off</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface">Không tìm thấy phòng</h4>
                <p className="text-on-surface-variant font-body-md">Rất tiếc, đã hết phòng phù hợp với tiêu chí của bạn. Vui
                    lòng thử thay đổi bộ lọc.</p>
                <button
                    className="mt-4 px-8 py-3 bg-primary text-on-primary font-label-md rounded-full shadow-lg transition-all active:scale-95"
                    onClick={() => {}}>Xóa bộ lọc</button>
            </div>
        </div>
    </main>
    {/*  Bottom Navigation Bar  */}
    <nav
        className="fixed bottom-0 w-full z-50 flex justify-around items-center h-16 px-2 pb-safe md:hidden bg-surface-container-lowest dark:bg-inverse-surface shadow-[0px_-2px_4px_rgba(30,58,138,0.05)] border-t border-outline-variant dark:border-outline">
        <div
            className="flex flex-col items-center justify-center bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-full px-4 py-1 transition-transform duration-150 active:scale-90">
            <span className="material-symbols-outlined" style={{}}>home_work</span>
            <span className="font-label-sm text-label-sm">Tìm kiếm</span>
        </div>
        <div
            className="flex flex-col items-center justify-center text-on-secondary-container dark:text-on-secondary-fixed-variant transition-transform duration-150 active:scale-90 hover:bg-surface-container-high rounded-lg p-2">
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="font-label-sm text-label-sm">Lịch hẹn</span>
        </div>

        <div
            className="flex flex-col items-center justify-center text-on-secondary-container dark:text-on-secondary-fixed-variant transition-transform duration-150 active:scale-90 hover:bg-surface-container-high rounded-lg p-2">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-sm text-label-sm">Cá nhân</span>
        </div>
    </nav>
    





    </>
  );
};

export default Search;
