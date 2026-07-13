import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export const MHHopDongTraPhong: React.FC = () => {
    const navigate = useNavigate();
    const [ngayTra, setNgayTra] = useState('');
    const [lyDo, setLyDo] = useState('');
    const [stk, setStk] = useState('');
    const [acceptPenalty, setAcceptPenalty] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const [statusData, setStatusData] = useState<any>(null);
    const [loadingStatus, setLoadingStatus] = useState(true);

    const getToken = () => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                return user.token || localStorage.getItem('token');
            } catch (e) {
                return localStorage.getItem('token');
            }
        }
        return localStorage.getItem('token');
    };

    const fetchStatus = async () => {
        try {
            const token = getToken();
            if (!token) {
                setLoadingStatus(false);
                return;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/finance/tra-phong/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.data && data.data.yeuCau) {
                setStatusData(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStatus(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    // Validate if date is < 30 days
    const isPenaltyRequired = () => {
        if (!ngayTra) return false;
        const selectedDate = new Date(ngayTra);
        const currentDate = new Date();
        selectedDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        const diffTime = selectedDate.getTime() - currentDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 30 && diffDays >= 0;
    };

    const isInvalidDate = () => {
        if (!ngayTra) return false;
        const selectedDate = new Date(ngayTra);
        const currentDate = new Date();
        selectedDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        return selectedDate.getTime() < currentDate.getTime();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (isInvalidDate()) {
            setErrorMsg('Ngày trả phòng không được nằm trong quá khứ.');
            return;
        }

        if (isPenaltyRequired() && !acceptPenalty) {
            setErrorMsg('Bạn phải đồng ý với khoản phí phạt để tiếp tục do thông báo trễ.');
            return;
        }

        try {
            setLoading(true);
            const token = getToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/finance/tra-phong/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ngayTra,
                    lyDo,
                    stk,
                    viPhamBaoTre: isPenaltyRequired()
                })
            });

            const data = await response.json();
            if (data.success) {
                await fetchStatus();
            } else {
                setErrorMsg(data.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
            }
        } catch (err) {
            setErrorMsg('Lỗi kết nối đến máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    const handleCaptureDebt = async (orderId: string) => {
        try {
            const token = getToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/finance/tra-phong/capture-debt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId,
                    maHD: statusData.hopDong.mahd
                })
            });
            const data = await response.json();
            if (data.success) {
                await fetchStatus();
            } else {
                alert('Thanh toán thất bại: ' + data.message);
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi xử lý thanh toán.');
        }
    };

    // Render Navigation
    const renderBottomNav = () => (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E0E3E5] flex justify-around items-center px-2 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div
                onClick={() => navigate('/')}
                className="flex flex-col items-center justify-center text-[#54647A] px-3 py-1.5 cursor-pointer active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined text-[20px]">home_work</span>
                <span className="text-[11px] font-normal mt-0.5">Tìm kiếm</span>
            </div>

            <div
                onClick={() => navigate('/dat-lich-hen')}
                className="flex flex-col items-center justify-center text-[#54647A] px-3 py-1.5 cursor-pointer active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                <span className="text-[11px] font-normal mt-0.5">Lịch hẹn</span>
            </div>

            <div
                onClick={() => navigate('/hop-dong')}
                className="flex flex-col items-center justify-center bg-[#1E3A8A] text-white rounded-xl px-4 py-1.5 cursor-pointer active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                <span className="text-[11px] font-semibold mt-0.5">Hợp đồng</span>
            </div>

            <div
                onClick={() => navigate('/lich-su-lich-hen')}
                className="flex flex-col items-center justify-center text-[#54647A] px-3 py-1.5 cursor-pointer active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined text-[20px]">history</span>
                <span className="text-[11px] font-normal mt-0.5">Lịch sử hẹn</span>
            </div>

            <div
                onClick={() => navigate('/thanh-toan-dinh-ky')}
                className="flex flex-col items-center justify-center text-[#54647A] px-3 py-1.5 cursor-pointer active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined text-[20px]">payments</span>
                <span className="text-[11px] font-normal mt-0.5">Thanh toán</span>
            </div>
        </nav>
    );

    if (loadingStatus) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F9FB]">
                <span className="material-symbols-outlined animate-spin text-[#00236F] text-4xl">progress_activity</span>
            </div>
        );
    }

    if (!getToken()) {
        return (
            <div className="w-full min-h-screen bg-[#F7F9FB] flex flex-col items-center justify-center pb-20">
                <span className="material-symbols-outlined text-6xl text-[#C5C5D3] mb-4">lock</span>
                <p className="text-[#54647A] font-medium">Vui lòng đăng nhập để xem Hợp đồng</p>
                <button 
                    onClick={() => navigate('/')}
                    className="mt-4 px-6 py-2 bg-[#00236F] text-white rounded-xl text-sm font-semibold"
                >
                    Quay về Trang chủ
                </button>
                {renderBottomNav()}
            </div>
        );
    }

    if (statusData) {
        const { yeuCau, doiSoat, hopDong } = statusData;
        const isDebt = hopDong.trangthai === 5 || yeuCau.trangthai === 4;
        const isCompleted = hopDong.trangthai === 4 || yeuCau.trangthai === 3 || yeuCau.trangthai === 5;

        return (
            <div className="w-full min-h-screen bg-[#F7F9FB] pb-24 font-['Inter']">
                <div className="bg-[#00236F] text-white p-6 pt-10 rounded-b-[32px] shadow-sm mb-6">
                    <h1 className="text-xl font-bold text-center">Hợp đồng & Trả phòng</h1>
                </div>

                <div className="max-w-3xl mx-auto px-4 space-y-5">
                    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[#E0E3E5] text-center">
                        {yeuCau.trangthai === 1 && (
                            <>
                                <span className="material-symbols-outlined text-4xl text-[#00236F] mb-3">pending_actions</span>
                                <h2 className="text-[17px] font-bold text-[#00236F] mb-1.5">Đã tiếp nhận yêu cầu</h2>
                                <p className="text-[13px] text-[#54647A]">Vui lòng chờ quản lý tòa nhà liên hệ để kiểm tra phòng.</p>
                            </>
                        )}
                        {yeuCau.trangthai === 2 && (
                            <>
                                <span className="material-symbols-outlined text-4xl text-[#00236F] mb-3">fact_check</span>
                                <h2 className="text-[17px] font-bold text-[#00236F] mb-1.5">Đã kiểm tra phòng</h2>
                                <p className="text-[13px] text-[#54647A]">Yêu cầu của bạn đang chờ kế toán đối soát tài chính và duyệt hoàn cọc.</p>
                            </>
                        )}
                        {isCompleted && (
                            <>
                                <span className="material-symbols-outlined text-4xl text-green-600 mb-3">check_circle</span>
                                <h2 className="text-[17px] font-bold text-green-600 mb-1.5">Đã hoàn tất trả phòng</h2>
                                <p className="text-[13px] text-[#54647A]">Hợp đồng của bạn đã được thanh lý thành công.</p>
                            </>
                        )}
                        {isDebt && (
                            <>
                                <span className="material-symbols-outlined text-4xl text-red-500 mb-3">warning</span>
                                <h2 className="text-[17px] font-bold text-red-500 mb-1.5">Chờ thanh toán công nợ</h2>
                                <p className="text-[13px] text-[#54647A] mb-4">Bạn cần thanh toán khoản chi phí phát sinh để hoàn tất thủ tục thanh lý hợp đồng.</p>
                            </>
                        )}
                    </div>

                    {doiSoat && (
                        <div className="bg-white border border-[#E0E3E5] rounded-[20px] p-5 shadow-sm">
                            <h3 className="font-bold text-[15px] text-[#191C1E] mb-3 border-b border-[#F2F4F6] pb-3">Bảng đối soát tài chính</h3>
                            <div className="space-y-3 text-[13px]">
                                <div className="flex justify-between">
                                    <span className="text-[#54647A]">Tiền cọc gốc:</span>
                                    <span className="font-bold text-[#191C1E]">{doiSoat.tienCoc?.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#54647A]">Tiền hoàn định mức:</span>
                                    <span className="font-bold text-[#00236F]">{doiSoat.tienHoanDinhMuc?.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#54647A]">Chi phí phát sinh & Phạt:</span>
                                    <span className="font-bold text-red-500">-{doiSoat.tongKhauTru?.toLocaleString()}đ</span>
                                </div>
                                <div className="pt-3 border-t border-[#F2F4F6] flex justify-between items-center">
                                    <span className="font-bold text-[14px] text-[#191C1E]">Tổng số dư:</span>
                                    <span className={`font-bold text-[18px] ${doiSoat.thucNhanChi < 0 ? 'text-red-500' : 'text-[#00236F]'}`}>
                                        {doiSoat.thucNhanChi?.toLocaleString()}đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {isDebt && doiSoat && (
                        <div className="bg-red-50 p-5 rounded-[20px] border border-red-100">
                            <h3 className="font-bold text-red-600 text-[14px] mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">payments</span>
                                Thanh toán qua PayPal
                            </h3>
                            <PayPalScriptProvider options={{ "clientId": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
                                <PayPalButtons
                                    createOrder={async () => {
                                        const token = getToken();
                                        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/finance/tra-phong/pay-debt`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${token}`
                                            },
                                            body: JSON.stringify({
                                                maHD: hopDong.mahd,
                                                amount: Math.abs(doiSoat.thucNhanChi)
                                            })
                                        });
                                        const data = await response.json();
                                        if (data.success && data.data) {
                                            return data.data.id;
                                        }
                                        throw new Error('Could not create order');
                                    }}
                                    onApprove={async (data) => {
                                        await handleCaptureDebt(data.orderID);
                                    }}
                                    onError={(err) => {
                                        alert('Có lỗi xảy ra khi thanh toán qua PayPal.');
                                        console.error(err);
                                    }}
                                />
                            </PayPalScriptProvider>
                        </div>
                    )}
                </div>
                {renderBottomNav()}
            </div>
        );
    }

    // Default Render Form
    return (
        <div className="w-full min-h-screen bg-[#F7F9FB] pb-24 font-['Inter']">
            <div className="bg-[#00236F] text-white p-6 pt-10 rounded-b-[32px] shadow-sm mb-6">
                <h1 className="text-xl font-bold text-center">Yêu cầu trả phòng</h1>
            </div>

            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-[20px] shadow-sm border border-[#E0E3E5] p-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Ngày dự kiến */}
                        <div>
                            <label className="block text-[13px] font-semibold text-[#191C1E] mb-2">Ngày dự kiến trả phòng</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    required
                                    className="w-full p-3.5 rounded-xl border border-[#C5C5D3] focus:border-[#00236F] focus:ring-1 focus:ring-[#00236F] outline-none transition-all text-[14px]"
                                    value={ngayTra}
                                    onChange={(e) => setNgayTra(e.target.value)}
                                />
                            </div>
                            {isInvalidDate() && (
                                <p className="text-red-500 text-[11px] mt-1.5 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">error</span>
                                    Không thể chọn ngày trong quá khứ.
                                </p>
                            )}
                            {!isPenaltyRequired() && !isInvalidDate() && (
                                <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                    Phải báo trước tối thiểu 30 ngày
                                </p>
                            )}

                            {isPenaltyRequired() && (
                                <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
                                    <p className="text-red-600 font-semibold text-[12px] mb-1 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">warning</span>
                                        Báo trước &lt; 30 ngày
                                    </p>
                                    <p className="text-[11px] text-red-500/80 mb-2">
                                        Phát sinh phí phạt bằng 25% tiền cọc.
                                    </p>
                                    <label className="flex items-start gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 w-3.5 h-3.5 text-[#00236F] rounded border-[#C5C5D3]"
                                            checked={acceptPenalty}
                                            onChange={(e) => setAcceptPenalty(e.target.checked)}
                                        />
                                        <span className="text-[11px] font-semibold text-red-600">Tôi chấp nhận phát sinh phí phạt.</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* STK */}
                        <div>
                            <label className="block text-[13px] font-semibold text-[#191C1E] mb-2">Số tài khoản / PayPal nhận cọc</label>
                            <input
                                type="text"
                                required
                                placeholder="VD: VCB - 123456789"
                                className="w-full p-3.5 rounded-xl border border-[#C5C5D3] focus:border-[#00236F] focus:ring-1 focus:ring-[#00236F] outline-none transition-all text-[14px]"
                                value={stk}
                                onChange={(e) => setStk(e.target.value)}
                            />
                        </div>

                        {/* Lý do */}
                        <div>
                            <label className="block text-[13px] font-semibold text-[#191C1E] mb-2">Lý do trả phòng</label>
                            <textarea
                                required
                                rows={3}
                                placeholder="Chia sẻ lý do bạn trả phòng..."
                                className="w-full p-3.5 rounded-xl border border-[#C5C5D3] focus:border-[#00236F] focus:ring-1 focus:ring-[#00236F] outline-none transition-all resize-none text-[14px]"
                                value={lyDo}
                                onChange={(e) => setLyDo(e.target.value)}
                            ></textarea>
                        </div>

                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-600 text-[12px] rounded-xl flex items-center gap-1.5 font-medium border border-red-100">
                                <span className="material-symbols-outlined text-[16px]">error</span>
                                {errorMsg}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl font-bold bg-[#00236F] text-white hover:bg-[#1E3A8A] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md text-[14px]"
                            >
                                {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                                Gửi yêu cầu
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {renderBottomNav()}
        </div>
    );
};
