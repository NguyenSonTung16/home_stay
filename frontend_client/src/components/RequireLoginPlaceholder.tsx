import React from 'react';
import { useAuth } from '../context/AuthContext';

interface RequireLoginPlaceholderProps {
    title?: string;
    message?: string;
}

export const RequireLoginPlaceholder: React.FC<RequireLoginPlaceholderProps> = ({
    title = "Vui lòng đăng nhập tài khoản",
    message = "Vui lòng đăng nhập để tiếp tục!"
}) => {
    const { openAuthModal } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[65vh] px-4">
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E0E3E5] text-center w-full max-w-2xl mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#EBF5FF] text-[#00236F] flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-[32px]">lock</span>
                </div>
                <h3 className="text-[#00236F] font-bold text-[20px] mb-3">{title}</h3>
                <p className="text-[#54647A] text-[15px] mb-8 leading-relaxed">
                    {message}
                </p>
                <button
                    onClick={openAuthModal}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#00236F] text-white font-bold text-[15px] hover:bg-[#00184D] transition-all shadow-md active:scale-95"
                >
                    <span className="material-symbols-outlined text-[22px]">login</span>
                    <span>Đăng nhập ngay</span>
                </button>
            </div>
        </div>
    );
};
