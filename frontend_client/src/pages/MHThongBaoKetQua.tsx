import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ─── Types ───────────────────────────────────────────────────────────────────
interface OrderDetails {
  maDH: string;
  trangThai: 'DangCho' | 'DaThanhToan' | 'ThatBai' | 'HetHan';
  thoiGianHetHan: string;
  tongTien: number;
  loaiHoaDon: 'DienNuoc' | 'PhiDinhKy';
  maHoaDon: number;
  phuongThuc: string;
}

// ─── Timeline steps ───────────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  { label: 'Tạo đơn hàng', desc: 'Hệ thống khởi tạo giao dịch PayPal' },
  { label: 'Quét mã thanh toán', desc: 'Khách hàng hoàn tất quét mã QR' },
  { label: 'Xác nhận từ cổng thanh toán', desc: 'PayPal webhook xác nhận' },
  { label: 'Cập nhật hóa đơn', desc: 'Hệ thống cập nhật trạng thái hóa đơn' },
];

function getTimelineState(status: string): number {
  if (status === 'DaThanhToan') return 4;
  if (status === 'ThatBai') return 2;
  if (status === 'HetHan') return 1;
  return 1;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps { message: string; visible: boolean; onClose: () => void; }
const Toast: React.FC<ToastProps> = ({ message, visible, onClose }) => (
  <div style={{
    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
    background: '#1a7f5a', color: 'white', borderRadius: '12px',
    padding: '12px 18px 12px 14px', display: 'flex', alignItems: 'center', gap: '10px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)', minWidth: '280px',
    transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    transform: visible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)',
    opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: '20px', flexShrink: 0 }}>check_circle</span>
    <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{message}</span>
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const MHThongBaoKetQua: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tokenFromUrl = searchParams.get('token');
  const { status, maDH, orderDetails: stateOrderDetails } = (location.state as { status: string; maDH: string; orderDetails?: OrderDetails }) || { 
    status: tokenFromUrl ? 'DaThanhToan' : 'ThatBai', 
    maDH: tokenFromUrl || '' 
  };

  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [tenKhach, setTenKhach] = useState('');
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const getToken = useCallback(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try { const u = JSON.parse(stored); return u.token || localStorage.getItem('token'); }
      catch { return localStorage.getItem('token'); }
    }
    return localStorage.getItem('token');
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      if (stateOrderDetails) {
        setOrderDetails(stateOrderDetails);
        setLoading(false);
        return;
      }
      if (!maDH) { setLoading(false); return; }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/don-hang/${maDH}/status`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (data.success && data.data) setOrderDetails(data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchDetails();

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try { const u = JSON.parse(stored); setTenKhach(u.hoTen || u.username || ''); } catch { /* */ }
    }
  }, [maDH, getToken]);

  // Show toast after load if success
  useEffect(() => {
    if (!loading && status === 'DaThanhToan') {
      const t = setTimeout(() => setShowToast(true), 600);
      const t2 = setTimeout(() => setShowToast(false), 5000);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, [loading, status]);

  const handleCopy = () => {
    if (!maDH) return;
    navigator.clipboard.writeText(maDH);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Status config ──────────────────────────────────────────────────────────
  const S = {
    DaThanhToan: {
      icon: 'check_circle', iconColor: '#059669', ringColor: '#D1FAE5', borderColor: '#6EE7B7',
      gradientFrom: '#ECFDF5', gradientTo: '#D1FAE5',
      title: 'Thanh Toán Thành Công', titleColor: '#065F46',
      desc: 'Giao dịch đã được xác nhận và hóa đơn của bạn đã được cập nhật trên hệ thống.',
      badge: { text: 'Đã thanh toán', bg: '#D1FAE5', color: '#065F46' },
    },
    ThatBai: {
      icon: 'cancel', iconColor: '#DC2626', ringColor: '#FEE2E2', borderColor: '#FCA5A5',
      gradientFrom: '#FEF2F2', gradientTo: '#FEE2E2',
      title: 'Thanh Toán Thất Bại', titleColor: '#991B1B',
      desc: 'Giao dịch bị hủy hoặc có lỗi xảy ra trong quá trình kết nối PayPal.',
      badge: { text: 'Thất bại', bg: '#FEE2E2', color: '#991B1B' },
    },
    HetHan: {
      icon: 'hourglass_empty', iconColor: '#D97706', ringColor: '#FEF3C7', borderColor: '#FCD34D',
      gradientFrom: '#FFFBEB', gradientTo: '#FEF3C7',
      title: 'Giao Dịch Hết Hạn', titleColor: '#92400E',
      desc: 'Đã quá 15 phút thực hiện thanh toán. Vui lòng tạo giao dịch mới để tiếp tục.',
      badge: { text: 'Hết hạn', bg: '#FEF3C7', color: '#92400E' },
    },
  } as const;
  const cfg = S[status as keyof typeof S] ?? S.ThatBai;
  const activeStep = getTimelineState(status);
  const qrUrl = maDH
    ? `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(maDH)}`
    : null;

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
        <span className="material-symbols-outlined animate-spin text-[#00236F]" style={{ fontSize: '40px' }}>progress_activity</span>
      </div>
    );
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const loaiLabel = orderDetails?.loaiHoaDon === 'DienNuoc' ? 'Điện nước sinh hoạt' : 'Phí thuê phòng & Dịch vụ';
  const tongTienFmt = orderDetails?.tongTien
    ? `${Number(orderDetails.tongTien).toLocaleString('vi-VN')} đ`
    : '—';
  const thoiGianFmt = new Date().toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });

  // ─── Style constants ────────────────────────────────────────────────────────
  const PAGE: React.CSSProperties = {
    width: '100%', minHeight: '100vh', background: '#F1F5F9',
    fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column',
    boxSizing: 'border-box',
  };

  const HEADER: React.CSSProperties = {
    width: '100%', background: '#00236F', color: 'white',
    padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px',
    boxShadow: '0 2px 12px rgba(0,35,111,0.3)', flexShrink: 0, boxSizing: 'border-box',
  };

  const CONTAINER: React.CSSProperties = {
    width: '100%', maxWidth: '1024px', margin: '0 auto',
    padding: isMobile ? '16px' : '32px 24px', boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column', gap: '24px',
  };

  const TWO_COL: React.CSSProperties = {
    display: 'flex', flexDirection: isMobile ? 'column' : 'row',
    gap: '24px', alignItems: 'flex-start',
  };

  const LEFT_COL: React.CSSProperties = {
    flexShrink: 0,
    width: isMobile ? '100%' : 'calc(5/12 * 100%)',
  };

  const RIGHT_COL: React.CSSProperties = {
    flex: 1, width: isMobile ? '100%' : 'auto', minWidth: 0,
  };

  const CARD: React.CSSProperties = {
    background: 'white', borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden',
  };

  const BTN_ROW: React.CSSProperties = {
    display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px',
    width: '100%', boxSizing: 'border-box',
  };

  // ─── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div style={PAGE}>
      <Toast
        message="Hệ thống đã cập nhật hóa đơn của bạn"
        visible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* ── Header ── */}
      <div style={HEADER}>
        <button
          onClick={() => navigate(orderDetails?.loaiHoaDon === 'DatCoc' ? '/thanh-toan-coc' : '/thanh-toan-dinh-ky')}
          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px' }}>arrow_back</span>
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Kết Quả Giao Dịch</h1>
        </div>
      </div>

      {/* ── Page body ── */}
      <div style={{ flex: 1, boxSizing: 'border-box' }}>
        <div style={CONTAINER}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', flexWrap: 'wrap' }}>
            <span style={{ cursor: 'pointer', color: '#00236F' }} onClick={() => navigate('/')}>Trang chủ</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
            <span style={{ cursor: 'pointer', color: '#00236F' }} onClick={() => navigate('/hop-dong')}>Hợp đồng</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
            <span style={{ cursor: 'pointer', color: '#00236F' }} onClick={() => navigate('/thanh-toan-dinh-ky')}>Thanh toán</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
            <span style={{ color: '#475569', fontWeight: 600 }}>Kết quả giao dịch</span>
          </div>

          {/* ── Two-column grid ── */}
          <div style={TWO_COL}>

            {/* ── LEFT COLUMN: Status card + Timeline ── */}
            <div style={LEFT_COL}>
              <div style={CARD}>
                {/* Status gradient header */}
                <div style={{
                  background: `linear-gradient(145deg, ${cfg.gradientFrom}, ${cfg.gradientTo})`,
                  padding: '32px 24px', textAlign: 'center',
                  borderBottom: `1px solid ${cfg.borderColor}`,
                }}>
                  {/* Big icon */}
                  <div style={{
                    width: '88px', height: '88px', borderRadius: '50%',
                    background: 'white', border: `3px solid ${cfg.borderColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', boxShadow: `0 0 0 8px ${cfg.ringColor}`,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: cfg.iconColor }}>
                      {cfg.icon}
                    </span>
                  </div>

                  {/* Badge */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: cfg.badge.bg, border: `1.5px solid ${cfg.borderColor}`, borderRadius: '20px', padding: '4px 14px', marginBottom: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.badge.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.badge.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cfg.badge.text}</span>
                  </div>

                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: cfg.titleColor, margin: '0 0 10px', lineHeight: 1.3 }}>
                    {cfg.title}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.8, margin: 0 }}>
                    {cfg.desc}
                  </p>
                </div>

                {/* Timeline */}
                <div style={{ padding: '24px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                    Tiến trình giao dịch
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {TIMELINE_STEPS.map((step, idx) => {
                      const stepNum = idx + 1;
                      const done = stepNum <= activeStep;
                      const current = stepNum === activeStep + 1 && status !== 'DaThanhToan';
                      const failed = (status === 'ThatBai' || status === 'HetHan') && stepNum === activeStep + 1;
                      const isLast = idx === TIMELINE_STEPS.length - 1;

                      return (
                        <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                          {/* Icon + connector */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              background: done ? '#059669' : failed ? '#DC2626' : '#F1F5F9',
                              border: `2px solid ${done ? '#059669' : failed ? '#DC2626' : '#E2E8F0'}`,
                              boxShadow: done ? '0 0 0 4px #D1FAE5' : 'none',
                              transition: 'all 0.3s ease',
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: done ? 'white' : failed ? 'white' : '#CBD5E1' }}>
                                {done ? 'check' : failed ? 'close' : 'radio_button_unchecked'}
                              </span>
                            </div>
                            {!isLast && (
                              <div style={{ width: '2px', height: '28px', background: done ? '#D1FAE5' : '#F1F5F9', margin: '3px 0', borderRadius: '2px' }} />
                            )}
                          </div>
                          {/* Text */}
                          <div style={{ paddingBottom: isLast ? 0 : '12px', paddingTop: '4px' }}>
                            <div style={{ fontSize: '13px', fontWeight: done ? 700 : 500, color: done ? '#0F172A' : '#94A3B8' }}>
                              {step.label}
                            </div>
                            <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px', lineHeight: 1.5 }}>
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Transaction details card ── */}
            <div style={RIGHT_COL}>
              <div style={CARD}>
                {/* Card header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#00236F', fontSize: '22px' }}>receipt_long</span>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Chi tiết giao dịch</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>FIT 4.0 HomeStay — Thanh toán điện tử</div>
                  </div>
                </div>

                {/* Details grid */}
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>

                  {/* Mã đơn hàng */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F8FAFC', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>Mã đơn hàng</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', justifyContent: 'flex-end' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#00236F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                        {maDH || '—'}
                      </span>
                      {maDH && (
                        <button
                          onClick={handleCopy}
                          title="Copy mã đơn hàng"
                          style={{ border: 'none', background: copied ? '#D1FAE5' : '#F8FAFC', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'background 0.2s' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: copied ? '#059669' : '#94A3B8' }}>
                            {copied ? 'check' : 'content_copy'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Khách hàng */}
                  {tenKhach && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F8FAFC', gap: '16px' }}>
                      <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>Khách hàng</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{tenKhach}</span>
                    </div>
                  )}

                  {/* Order details */}
                  {orderDetails && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F8FAFC', gap: '16px' }}>
                        <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>Loại hóa đơn</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', textAlign: 'right' }}>{loaiLabel}</span>
                      </div>

                      {orderDetails.maHoaDon && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F8FAFC', gap: '16px' }}>
                          <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>Mã hóa đơn gốc</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>#{orderDetails.maHoaDon}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F8FAFC', gap: '16px' }}>
                        <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
                          {(orderDetails.phuongThuc === 'Tiền mặt' || orderDetails.phuongThuc === 'Chuyển khoản') ? 'Hình thức thanh toán' : 'Cổng thanh toán'}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#00236F', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            {(orderDetails.phuongThuc === 'Tiền mặt' || orderDetails.phuongThuc === 'Chuyển khoản') ? 'payments' : 'account_balance_wallet'}
                          </span>
                          {orderDetails.phuongThuc || 'PayPal'}
                        </span>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F8FAFC', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>Thời gian</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>{thoiGianFmt}</span>
                  </div>

                  {/* Total */}
                  <div style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', borderRadius: '14px', padding: '16px 20px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#3730A3' }}>Tổng thanh toán</span>
                    <span style={{ fontSize: '24px', fontWeight: 900, color: '#00236F' }}>{tongTienFmt}</span>
                  </div>
                </div>

                {/* QR + note */}
                {status === 'DaThanhToan' && qrUrl && (
                  <div style={{ padding: '0 24px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                    <img src={qrUrl} alt="QR mã đơn hàng" width={76} height={76} style={{ borderRadius: '8px', border: '1px solid #E2E8F0', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>QR đối soát nội bộ</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.5 }}>Nhân viên quét để xác minh nhanh mã giao dịch này.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Invoice status block (full-width) ── */}
          {status === 'DaThanhToan' && orderDetails && (
            <div style={{ ...CARD, padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span className="material-symbols-outlined" style={{ color: '#059669', fontSize: '20px' }}>task_alt</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Trạng thái cập nhật hóa đơn</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {orderDetails.loaiHoaDon === 'DienNuoc' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#059669', fontSize: '20px', flexShrink: 0 }}>electric_bolt</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#065F46' }}>
                        Hóa đơn điện nước #{orderDetails.maHoaDon}
                      </div>
                      <div style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px' }}>✓ Trạng thái cập nhật → Đã thanh toán</div>
                    </div>
                    <span style={{ marginLeft: 'auto', background: '#D1FAE5', color: '#065F46', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>
                      Đã thanh toán
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#059669', fontSize: '20px', flexShrink: 0 }}>home</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#065F46' }}>
                        Phí thuê phòng định kỳ #{orderDetails.maHoaDon}
                      </div>
                      <div style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px' }}>✓ Trạng thái cập nhật → Đã thanh toán</div>
                    </div>
                    <span style={{ marginLeft: 'auto', background: '#D1FAE5', color: '#065F46', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>
                      Đã thanh toán
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Action buttons ── */}
          <div style={BTN_ROW}>
            <button
              onClick={() => navigate(orderDetails?.loaiHoaDon === 'DatCoc' ? '/thanh-toan-coc' : '/thanh-toan-dinh-ky')}
              style={{ flex: 1, padding: '14px 20px', background: 'linear-gradient(135deg, #00236F, #1E3A8A)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(0,35,111,0.25)', transition: 'transform 0.15s', boxSizing: 'border-box' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>receipt_long</span>
              Về danh sách hóa đơn
            </button>

            {status === 'DaThanhToan' && (
              <button
                onClick={() => window.print()}
                style={{ flex: 1, padding: '14px 20px', background: '#F8FAFC', color: '#00236F', border: '2px solid #00236F', borderRadius: '14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxSizing: 'border-box', transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
                In hóa đơn
              </button>
            )}

            {(status === 'ThatBai' || status === 'HetHan') && (
              <button
                onClick={() => navigate(orderDetails?.loaiHoaDon === 'DatCoc' ? '/thanh-toan-coc' : '/thanh-toan-dinh-ky')}
                style={{ flex: 1, padding: '14px 20px', background: '#FFF7ED', color: '#C2410C', border: '2px solid #FDBA74', borderRadius: '14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxSizing: 'border-box' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
                Thử thanh toán lại
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '16px', fontSize: '11px', color: '#CBD5E1', flexShrink: 0 }}>
        Cảm ơn bạn đã sử dụng dịch vụ FIT 4.0 HomeStay
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          body { background: white !important; }
          button, .print-hide { display: none !important; }
        }
      `}</style>
    </div>
  );
};
