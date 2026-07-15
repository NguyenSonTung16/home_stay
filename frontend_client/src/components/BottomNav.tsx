import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { path: '/', icon: 'home_work', label: 'Tìm kiếm' },
        { path: '/thanh-toan-coc', icon: 'receipt', label: 'Phiếu cọc' },
        { path: '/hop-dong', icon: 'receipt_long', label: 'Hợp đồng' },
        { path: '/lich-su-lich-hen', icon: 'history', label: 'Lịch sử hẹn' },
        { path: '/thanh-toan-dinh-ky', icon: 'payments', label: 'Thanh toán' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-[#E0E3E5] flex justify-between items-center px-1 z-[9999] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
            {tabs.map((tab) => {
                const active = location.pathname === tab.path;
                return (
                    <div
                        key={tab.path}
                        onClick={() => navigate(tab.path)}
                        className="flex-1 flex justify-center items-center h-full cursor-pointer active:scale-95 transition-transform"
                    >
                        <div
                            className={`flex flex-col items-center justify-center w-full max-w-[68px] h-[52px] rounded-[14px] transition-colors ${
                                active ? 'bg-[#1E3A8A] text-white' : 'text-[#54647A]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[20px] mb-0.5">{tab.icon}</span>
                            <span 
                                className={`text-[10px] leading-tight text-center px-0.5 whitespace-nowrap tracking-tight ${
                                    active ? 'font-semibold' : 'font-medium'
                                }`}
                            >
                                {tab.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </nav>
    );
};

export default BottomNav;
