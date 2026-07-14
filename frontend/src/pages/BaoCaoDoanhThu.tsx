import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Cell
} from 'recharts';

interface SummaryData {
  tongDoanhThu: number;
  phanTramSoVoiThangTruoc: number;
  doanhThuDuKien: number;
  tyLeThuHoiCongNo: number;
}

interface RevenueItem {
  thoigian: string;
  datCoc: number;
  hoaDonDinhKy: number;
  hoaDonDienNuoc: number;
  tong: number;
  trungBinhDong: number;
}

interface BranchItem {
  chiNhanh: string;
  tongDoanhThu: number;
}

export default function BaoCaoDoanhThu() {
  const { user } = useAuth();

  // Filters state
  const [tuNgay, setTuNgay] = useState<string>(
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [denNgay, setDenNgay] = useState<string>(new Date().toISOString().split('T')[0]);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  // Dynamic Options
  const [branches, setBranches] = useState<string[]>([]);

  // Data States
  const [summary, setSummary] = useState<SummaryData>({
    tongDoanhThu: 0,
    phanTramSoVoiThangTruoc: 0,
    doanhThuDuKien: 0,
    tyLeThuHoiCongNo: 100
  });
  const [chartData, setChartData] = useState<RevenueItem[]>([]);
  const [branchData, setBranchData] = useState<BranchItem[]>([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Legend visibility state
  const [visibleSeries, setVisibleSeries] = useState({
    datCoc: true,
    hoaDonDinhKy: true,
    hoaDonDienNuoc: true,
    trungBinhDong: true
  });

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get('/api/doi-soat/chi-nhanh', {
          headers: { 'x-vai-tro': user?.role }
        });
        if (res.data?.success) {
          setBranches(res.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    };
    fetchBranches();
  }, [user?.role]);

  // Load summary and branch data (based on selected month/year calculated from denNgay)
  const fetchSummaryAndBranch = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const targetDate = new Date(denNgay);
      const targetMonth = targetDate.getMonth() + 1;
      const targetYear = targetDate.getFullYear();

      // Summary API
      const summaryRes = await axios.get('/api/bao-cao/summary', {
        params: {
          thang: targetMonth,
          nam: targetYear,
          chiNhanh: selectedBranch || undefined
        },
        headers: { 'x-vai-tro': user?.role }
      });
      if (summaryRes.data?.success) {
        setSummary(summaryRes.data.data);
      }

      // Branch API
      const branchRes = await axios.get('/api/bao-cao/doanh-thu-chi-nhanh', {
        params: {
          thang: targetMonth,
          nam: targetYear
        },
        headers: { 'x-vai-tro': user?.role }
      });
      if (branchRes.data?.success) {
        setBranchData(branchRes.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching summary or branch stats:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [denNgay, selectedBranch, user?.role]);

  // Load Main Chart data
  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/bao-cao/doanh-thu', {
        params: {
          tuNgay,
          denNgay,
          granularity,
          chiNhanh: selectedBranch || undefined
        },
        headers: { 'x-vai-tro': user?.role }
      });
      if (res.data?.success) {
        setChartData(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setLoading(false);
    }
  }, [tuNgay, denNgay, granularity, selectedBranch, user?.role]);

  useEffect(() => {
    fetchSummaryAndBranch();
  }, [fetchSummaryAndBranch]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const handleLegendClick = (o: any) => {
    const { dataKey } = o;
    setVisibleSeries(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey] as any
    }));
  };

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Doanh thu thực tế */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[#54647A]">
            <span className="text-[12px] font-bold uppercase tracking-wider">Tổng doanh thu thực tế</span>
            <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
          </div>
          {summaryLoading ? (
            <div className="h-8 w-32 bg-slate-100 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-extrabold text-[#191C1E]">
              {formatCurrency(summary.tongDoanhThu)}
            </p>
          )}
          <div className="flex items-center gap-1 text-[11px]">
            {summary.phanTramSoVoiThangTruoc >= 0 ? (
              <span className="text-success font-bold flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                {summary.phanTramSoVoiThangTruoc}%
              </span>
            ) : (
              <span className="text-error font-bold flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                {Math.abs(summary.phanTramSoVoiThangTruoc)}%
              </span>
            )}
            <span className="text-secondary">so với tháng trước</span>
          </div>
        </div>

        {/* Doanh thu dự kiến */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[#54647A]">
            <span className="text-[12px] font-bold uppercase tracking-wider">Doanh thu dự kiến</span>
            <span className="material-symbols-outlined text-info text-2xl">event_upcoming</span>
          </div>
          {summaryLoading ? (
            <div className="h-8 w-32 bg-slate-100 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-extrabold text-info">
              {formatCurrency(summary.doanhThuDuKien)}
            </p>
          )}
          <p className="text-[11px] text-secondary">Dự kiến thu từ các hóa đơn chưa thanh toán trong hạn</p>
        </div>

        {/* Tỷ lệ thu hồi công nợ */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[#54647A]">
            <span className="text-[12px] font-bold uppercase tracking-wider">Tỷ lệ thu hồi công nợ</span>
            <span className="material-symbols-outlined text-success text-2xl">assignment_turned_in</span>
          </div>
          {summaryLoading ? (
            <div className="h-8 w-32 bg-slate-100 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-extrabold text-success">{summary.tyLeThuHoiCongNo}%</p>
          )}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-success h-full transition-all duration-500"
              style={{ width: `${summary.tyLeThuHoiCongNo}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter and Date selection bar */}
      <div className="bg-white border border-outline-variant rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Tu Ngay */}
          <div className="w-36 flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-secondary uppercase">Từ ngày</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-outline-variant bg-white rounded-lg focus:outline-none focus:border-primary text-xs"
              value={tuNgay}
              onChange={e => setTuNgay(e.target.value)}
            />
          </div>

          {/* Den Ngay */}
          <div className="w-36 flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-secondary uppercase">Đến ngày</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-outline-variant bg-white rounded-lg focus:outline-none focus:border-primary text-xs"
              value={denNgay}
              onChange={e => setDenNgay(e.target.value)}
            />
          </div>

          {/* Branch Option */}
          <div className="w-48 flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-secondary uppercase">Chi nhánh</label>
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
        </div>

        {/* Granularity Toggle Buttons (D / W / M / Y) */}
        <div className="flex border border-outline-variant rounded-lg overflow-hidden bg-white p-0.5">
          {([
            { key: 'day', label: 'D' },
            { key: 'week', label: 'W' },
            { key: 'month', label: 'M' },
            { key: 'year', label: 'Y' }
          ] as const).map(item => (
            <button
              key={item.key}
              onClick={() => setGranularity(item.key)}
              className={`w-9 h-8 font-bold text-xs rounded transition-all ${
                granularity === item.key
                  ? 'bg-primary text-white'
                  : 'text-secondary hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-h2 font-h2 text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">stacked_bar_chart</span>
          Biến động doanh thu gộp
        </h2>
        <div className="h-96 w-full">
          {loading ? (
            <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl flex items-center justify-center text-xs text-secondary">
              Đang tải biểu đồ dữ liệu...
            </div>
          ) : chartData.length === 0 ? (
            <div className="w-full h-full bg-slate-50 rounded-xl flex flex-col items-center justify-center text-[#54647A] gap-2">
              <span className="material-symbols-outlined text-4xl text-[#C5C5D3]">bar_chart</span>
              <p className="font-semibold text-xs text-[#191C1E]">Không tìm thấy số liệu doanh thu trong kỳ lọc</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
                <XAxis dataKey="thoigian" tickLine={false} tick={{ fontSize: 10, fill: '#54647A' }} />
                <YAxis
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#54647A' }}
                  tickFormatter={val => val.toLocaleString('vi-VN')}
                />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    const mappedName =
                      name === 'datCoc'
                        ? 'Đặt cọc'
                        : name === 'hoaDonDinhKy'
                        ? 'Hợp đồng/Kỳ phí'
                        : name === 'hoaDonDienNuoc'
                        ? 'Điện nước'
                        : 'Trung bình động (MA7)';
                    return [formatCurrency(Number(value)), mappedName];
                  }}
                  labelFormatter={label => `Kỳ hạn: ${label}`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #c5c5d3',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend onClick={handleLegendClick} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                
                {/* 3 Stacked Bars */}
                {visibleSeries.datCoc && (
                  <Bar dataKey="datCoc" stackId="revenue" fill="#1E3A8A">
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        stroke={index === chartData.length - 1 ? '#000000' : 'none'}
                        strokeWidth={index === chartData.length - 1 ? 2 : 0}
                      />
                    ))}
                  </Bar>
                )}
                {visibleSeries.hoaDonDinhKy && (
                  <Bar dataKey="hoaDonDinhKy" stackId="revenue" fill="#10B981">
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        stroke={index === chartData.length - 1 ? '#000000' : 'none'}
                        strokeWidth={index === chartData.length - 1 ? 2 : 0}
                      />
                    ))}
                  </Bar>
                )}
                {visibleSeries.hoaDonDienNuoc && (
                  <Bar dataKey="hoaDonDienNuoc" stackId="revenue" fill="#F59E0B">
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        stroke={index === chartData.length - 1 ? '#000000' : 'none'}
                        strokeWidth={index === chartData.length - 1 ? 2 : 0}
                      />
                    ))}
                  </Bar>
                )}

                {/* Line Overlay for Moving Average */}
                {visibleSeries.trungBinhDong && (
                  <Line
                    type="monotone"
                    dataKey="trungBinhDong"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    dot={false}
                    name="trungBinhDong"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Branch Contribution analysis */}
      <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-h2 font-h2 text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">analytics</span>
          Doanh thu đóng góp theo chi nhánh
        </h2>
        {summaryLoading ? (
          <div className="h-44 w-full bg-slate-50 animate-pulse rounded-xl"></div>
        ) : branchData.length === 0 ? (
          <div className="py-12 text-center text-xs text-secondary bg-slate-50 rounded-xl">
            Không có dữ liệu đóng góp chi nhánh.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Horizontal Bar Chart */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={branchData}
                  layout="vertical"
                  margin={{ top: 10, right: 10, bottom: 10, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" horizontal={false} />
                  <XAxis type="number" tickLine={false} tickFormatter={val => val.toLocaleString('vi-VN')} />
                  <YAxis dataKey="chiNhanh" type="category" tickLine={false} tick={{ fontSize: 10, fill: '#54647A' }} />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Doanh thu']}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                  />
                  <Bar dataKey="tongDoanhThu" fill="#1E3A8A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List breakdown percentage */}
            <div className="space-y-4">
              {branchData.map((item, index) => {
                const totalRev = branchData.reduce((acc, curr) => acc + curr.tongDoanhThu, 0);
                const percent = totalRev > 0 ? Math.round((item.tongDoanhThu / totalRev) * 100) : 0;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#191C1E]">{item.chiNhanh}</span>
                      <span className="text-primary">{formatCurrency(item.tongDoanhThu)} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
