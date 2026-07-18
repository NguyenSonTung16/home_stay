import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '../context/AuthContext';
import { RequireLoginPlaceholder } from '../components/RequireLoginPlaceholder';

// Hàm tiện ích dùng chung
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

const ContractCard: React.FC<{ contractData: any, fetchStatus: () => void }> = ({ contractData, fetchStatus }) => {
    const { status, hopDong, yeuCau, doiSoat } = contractData;
    const [ngayTra, setNgayTra] = useState('');
    const [lyDo, setLyDo] = useState('');
    const [stk, setStk] = useState('');
    const [acceptPenalty, setAcceptPenalty] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const isDebt = hopDong?.trangthai === 5 || yeuCau?.trangthai === 4;
    const isCompleted = hopDong?.trangthai === 4 || yeuCau?.trangthai === 3 || yeuCau?.trangthai === 5;

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
                    maHD: hopDong.mahd,
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
                    maHD: hopDong.mahd
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

    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-[#E0E3E5] flex flex-col items-start text-left mb-6 transition-all duration-300">
            <div
                className={`flex items-center justify-between w-full p-5 cursor-pointer hover:bg-[#F8FAFC] transition-colors ${isExpanded ? 'rounded-t-[20px]' : 'rounded-[20px]'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#F2F4F6] rounded-xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#A0ABBA] text-[28px]">apartment</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-[16px] text-[#54647A]">HĐ #{hopDong.mahd}</h3>
                            <span className="w-1 h-1 rounded-full bg-[#C5C5D3]"></span>
                            <span className="font-bold text-[16px] text-[#7A8AA3]">{hopDong.tenphong || `P.${hopDong.maphong}`}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] font-medium mt-1">
                            {status === 'CAN_CHECKOUT' && <span className="text-[#00236F]">Đang thuê</span>}
                            {status === 'UNPAID_FIRST_PERIOD' && <span className="text-[#DC2626]">Chưa thanh toán kỳ đầu</span>}
                            {status === 'HAS_CHECKOUT_REQUEST' && yeuCau?.trangthai === 1 && !isCompleted && !isDebt && <span className="text-[#B5850B]">Đã gửi yêu cầu trả phòng</span>}
                            {status === 'HAS_CHECKOUT_REQUEST' && yeuCau?.trangthai === 2 && !isCompleted && !isDebt && <span className="text-[#00236F]">Đã kiểm tra phòng</span>}
                            {status === 'HAS_CHECKOUT_REQUEST' && isCompleted && <span className="text-[#2E7D32]">Đã hoàn tất trả phòng</span>}
                            {status === 'HAS_CHECKOUT_REQUEST' && isDebt && <span className="text-[#C62828]">Chờ thanh toán công nợ</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E0E3E5] text-[#54647A]">
                    <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </div>
            </div>

            {isExpanded && (
                <div className="w-full px-5 pb-5 border-t border-[#F2F4F6] pt-4 animate-fadeIn">
                    <div className="flex flex-col gap-1.5 text-[13px] text-[#54647A] font-medium w-full">
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] text-[#A0ABBA] mt-[2px]">payments</span>
                            <span>Giá thuê: <b className="text-[#00236F]">{Number(hopDong.giathue || 0).toLocaleString('vi-VN')}đ</b>/tháng</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] text-[#A0ABBA] mt-[2px]">bed</span>
                            <span>Số giường cọc: <b className="text-[#191C1E]">{hopDong.sogiuong || 1}</b></span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] text-[#A0ABBA] mt-[2px]">savings</span>
                            <span>Tiền cọc trong phòng: <b className="text-[#2E7D32]">{Number(hopDong.tiencoc || 0).toLocaleString('vi-VN')}đ</b></span>
                        </div>
                    </div>

                    {status === 'HAS_CHECKOUT_REQUEST' && yeuCau && (
                        <div className="w-full">
                            {yeuCau.trangthai === 1 && !isCompleted && !isDebt && (
                                <div className="inline-flex items-center gap-1.5 bg-[#FEF7D9] text-[#B5850B] px-3.5 py-1.5 rounded-full text-[13px] font-bold mt-2">
                                    <span className="material-symbols-outlined text-[18px]">pending</span>
                                    Đã gửi yêu cầu
                                </div>
                            )}
                            {yeuCau.trangthai === 2 && !isCompleted && !isDebt && (
                                <div className="inline-flex items-center gap-1.5 bg-[#E3F2FD] text-[#00236F] px-3.5 py-1.5 rounded-full text-[13px] font-bold mt-2">
                                    <span className="material-symbols-outlined text-[18px]">fact_check</span>
                                    Đã kiểm tra phòng
                                </div>
                            )}
                            {isCompleted && (
                                <div className="inline-flex items-center gap-1.5 bg-[#E8F5E9] text-[#2E7D32] px-3.5 py-1.5 rounded-full text-[13px] font-bold mt-2">
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    Đã hoàn tất trả phòng
                                </div>
                            )}
                            {isDebt && (
                                <div className="inline-flex items-center gap-1.5 bg-[#FFEBEE] text-[#C62828] px-3.5 py-1.5 rounded-full text-[13px] font-bold mt-2">
                                    <span className="material-symbols-outlined text-[18px]">warning</span>
                                    Chờ thanh toán công nợ
                                </div>
                            )}
                        </div>
                    )}

                    {status === 'HAS_CHECKOUT_REQUEST' && doiSoat && (
                        <div className="bg-white border border-[#E0E3E5] rounded-[20px] p-5 shadow-sm w-full mt-4">
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

                    {status === 'HAS_CHECKOUT_REQUEST' && isDebt && doiSoat && (
                        <div className="bg-red-50 p-5 rounded-[20px] border border-red-100 w-full mt-4">
                            <h3 className="font-bold text-red-600 text-[14px] mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">payments</span>
                                Thanh toán qua PayPal
                            </h3>
                            <PayPalScriptProvider options={{ "clientId": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
                                <div className="relative z-10 w-full block">
                                    <PayPalButtons
                                        style={{ layout: 'vertical', shape: 'rect' }}
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
                                </div>
                            </PayPalScriptProvider>
                        </div>
                    )}

                    {status === 'CAN_CHECKOUT' && (
                        <div className="bg-white rounded-[20px] shadow-sm border border-[#E0E3E5] p-5 mt-4 w-full">
                            <h2 className="font-bold text-[#191C1E] text-[16px] mb-4 border-b border-[#F2F4F6] pb-3">Tạo yêu cầu trả phòng mới</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
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
                    )}
                </div>
            )}
        </div>
    );
};

export const MHHopDongTraPhong: React.FC = () => {
    const { currentUser } = useAuth();
    const [statusData, setStatusData] = useState<any>(null);
    const [loadingStatus, setLoadingStatus] = useState(true);

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
            if (data.success && data.data) {
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

    if (!currentUser) {
        return (
            <div className="w-full min-h-screen bg-[#F7F9FB] flex flex-col pt-12 pb-20">
                <RequireLoginPlaceholder
                    message="Vui lòng đăng nhập tài khoản của bạn để xem và quản lý Hợp đồng thuê phòng."
                />
            </div>
        );
    }

    if (loadingStatus) {
        return <div className="w-full min-h-screen bg-[#F7F9FB] flex justify-center pt-20">Đang tải dữ liệu...</div>;
    }

    if (!statusData || !statusData.contracts || statusData.contracts.length === 0) {
        return (
            <div className="w-full min-h-screen bg-[#F7F9FB] flex flex-col pt-12 pb-20 px-4">
                <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E0E3E5] text-center w-full max-w-2xl mx-auto shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-[#FFF4E5] text-[#D97706] flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-[32px]">warning</span>
                    </div>
                    <h3 className="text-[#00236F] font-bold text-[20px] mb-3">Chưa có hợp đồng</h3>
                    <p className="text-[#54647A] text-[15px] mb-8 leading-relaxed">
                        Bạn chưa có hợp đồng thuê phòng nào đang có hiệu lực.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#F7F9FB] pt-6 pb-40 font-['Inter']">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-[#00236F] font-bold text-[20px] mb-6">Danh sách hợp đồng của bạn</h2>
                {statusData.contracts.map((contract: any, index: number) => (
                    <ContractCard key={index} contractData={contract} fetchStatus={fetchStatus} />
                ))}
            </div>
        </div>
    );
};
