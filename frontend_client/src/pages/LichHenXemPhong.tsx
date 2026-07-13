import React from 'react';

const LichHenXemPhong = () => {
  return (
    <>
      
    {/*  Header Section (Predicted TopAppBar Variant for Sub-page)  */}
    <header
        className="bg-surface-container-lowest flex justify-between items-center px-margin-mobile h-16 w-full fixed top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
            <button className="transition-all duration-200 active:scale-95 text-primary" onClick={() => {}}>
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">Đặt lịch xem nhiều phòng</h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant">
            <span className="material-symbols-outlined w-full h-full flex items-center justify-center text-outline-variant"
                style={{}}>account_circle</span>
        </div>
    </header>
    <main className="mt-20 px-margin-mobile space-y-xl">
        <section className="space-y-sm">
            <div className="flex justify-between items-center">
                <h2 className="font-label-md text-label-md text-on-surface-variant uppercase">Danh sách phòng đã chọn</h2>
                <span className="font-label-sm text-label-sm text-primary">3 phòng</span>
            </div>
            <div className="flex gap-md overflow-x-auto pb-2 hide-scrollbar">
                {/*  Room 1  */}
                <div
                    className="flex-shrink-0 w-64 bg-surface-container-lowest rounded-xl p-sm border border-outline-variant shadow-sm">
                    <div className="flex gap-sm">
                        <img alt="Room" className="w-16 h-16 rounded-lg object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD07A-5Xk05M7Gh2j3F_Zu92E9dWQ5ypBj7bfGS0vWFxYyTPRH7BoEVVlC8QPkUKd2zyjKe23zXR6ccQ0qVTn3lE_5bumU3xwjKs_L7canVTmIbb27ZJF2R7i9QKewIcHVEOyt8nGeiQ2BpMhOCrIVwpod7gkE1fJG5UDakpugVaZbUTQsMXUWf1c9F90PbB1vqXcC_zu2XKgFURYi2CDrcAkesvzHkmasa8WK_deZ7PeOPSt50Q_Wg5ADY7nMtP4uRm8IR8RMr8Fco" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-label-md text-label-md text-primary line-clamp-1">Studio Cao Cấp - T12</h3>
                            <p className="text-[12px] text-on-surface-variant truncate">Quận 1, TP. HCM</p>
                            <p className="font-bold text-primary text-label-md">8.5tr<span
                                    className="text-[10px] font-normal">/tháng</span></p>
                        </div>
                    </div>
                </div>
                {/*  Room 2  */}
                <div
                    className="flex-shrink-0 w-64 bg-surface-container-lowest rounded-xl p-sm border border-outline-variant shadow-sm">
                    <div className="flex gap-sm">
                        <img alt="Room" className="w-16 h-16 rounded-lg object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD07A-5Xk05M7Gh2j3F_Zu92E9dWQ5ypBj7bfGS0vWFxYyTPRH7BoEVVlC8QPkUKd2zyjKe23zXR6ccQ0qVTn3lE_5bumU3xwjKs_L7canVTmIbb27ZJF2R7i9QKewIcHVEOyt8nGeiQ2BpMhOCrIVwpod7gkE1fJG5UDakpugVaZbUTQsMXUWf1c9F90PbB1vqXcC_zu2XKgFURYi2CDrcAkesvzHkmasa8WK_deZ7PeOPSt50Q_Wg5ADY7nMtP4uRm8IR8RMr8Fco" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-label-md text-label-md text-primary line-clamp-1">Căn hộ 1PN - Tầng 5</h3>
                            <p className="text-[12px] text-on-surface-variant truncate">Quận 3, TP. HCM</p>
                            <p className="font-bold text-primary text-label-md">12tr<span
                                    className="text-[10px] font-normal">/tháng</span></p>
                        </div>
                    </div>
                </div>
                {/*  Room 3  */}
                <div
                    className="flex-shrink-0 w-64 bg-surface-container-lowest rounded-xl p-sm border border-outline-variant shadow-sm">
                    <div className="flex gap-sm">
                        <img alt="Room" className="w-16 h-16 rounded-lg object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD07A-5Xk05M7Gh2j3F_Zu92E9dWQ5ypBj7bfGS0vWFxYyTPRH7BoEVVlC8QPkUKd2zyjKe23zXR6ccQ0qVTn3lE_5bumU3xwjKs_L7canVTmIbb27ZJF2R7i9QKewIcHVEOyt8nGeiQ2BpMhOCrIVwpod7gkE1fJG5UDakpugVaZbUTQsMXUWf1c9F90PbB1vqXcC_zu2XKgFURYi2CDrcAkesvzHkmasa8WK_deZ7PeOPSt50Q_Wg5ADY7nMtP4uRm8IR8RMr8Fco" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-label-md text-label-md text-primary line-clamp-1">Studio Ban Công - T8</h3>
                            <p className="text-[12px] text-on-surface-variant truncate">Bình Thạnh, TP. HCM</p>
                            <p className="font-bold text-primary text-label-md">9tr<span
                                    className="text-[10px] font-normal">/tháng</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        {/*  Selected Room Card  */}
        {/*  Date Selection (Calendar View)  */}
        <section className="space-y-sm">
            <div className="flex justify-between items-center">
                <h2 className="font-label-md text-label-md text-on-surface-variant uppercase">Chọn ngày xem phòng</h2>
                <span className="font-label-sm text-label-sm text-primary">Tháng 10, 2023</span>
            </div>
            <div
                className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_2px_4px_rgba(30,58,138,0.05)] border border-outline-variant">
                <div className="calendar-grid text-center font-label-sm text-label-sm text-outline mb-2">
                    <div className="">CN</div>
                    <div className="">T2</div>
                    <div className="">T3</div>
                    <div className="">T4</div>
                    <div className="">T5</div>
                    <div className="">T6</div>
                    <div className="">T7</div>
                </div>
                <div className="calendar-grid gap-y-2">
                    {/*  Placeholder days for Oct 2023 starting Sunday  */}
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-outline font-body-sm text-body-sm opacity-50"
                        disabled="">30</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors">1</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors">2</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors">3</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors">4</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors">5</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors">6</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors">7</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full bg-primary text-on-primary font-bold text-body-sm shadow-md">8</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors">9</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors">10</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors">11</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors">12</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors">13</button>
                    <button
                        className="h-10 w-10 mx-auto flex items-center justify-center rounded-full text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors">14</button>
                </div>
            </div>
        </section>
        {/*  Time Selection  */}
        <section className="space-y-sm">
            <h2 className="font-label-md text-label-md text-on-surface-variant uppercase">Chọn giờ hẹn</h2>
            <div className="flex flex-wrap gap-md">
                <button
                    className="time-chip flex-1 min-w-[80px] py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md transition-all duration-200 active:scale-95 text-center"
                    onClick={() => {}}>
                    08:00
                </button>
                <button
                    className="time-chip flex-1 min-w-[80px] py-3 rounded-xl border-2 border-primary bg-primary-container/10 text-primary font-bold text-label-md transition-all duration-200 active:scale-95 text-center"
                    onClick={() => {}}>
                    09:30
                </button>
                <button
                    className="time-chip flex-1 min-w-[80px] py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md transition-all duration-200 active:scale-95 text-center"
                    onClick={() => {}}>
                    14:00
                </button>
                <button
                    className="time-chip flex-1 min-w-[80px] py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md transition-all duration-200 active:scale-95 text-center"
                    onClick={() => {}}>
                    16:30
                </button>
            </div>
        </section>
        {/*  Notes Section  */}
        <section className="space-y-sm">
            <h2 className="font-label-md text-label-md text-on-surface-variant uppercase">Ghi chú cho Sale</h2>
            <div className="relative">
                <textarea
                    className="w-full h-32 p-md bg-surface-container-lowest border border-outline-variant rounded-xl font-body-sm text-body-sm focus:border-2 focus:border-primary focus:ring-0 focus:shadow-[0_0_8px_rgba(30,58,138,0.2)] transition-all resize-none"
                    placeholder="Mô tả nhu cầu cụ thể của bạn (ví dụ: cần xem thêm bãi đỗ xe)..."></textarea>
                <span
                    className="absolute bottom-3 right-3 text-outline text-[10px] uppercase font-bold tracking-widest">Optional</span>
            </div>
        </section>
    </main>
    {/*  Bottom Action Bar  */}
    <div
        className="fixed bottom-0 w-full bg-surface-container-lowest p-margin-mobile shadow-[0px_-2px_4px_rgba(30,58,138,0.05)] z-50">
        <button
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline-sm text-headline-sm font-bold shadow-lg transition-all duration-200 active:scale-[0.98] hover:opacity-90 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{}}>calendar_add_on</span>
            Xác nhận đặt lịch
        </button>
    </div>
    



    </>
  );
};

export default LichHenXemPhong;
