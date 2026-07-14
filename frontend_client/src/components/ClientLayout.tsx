import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthModal } from './AuthModal';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

export const ClientLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout, isAuthModalOpen, closeAuthModal, openAuthModal, setCurrentUser } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const displayUsername = currentUser?.user?.username || (currentUser as any)?.username || (currentUser as any)?.hoten || 'khach1';

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="w-full min-h-screen bg-[#F7F9FB] pb-24 font-['Inter'] relative">
            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 h-[72px] bg-white border-b border-[#E0E3E5] px-4 md:px-8 flex items-center justify-between z-40 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                {/* Logo & Toggle */}
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F2F4F6] transition-colors md:hidden">
                        <span className="material-symbols-outlined text-[#54647A] text-[24px]">menu</span>
                    </button>
                    <div 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-9 h-9 bg-[#00236F] rounded-xl flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-white text-[20px]">apartment</span>
                        </div>
                        <span className="font-bold text-[18px] text-[#191C1E] tracking-tight hidden sm:block">
                            FIT 4.0
                        </span>
                    </div>
                </div>

                {/* User Section */}
                <div className="flex items-center gap-3">
                    {currentUser ? (
                        <>

                            <div 
                                className="flex items-center gap-2 bg-[#F7F9FB] px-1.5 py-1.5 rounded-full border border-[#E0E3E5] cursor-pointer hover:bg-[#F2F4F6] transition-colors relative"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="w-8 h-8 rounded-full bg-[#E0E3E5] flex items-center justify-center overflow-hidden border border-white">
                                    <span className="material-symbols-outlined text-[#54647A] text-[20px]">person</span>
                                </div>
                                <span className="text-[13px] font-semibold text-[#191C1E] pr-2 max-w-[120px] truncate block">
                                    {displayUsername}
                                </span>
                                
                                {/* Dropdown */}
                                {isDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E0E3E5] py-2 z-50">
                                    <div className="px-4 py-2 border-b border-[#E0E3E5] sm:hidden">
                                        <p className="text-[13px] font-semibold text-[#191C1E] truncate">{displayUsername}</p>
                                    </div>

                                    <button 
                                        onClick={() => navigate('/yeu-cau-tra-phong')}
                                        className="w-full text-left px-4 py-2 text-[14px] text-[#54647A] hover:bg-[#F7F9FB] hover:text-[#00236F] transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">exit_to_app</span>
                                        Yêu cầu trả phòng
                                    </button>
                                    <button 
                                        onClick={logout}
                                        className="w-full text-left px-4 py-2 text-[14px] text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                        Đăng xuất
                                    </button>
                                </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={openAuthModal}
                            className="bg-[#00236F] hover:bg-[#1E3A8A] text-white px-5 py-2.5 rounded-full font-bold text-[13px] transition-all active:scale-95 shadow-sm"
                        >
                            Đăng nhập
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="pt-[72px] pb-[70px] md:pb-0">
                <Outlet />
            </main>

            <BottomNav />

            {/* Global Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                onSuccess={(user) => {
                    setCurrentUser(user);
                    closeAuthModal();
                }}
            />

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E0E3E5] flex justify-around items-center px-1 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                <div
                    onClick={() => navigate('/')}
                    className={`flex flex-col items-center justify-center px-2 py-1.5 cursor-pointer active:scale-95 transition-all rounded-xl ${isActive('/') ? 'bg-[#1E3A8A] text-white' : 'text-[#54647A]'}`}
                >
                    <span className="material-symbols-outlined text-[20px]">search</span>
                    <span className={`text-[10px] mt-0.5 whitespace-nowrap ${isActive('/') ? 'font-semibold' : 'font-normal'}`}>Tìm kiếm</span>
                </div>

                <div
                    onClick={() => navigate('/dat-lich-hen')}
                    className={`flex flex-col items-center justify-center px-2 py-1.5 cursor-pointer active:scale-95 transition-all rounded-xl ${isActive('/dat-lich-hen') ? 'bg-[#1E3A8A] text-white' : 'text-[#54647A]'}`}
                >
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                    <span className={`text-[10px] mt-0.5 whitespace-nowrap ${isActive('/dat-lich-hen') ? 'font-semibold' : 'font-normal'}`}>Lịch hẹn</span>
                </div>

                <div
                    onClick={() => navigate('/thanh-toan-coc')}
                    className={`flex flex-col items-center justify-center px-2 py-1.5 cursor-pointer active:scale-95 transition-all rounded-xl ${isActive('/thanh-toan-coc') ? 'bg-[#1E3A8A] text-white' : 'text-[#54647A]'}`}
                >
                    <span className="material-symbols-outlined text-[20px]">receipt</span>
                    <span className={`text-[10px] mt-0.5 whitespace-nowrap ${isActive('/thanh-toan-coc') ? 'font-semibold' : 'font-normal'}`}>Phiếu cọc</span>
                </div>

                <div
                    onClick={() => navigate('/hop-dong')}
                    className={`flex flex-col items-center justify-center px-2 py-1.5 cursor-pointer active:scale-95 transition-all rounded-xl ${isActive('/hop-dong') ? 'bg-[#1E3A8A] text-white' : 'text-[#54647A]'}`}
                >
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                    <span className={`text-[10px] mt-0.5 whitespace-nowrap ${isActive('/hop-dong') ? 'font-semibold' : 'font-normal'}`}>Hợp đồng</span>
                </div>

                <div
                    onClick={() => navigate('/lich-su-lich-hen')}
                    className={`flex flex-col items-center justify-center px-2 py-1.5 cursor-pointer active:scale-95 transition-all rounded-xl ${isActive('/lich-su-lich-hen') ? 'bg-[#1E3A8A] text-white' : 'text-[#54647A]'}`}
                >
                    <span className="material-symbols-outlined text-[20px]">history</span>
                    <span className={`text-[10px] mt-0.5 whitespace-nowrap ${isActive('/lich-su-lich-hen') ? 'font-semibold' : 'font-normal'}`}>Lịch sử hẹn</span>
                </div>
            </nav>
        </div>
    );
};
