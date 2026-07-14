import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import BaoCaoDoanhThu from './BaoCaoDoanhThu';

interface SummaryData {
  tongDoanhThu: number;
  choThanhToan: {
    soTien: number;
    soLuong: number;
  };
  tyLeDoiSoat: number;
}

export default function DoiSoat() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Guard: if not accountant or admin, show 403 layout
  if (!user || (user.role !== 'KeToan' && user.role !== 'Admin')) {
    return (
      <div className="p-container-padding flex-1 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">
          gpp_bad
        </span>
        <h1 className="font-h1 text-h1 text-error mb-2">Không có quyền truy cập</h1>
        <p className="text-secondary font-body max-w-md">
          Trang này chỉ dành riêng cho vai trò Kế toán hoặc Quản trị viên. Vui lòng liên hệ quản trị viên hoặc quay lại trang chủ.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-[#1E3A8A]/90 active:scale-95 transition-all text-[14px]"
        >
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  // Main mode tab: 'bao-cao' | 'doi-soat'
  const [mainTab, setMainTab] = useState<'bao-cao' | 'doi-soat'>('bao-cao');

  // Active Sub-tab: 'dat-coc' | 'hoa-don-dinh-ky' | 'hoa-don-dien-nuoc'
  const [activeTab, setActiveTab] = useState<'dat-coc' | 'hoa-don-dinh-ky' | 'hoa-don-dien-nuoc'>('dat-coc');

  // Filters State
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // Dynamic Options
  const [branches, setBranches] = useState<string[]>([]);
  
  // Data States
  const [list, setList] = useState<any[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    tongDoanhThu: 0,
    choThanhToan: { soTien: 0, soLuong: 0 },
    tyLeDoiSoat: 0
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  // Status Options based on tab
  const getStatusOptions = () => {
    if (activeTab === 'dat-coc') {
      return [
        { value: 'ChoThanhToan', label: 'Chờ thanh toán' },
        { value: 'ChoXacNhanTienMat', label: 'Chờ xác nhận tiền mặt' },
        { value: 'DaThanhToan', label: 'Đã thanh toán' },
        { value: 'DaHuy', label: 'Đã hủy' }
      ];
    } else {
      return [
        { value: 'ChuaThanhToan', label: 'Chờ thanh toán' },
        { value: 'ChoXacNhanTienMat', label: 'Chờ xác nhận tiền mặt' },
        { value: 'DangCho', label: 'Đang xử lý (PayPal)' },
        { value: 'DaThanhToan', label: 'Đã thanh toán' },
        { value: 'DaHuy', label: 'Đã hủy' }
      ];
    }
  };

  // Fetch branches once
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get('/api/doi-soat/chi-nhanh', {
          headers: { 'x-vai-tro': user.role }
        });
        if (res.data?.success) {
          setBranches(res.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    };
    fetchBranches();
  }, [user.role]);

  // Reset page and filters when tab changes
  useEffect(() => {
    setPage(1);
    setSelectedStatus('');
  }, [activeTab]);

  // Load list data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`/api/doi-soat/${activeTab}`, {
        params: {
          thang: selectedMonth || undefined,
          nam: selectedYear || undefined,
          chiNhanh: selectedBranch || undefined,
          trangThai: selectedStatus || undefined,
          page,
          limit
        },
        headers: { 'x-vai-tro': user.role }
      });
      if (res.data?.success) {
        setList(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đối soát.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedMonth, selectedYear, selectedBranch, selectedStatus, page, user.role]);

  // Load summary data
  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await axios.get('/api/doi-soat/summary', {
        params: {
          loai: activeTab,
          thang: selectedMonth || undefined,
          nam: selectedYear || undefined,
          chiNhanh: selectedBranch || undefined
        },
        headers: { 'x-vai-tro': user.role }
      });
      if (res.data?.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [activeTab, selectedMonth, selectedYear, selectedBranch, user.role]);

  // Trigger loading data on dependency changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Export Excel
  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await axios.get(`/api/doi-soat/${activeTab}/export`, {
        params: {
          thang: selectedMonth || undefined,
          nam: selectedYear || undefined,
          chiNhanh: selectedBranch || undefined,
          trangThai: selectedStatus || undefined
        },
        headers: { 'x-vai-tro': user.role },
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `doi-soat-${activeTab}-thang${selectedMonth || 'all'}-${selectedYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export Excel failed:', err);
      alert('Không thể xuất file Excel báo cáo.');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  // Badge styles
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'DaThanhToan':
        return 'bg-success/10 text-success border border-success/30';
      case 'DaHuy':
        return 'bg-slate-100 text-[#54647A] border border-slate-200';
      case 'ChoXacNhanTienMat':
        return 'bg-warning/10 text-warning border border-warning/30';
      case 'ChoThanhToan':
      case 'DangCho':
      case 'ChuaThanhToan':
      default:
        return 'bg-orange-100 text-orange-700 border border-orange-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DaThanhToan': return 'Đã hoàn tất';
      case 'DaHuy': return 'Đã hủy';
      case 'ChoXacNhanTienMat': return 'Chờ xác nhận';
      case 'ChoThanhToan':
      case 'DangCho':
      case 'ChuaThanhToan':
      default: return 'Chờ thanh toán';
    }
  };

  // Pagination bounds
  const startRange = (page - 1) * limit + 1;
  const endRange = Math.min(page * limit, total);

  return (
    <div className="p-container-padding flex-1 flex flex-col gap-6">
      {/* Header Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-h1 text-h1 text-primary">Quản Lý Tài Chính - FIT 4.0</h1>
          <p className="text-secondary font-body mt-1">Báo cáo doanh thu và đối soát dòng tiền định kỳ.</p>
        </div>
        {mainTab === 'doi-soat' && (
          <button
            onClick={handleExport}
            disabled={exporting || list.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-success hover:bg-success/95 text-white font-bold rounded-lg shadow-sm active:scale-95 disabled:opacity-50 transition-all text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            {exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
          </button>
        )}
      </div>

      {/* Main Mode Tabs */}
      <div className="flex border-b border-outline-variant gap-6">
        <button
          onClick={() => setMainTab('bao-cao')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            mainTab === 'bao-cao'
              ? 'border-primary text-primary'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Báo cáo doanh thu
        </button>
        <button
          onClick={() => setMainTab('doi-soat')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            mainTab === 'doi-soat'
              ? 'border-primary text-primary'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Đối soát dòng tiền
        </button>
      </div>

      {mainTab === 'bao-cao' ? (
        <BaoCaoDoanhThu />
      ) : (
        <>
          {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Doanh thu */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[#54647A]">
            <span className="text-[12px] font-bold uppercase tracking-wider">Tổng doanh thu thực nhận</span>
            <span className="material-symbols-outlined text-primary text-2xl">insights</span>
          </div>
          {summaryLoading ? (
            <div className="h-8 w-32 bg-slate-100 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-extrabold text-[#191C1E]">{formatCurrency(summary.tongDoanhThu)}</p>
          )}
          <p className="text-[11px] text-secondary">Doanh thu đã thanh toán thành công trong kỳ</p>
        </div>

        {/* Chờ thanh toán */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[#54647A]">
            <span className="text-[12px] font-bold uppercase tracking-wider">Chờ thanh toán</span>
            <span className="material-symbols-outlined text-warning text-2xl">pending_actions</span>
          </div>
          {summaryLoading ? (
            <div className="h-8 w-32 bg-slate-100 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-extrabold text-warning">
              {formatCurrency(summary.choThanhToan.soTien)}
            </p>
          )}
          <p className="text-[11px] text-secondary">
            Gồm {summary.choThanhToan.soLuong} khoản đang chờ/chưa thanh toán
          </p>
        </div>

        {/* Tỷ lệ đối soát */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[#54647A]">
            <span className="text-[12px] font-bold uppercase tracking-wider">Tỷ lệ đối soát</span>
            <span className="material-symbols-outlined text-success text-2xl">assignment_turned_in</span>
          </div>
          {summaryLoading ? (
            <div className="h-8 w-32 bg-slate-100 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-extrabold text-success">{summary.tyLeDoiSoat}%</p>
          )}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-success h-full transition-all duration-500" 
              style={{ width: `${summary.tyLeDoiSoat}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-outline-variant gap-6">
        {([
          { key: 'dat-coc', label: 'Đặt cọc' },
          { key: 'hoa-don-dinh-ky', label: 'Hóa đơn định kỳ' },
          { key: 'hoa-don-dien-nuoc', label: 'Hóa đơn điện nước' }
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-outline-variant rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-end">
        {/* Month */}
        <div className="w-28 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-secondary uppercase">Tháng</label>
          <select
            className="w-full px-3 py-2 border border-outline-variant bg-white rounded-lg focus:outline-none focus:border-primary text-xs"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            <option value="">Tất cả</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{`Tháng ${i + 1}`}</option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="w-24 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-secondary uppercase">Năm</label>
          <select
            className="w-full px-3 py-2 border border-outline-variant bg-white rounded-lg focus:outline-none focus:border-primary text-xs"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>

        {/* Branch */}
        <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-secondary uppercase">Tòa nhà / Chi nhánh</label>
          <select
            className="w-full px-3 py-2 border border-outline-variant bg-white rounded-lg focus:outline-none focus:border-primary text-xs"
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
          >
            <option value="">Tất cả chi nhánh</option>
            {branches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="w-48 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-secondary uppercase">Trạng thái</label>
          <select
            className="w-full px-3 py-2 border border-outline-variant bg-white rounded-lg focus:outline-none focus:border-primary text-xs"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {getStatusOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col justify-between">
        <div className="overflow-x-auto">
          {loading ? (
            /* Skeleton Table */
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F7F9FB] border-b border-outline-variant">
                <tr>
                  <th className="px-5 py-4 w-28"></th>
                  <th className="px-5 py-4 w-48"></th>
                  <th className="px-5 py-4"></th>
                  <th className="px-5 py-4 w-32"></th>
                  <th className="px-5 py-4 w-36"></th>
                  <th className="px-5 py-4 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-outline-variant animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                    <td className="px-5 py-4"><div className="h-6 bg-slate-100 rounded-full w-24"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-6"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : list.length === 0 ? (
            /* Empty state */
            <div className="p-16 text-center flex flex-col items-center gap-4 text-[#54647A]">
              <span className="material-symbols-outlined text-5xl text-[#C5C5D3]">receipt_long</span>
              <div>
                <p className="font-semibold text-[15px] text-[#191C1E]">Không tìm thấy dữ liệu đối soát</p>
                <p className="text-xs text-secondary mt-1">Vui lòng điều chỉnh lại bộ lọc tháng, chi nhánh hoặc trạng thái.</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F7F9FB] border-b border-outline-variant text-[11px] font-bold text-[#54647A] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Mã giao dịch</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Chi nhánh</th>
                  {activeTab === 'dat-coc' && <th className="px-5 py-4">Phòng</th>}
                  {activeTab === 'hoa-don-dinh-ky' && (
                    <>
                      <th className="px-5 py-4">Hợp đồng</th>
                      <th className="px-5 py-4">Kỳ phí</th>
                    </>
                  )}
                  {activeTab === 'hoa-don-dien-nuoc' && (
                    <>
                      <th className="px-5 py-4">Phòng</th>
                      <th className="px-5 py-4">Chỉ số Điện / Nước</th>
                      <th className="px-5 py-4">Kỳ phí</th>
                    </>
                  )}
                  <th className="px-5 py-4 text-right">Số tiền</th>
                  <th className="px-5 py-4">Thời gian</th>
                  <th className="px-5 py-4 text-center">Trạng thái</th>
                  <th className="px-5 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-[14px] font-body text-[#191C1E]">
                {list.map(item => {
                  const badge = getBadgeStyle(item.trangthai);
                  const displayId = activeTab === 'dat-coc' ? item.macoc : activeTab === 'hoa-don-dinh-ky' ? item.mapdk : item.mahddn;
                  const paymentDate = activeTab === 'dat-coc' ? item.thoigiantao : item.ngaytao;

                  return (
                    <tr key={displayId} className="border-b border-[#E0E3E5] hover:bg-slate-50 transition-colors">
                      {/* Mã GD */}
                      <td className="px-5 py-4 font-semibold text-primary">
                        {item.magiaodich || item.madh || `HD#${displayId}`}
                      </td>
                      
                      {/* Khách hàng */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-fixed text-[#00164e] font-extrabold flex items-center justify-center text-xs">
                            {item.avatar ? (
                              <img src={item.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              (item.hoten || 'U').substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <span className="font-medium">{item.hoten || 'Khách thuê'}</span>
                        </div>
                      </td>

                      {/* Chi nhánh */}
                      <td className="px-5 py-4 text-secondary">{item.chinhanh || '—'}</td>

                      {/* Columns conditional */}
                      {activeTab === 'dat-coc' && (
                        <td className="px-5 py-4 font-semibold">{item.tenphong || '—'}</td>
                      )}
                      {activeTab === 'hoa-don-dinh-ky' && (
                        <>
                          <td className="px-5 py-4 font-medium text-secondary">#{item.mahd}</td>
                          <td className="px-5 py-4 font-medium">{item.thang}</td>
                        </>
                      )}
                      {activeTab === 'hoa-don-dien-nuoc' && (
                        <>
                          <td className="px-5 py-4 font-semibold">{item.tenphong || '—'}</td>
                          <td className="px-5 py-4 text-xs space-y-0.5 text-secondary">
                            <div>⚡ Điện: <span className="font-bold text-[#191C1E]">{item.csdiencu} ➔ {item.csdienmoi}</span></div>
                            <div>💧 Nước: <span className="font-bold text-[#191C1E]">{item.csnuoccu} ➔ {item.csnuocmoi}</span></div>
                          </td>
                          <td className="px-5 py-4 font-medium">{item.thang}</td>
                        </>
                      )}

                      {/* Số tiền */}
                      <td className="px-5 py-4 text-right font-bold text-primary">
                        {formatCurrency(Number(item.sotien || item.tongtien))}
                      </td>

                      {/* Thời gian */}
                      <td className="px-5 py-4 text-secondary text-xs">
                        {formatDate(paymentDate)}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${badge}`}>
                          {getStatusText(item.trangthai)}
                        </span>
                      </td>

                      {/* Hành động */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => {
                            if (activeTab === 'dat-coc') {
                              // Tách cổng: admin chạy cổng 5174, client chạy 5173. 
                              // Để xem kết quả cọc, chuyển hướng sang cổng client 5173
                              window.open(`http://localhost:5173/ket-qua-dat-coc/${item.macoc}`, '_blank');
                            } else {
                              navigate(`/doi-soat/${activeTab}/${displayId}`);
                            }
                          }}
                          className="material-symbols-outlined text-secondary hover:text-primary transition-colors cursor-pointer text-lg"
                        >
                          visibility
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controller */}
        {total > 0 && (
          <div className="p-4 border-t border-outline-variant bg-[#F7F9FB] flex justify-between items-center text-xs text-secondary font-medium">
            <span>
              Hiển thị {startRange}-{endRange} trên tổng số {total} giao dịch
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white border border-outline-variant hover:bg-slate-50 text-secondary font-bold rounded-lg disabled:opacity-50 transition"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={endRange >= total}
                className="px-3 py-1.5 bg-white border border-outline-variant hover:bg-slate-50 text-secondary font-bold rounded-lg disabled:opacity-50 transition"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
