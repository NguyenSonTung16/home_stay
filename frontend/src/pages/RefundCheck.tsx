import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RefundCheck: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [records, setRecords] = useState([
    { id: 'HD-9999', name: 'Nguyễn Văn A', date: '20/10/2023', status: 'Chờ duyệt' },
    { id: 'HD-8821', name: 'Trần Thị B', date: '18/10/2023', status: 'Đã hoàn tất' }
  ]);

  const [chiPhiDoiSoat, setChiPhiDoiSoat] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      axios.get('/api/finance/hoan-coc/cho-doi-soat').then(res => {
        if (res.data.success && res.data.data.length > 0) {
          const newRecords = res.data.data.map((row: any) => ({
            id: `HD-${row.mahd || row.MaHD}`,
            name: row.hoten || row.HoTen,
            date: '20/10/2023', // Demo date
            status: row.trangthai === 1 ? 'Chờ duyệt' : (row.trangthai === 5 ? 'Chờ thu thêm' : 'Đã hoàn tất'),
            statusCode: row.trangthai
          }));
          setRecords(newRecords);

        } else {
          setRecords([]);
        }
      }).catch(err => console.error('Lỗi tải danh sách chờ hoàn cọc:', err));
    };

    fetchData(); // Fetch initial data
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (expandedId) {
      const maHDNumber = parseInt(expandedId.replace('HD-', ''));
      axios.get(`/api/finance/hoan-coc/chi-phi/${maHDNumber}`).then(res => {
        if (res.data.success) {
          setChiPhiDoiSoat(res.data.data);
        }
      }).catch(err => {
        console.error('Lỗi lấy chi phí:', err);
        setChiPhiDoiSoat(null);
      });
    }
  }, [expandedId]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredRecords = records.filter((record: any) => {
    const matchStatus = filterStatus === null || record.statusCode === filterStatus;
    const matchSearch = record.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <section className="p-container-padding flex-1 overflow-y-auto">
      <div className="mb-8">
        <h1 className="font-h1 text-h1 text-primary mb-2">
          Danh sách đơn duyệt hoàn cọc
        </h1>
        <p className="text-secondary">
          Quản lý và phê duyệt các yêu cầu hoàn trả tiền cọc từ khách thuê.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary outline-none text-body transition-all"
              placeholder="Tìm kiếm mã HĐ..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption font-bold text-secondary uppercase tracking-wider">
              Trạng thái:
            </span>
            <select
              className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-body focus:ring-2 focus:ring-primary-container focus:border-primary outline-none"
              value={filterStatus === null ? 'all' : filterStatus}
              onChange={(e) => setFilterStatus(e.target.value === 'all' ? null : Number(e.target.value))}
            >
              <option value="all">Tất cả</option>
              <option value="1">Chờ duyệt</option>
              <option value="5">Chờ thu thêm</option>
              <option value="2">Đã hoàn tất</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-caption font-bold text-secondary uppercase tracking-wider">
            Ngày yêu cầu:
          </span>
          <div className="flex items-center bg-white border border-outline-variant rounded-lg px-3 py-2 gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              calendar_today
            </span>
            <input
              className="bg-transparent border-none p-0 focus:ring-0 text-body w-40 outline-none"
              placeholder="Chọn khoảng ngày"
              type="text"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="p-4 font-label text-secondary uppercase tracking-wider">
                Mã HĐ
              </th>
              <th className="p-4 font-label text-secondary uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="p-4 font-label text-secondary uppercase tracking-wider">
                Ngày yêu cầu
              </th>
              <th className="p-4 font-label text-secondary uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="p-4 font-label text-secondary uppercase tracking-wider text-right">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filteredRecords.map((record: any) => (
              <React.Fragment key={record.id}>
                <tr
                  className="hover:bg-surface-container-lowest transition-colors cursor-pointer"
                  onClick={() => toggleExpand(record.id)}
                >
                  <td className="p-4 font-bold text-primary">{record.id}</td>
                  <td className="p-4">{record.name}</td>
                  <td className="p-4">{record.date}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-caption font-bold ${record.statusCode === 2
                        ? 'bg-success/20 text-success'
                        : (record.statusCode === 5 ? 'bg-error/20 text-error' : 'bg-secondary-container text-on-secondary-container')
                      }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="material-symbols-outlined text-secondary">
                      {expandedId === record.id ? 'expand_less' : 'expand_more'}
                    </span>
                  </td>
                </tr>

                {expandedId === record.id && (
                  <tr>
                    <td className="p-6 bg-surface-container-low" colSpan={5}>
                      <div className="max-w-4xl mx-auto space-y-6">
                        <div className="bg-white rounded-lg border border-outline-variant shadow-sm overflow-hidden">
                          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface">
                            <h3 className="font-h2 text-body font-bold">
                              Chi tiết đối soát tài chính
                            </h3>
                            <span className="text-[10px] text-secondary font-bold bg-surface-container px-2 py-0.5 rounded uppercase tracking-widest">
                              System Calculated
                            </span>
                          </div>
                          <div className="divide-y divide-outline-variant">
                            <div className="grid grid-cols-2 p-4">
                              <span className="text-secondary">Tiền cọc gốc</span>
                              <span className="text-right font-bold">
                                {chiPhiDoiSoat ? (chiPhiDoiSoat.tienCoc || 0).toLocaleString() : 0}đ
                              </span>
                            </div>
                            <div className="grid grid-cols-2 p-4">
                              <span className="text-secondary">
                                Tiền hoàn định mức ({chiPhiDoiSoat ? chiPhiDoiSoat.tyLeHoanCoc : 0}%)
                              </span>
                              <span className="text-right font-bold text-primary">
                                {chiPhiDoiSoat ? (chiPhiDoiSoat.tienHoanDinhMuc || 0).toLocaleString() : 0}đ
                              </span>
                            </div>
                            <div className="grid grid-cols-2 p-4">
                              <span className="text-secondary">
                                Tiền điện nước nợ
                              </span>
                              <span className="text-right font-bold text-error">
                                -0đ
                              </span>
                            </div>
                            <div className="grid grid-cols-2 p-4">
                              <span className="text-secondary">
                                Chi phí đền bù hư hỏng & vệ sinh
                              </span>
                              <span className="text-right font-bold text-error">
                                -{chiPhiDoiSoat ? ((chiPhiDoiSoat.tongKhauTru || 0) - (chiPhiDoiSoat.phiPhatBaoTre || 0)).toLocaleString() : 0}đ
                              </span>
                            </div>
                            {chiPhiDoiSoat && chiPhiDoiSoat.phiPhatBaoTre > 0 && (
                              <div className="grid grid-cols-2 p-4 bg-error/10">
                                <span className="font-bold text-error flex items-center gap-2">
                                  <span className="material-symbols-outlined text-sm">warning</span>
                                  Phí phạt báo trả phòng trễ (25%)
                                </span>
                                <span className="text-right font-bold text-error">
                                  -{chiPhiDoiSoat.phiPhatBaoTre.toLocaleString()}đ
                                </span>
                              </div>
                            )}
                            <div className="grid grid-cols-2 p-4 bg-primary-fixed/30">
                              <span className="font-bold">Số dư thực tế</span>
                              <span className="text-right font-h2 text-primary">
                                {chiPhiDoiSoat ? (chiPhiDoiSoat.thucNhanChi || 0).toLocaleString() : 0}đ
                              </span>
                            </div>
                          </div>
                        </div>

                        {chiPhiDoiSoat && chiPhiDoiSoat.thucNhanChi > 0 && (
                          <div className="bg-success/10 border border-success/30 rounded-lg p-6 flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-success mb-1 text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined">payments</span>
                                Phiếu Hoàn Cọc
                              </h4>
                              <p className="text-sm text-success/80">Hệ thống ghi nhận cần hoàn trả tiền cọc thừa cho khách thuê.</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-success/80 font-bold block mb-1">Số tiền cần chuyển trả:</span>
                              <span className="font-bold text-2xl text-success">
                                {chiPhiDoiSoat.thucNhanChi.toLocaleString()}đ
                              </span>
                            </div>
                          </div>
                        )}

                        {chiPhiDoiSoat && chiPhiDoiSoat.thucNhanChi < 0 && (
                          <div className="bg-error/10 border border-error/30 rounded-lg p-6 flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-error mb-1 text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined">request_quote</span>
                                Phiếu Thu Thêm
                              </h4>
                              <p className="text-sm text-error/80">Hệ thống ghi nhận tiền cọc không đủ bù đắp chi phí phát sinh. Khách cần đóng thêm khoản tiền này qua chuyển khoản hoặc tiền mặt.</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-error/80 font-bold block mb-1">Số tiền khách cần nộp:</span>
                              <span className="font-bold text-2xl text-error">
                                {Math.abs(chiPhiDoiSoat.thucNhanChi).toLocaleString()}đ
                              </span>
                            </div>
                          </div>
                        )}

                        {chiPhiDoiSoat && chiPhiDoiSoat.thucNhanChi === 0 && (
                          <div className="bg-secondary-container/30 border border-outline-variant rounded-lg p-6 text-center">
                            <h4 className="font-bold text-secondary mb-1 text-lg flex items-center justify-center gap-2">
                              <span className="material-symbols-outlined">done_all</span>
                              Đã Tất Toán
                            </h4>
                            <p className="text-sm text-secondary">Khoản tiền cọc vừa đủ để bù đắp các chi phí phát sinh. Không cần thu thêm hay hoàn trả.</p>
                          </div>
                        )}

                        <div className="flex justify-end gap-3">
                          {record.statusCode === 1 && (
                            <button
                              className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                              disabled={isProcessing}
                              onClick={() => {
                                setIsProcessing(true);
                                const maHDNumber = parseInt(record.id.replace('HD-', ''));
                                axios.post('/api/finance/hoan-coc/phe-duyet', {
                                  maHD: maHDNumber
                                }).then(() => {
                                  alert(chiPhiDoiSoat.thucNhanChi < 0 ? 'Chốt công nợ thành công! Chờ khách thanh toán.' : 'Phê duyệt thành công! Tiền cọc đang được xử lý qua PayPal.');
                                  // Cập nhật trạng thái
                                  const newRecords = records.map((r: any) =>
                                    r.id === record.id ? {
                                      ...r,
                                      statusCode: chiPhiDoiSoat.thucNhanChi < 0 ? 5 : 2,
                                      status: chiPhiDoiSoat.thucNhanChi < 0 ? 'Chờ thu thêm' : 'Đã hoàn tất'
                                    } : r
                                  );
                                  setRecords(newRecords);
                                }).catch((err) => {
                                  alert('Lỗi từ Server: ' + (err.response?.data?.message || err.message));
                                }).finally(() => {
                                  setIsProcessing(false);
                                });
                              }}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {chiPhiDoiSoat && chiPhiDoiSoat.thucNhanChi < 0 ? 'gavel' : 'verified_user'}
                              </span>{' '}
                              {isProcessing
                                ? 'Đang xử lý...'
                                : (chiPhiDoiSoat && chiPhiDoiSoat.thucNhanChi < 0 ? 'Chốt công nợ & Chờ thu' : 'Phê duyệt')}
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {records.length === 0 && (
              <tr>
                <td className="p-8 text-center text-secondary" colSpan={5}>
                  <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                  <p>Tất cả phiếu đã được xử lý</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RefundCheck;
