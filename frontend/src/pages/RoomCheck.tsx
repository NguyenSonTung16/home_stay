import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoomCheck: React.FC = () => {
  const [records, setRecords] = useState([
    { id: 'HD-9999', room: 'P.102', name: 'Nguyễn Văn A' },
    { id: 'HD-8821', room: 'P.205', name: 'Trần Thị B' },
    { id: 'HD-7742', room: 'P.401', name: 'Lê Văn C' },
  ]);
  const [activeRecord, setActiveRecord] = useState<string | null>(null);
  const [cleaningItems, setCleaningItems] = useState([
    { id: 'c1', name: 'Vệ sinh sàn/tường', status: 'clean', severity: 0 },
    { id: 'c2', name: 'Vệ sinh Toilet', status: 'clean', severity: 0 },
    { id: 'c3', name: 'Dọn rác/đồ thừa', status: 'clean', severity: 0 },
    { id: 'c4', name: 'Khử mùi/diệt khuẩn', status: 'clean', severity: 0 },
  ]);
  const cleaningCost = cleaningItems.reduce((acc, curr) => acc + Number(curr.severity || 0), 0);
  const [keyReturned, setKeyReturned] = useState(false);
  const [signed, setSigned] = useState(false);
  const [isEquipmentExpanded, setIsEquipmentExpanded] = useState(true);
  const [isCleaningExpanded, setIsCleaningExpanded] = useState(true);
  const [isComplainMode, setIsComplainMode] = useState(false);
  const [complainReason, setComplainReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = records.filter((r: any) => {
    const matchStatus = filterStatus === null || r.trangthai === filterStatus;
    const matchSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const activeRecordData = records.find((r: any) => r.id === activeRecord);
  const currentStatus = Number(activeRecordData?.trangthai || 1);

  useEffect(() => {
    const fetchData = () => {
      axios.get('/api/finance/tra-phong/cho-tra-phong').then(res => {
        if (res.data.success && res.data.data.length > 0) {
          const newRecords = res.data.data.map((row: any) => ({
            id: `HD-${row.mahd || row.MaHD}`,
            room: row.tenphong || row.TenPhong || 'P.102',
            name: row.hoten || row.HoTen,
            date: row.ngaydukien || row.NgayDuKien,
            trangthai: Number(row.trangthai || row.TrangThai || 1)
          }));
          setRecords(newRecords);
          
          setActiveRecord((prev) => {
            // Nếu chưa có activeRecord hoặc record hiện tại không còn trong list, chọn cái đầu tiên
            if (!prev || !newRecords.find((r: any) => r.id === prev)) {
              return newRecords[0].id;
            }
            return prev;
          });
        } else {
          setRecords([]);
        }
      }).catch(err => console.error('Lỗi tải danh sách chờ trả phòng:', err));
    };

    fetchData(); // Gọi ngay lần đầu
    const interval = setInterval(fetchData, 10000); // Polling 10s

    return () => clearInterval(interval);
  }, []);

  const [items, setItems] = useState([
    { id: 1, name: 'Giường', status: 'damaged', severity: 1000000 },
    { id: 2, name: 'Tủ', status: 'good', severity: 0 },
    { id: 3, name: 'Điều hòa', status: 'good', severity: 0 },
  ]);

  const defaultItems = [
    { id: 1, name: 'Giường', status: 'good', severity: 0 },
    { id: 2, name: 'Tủ', status: 'good', severity: 0 },
    { id: 3, name: 'Điều hòa', status: 'good', severity: 0 },
  ];

  const defaultCleaning = [
    { id: 'c1', name: 'Vệ sinh sàn/tường', status: 'clean', severity: 0 },
    { id: 'c2', name: 'Vệ sinh Toilet', status: 'clean', severity: 0 },
    { id: 'c3', name: 'Dọn rác/đồ thừa', status: 'clean', severity: 0 },
    { id: 'c4', name: 'Khử mùi/diệt khuẩn', status: 'clean', severity: 0 },
  ];

  const handleSelectRecord = (id: string) => {
    setActiveRecord(id);
  };

  useEffect(() => {
    if (!activeRecord) return;
    const maHDNumber = parseInt(activeRecord.replace('HD-', ''));
    axios.get(`/api/finance/tra-phong/thong-tin-thue/${maHDNumber}`).then(res => {
      if (res.data.success && res.data.data) {
        const { phieuKiemTra } = res.data.data;
        if (phieuKiemTra) {
          try {
            const parsedItems = JSON.parse(phieuKiemTra.chitiethuhong || phieuKiemTra.ChiTietHuHong || '[]');
            if (parsedItems.length > 0) setItems(parsedItems);
            else setItems(defaultItems);
          } catch (e) {
            setItems(defaultItems);
          }
          setKeyReturned(phieuKiemTra.thuhoikhoa || phieuKiemTra.ThuHoiKhoa || false);
          setSigned(phieuKiemTra.kybienban || phieuKiemTra.KyBienBan || false);
          
          const pvs = Number(phieuKiemTra.phivesinh || phieuKiemTra.PhiVeSinh || 0);
          if (pvs > 0) {
            setCleaningItems(defaultCleaning.map((item, index) => 
              index === 0 ? { ...item, status: 'dirty', severity: pvs } : item
            ));
          } else {
            setCleaningItems(defaultCleaning);
          }
        } else {
          setItems(defaultItems);
          setCleaningItems(defaultCleaning);
          setKeyReturned(false);
          setSigned(false);
        }
      }
    });
    setIsComplainMode(false);
    setComplainReason('');
  }, [activeRecord]);

  const handleStatusChange = (id: number, status: string) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status,
            severity: status === 'damaged' ? (item.severity || 100000) : 0,
          };
        }
        return item;
      })
    );
  };

  const handleSeverityChange = (id: number, severity: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, severity };
        }
        return item;
      })
    );
  };

  const handleCleaningStatusChange = (id: string, status: string) => {
    setCleaningItems(
      cleaningItems.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status,
            severity: status === 'dirty' ? (item.severity || 100000) : 0,
          };
        }
        return item;
      })
    );
  };

  const handleCleaningSeverityChange = (id: string, severity: number) => {
    setCleaningItems(
      cleaningItems.map((item) => {
        if (item.id === id) {
          return { ...item, severity };
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    let total = Number(cleaningCost);
    items.forEach((item) => {
      total += Number(item.severity || 0);
    });
    return total;
  };

  const canConfirm = keyReturned && signed;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* MASTER LIST (30%) */}
      <aside className="w-[30%] border-r border-outline-variant bg-white flex flex-col overflow-y-auto hide-scrollbar">
        <div className="p-6 border-b border-outline-variant bg-surface-container-low sticky top-0 z-10 flex flex-col gap-4">
          <h2 className="font-h2 text-h2 text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">format_list_bulleted</span>
            Danh sách trả phòng
          </h2>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary text-sm">
                search
              </span>
              <input
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-outline-variant rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm text-body transition-all"
                placeholder="Tìm kiếm mã HĐ..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-label font-bold text-secondary text-sm tracking-wider uppercase">
                Trạng thái:
              </span>
              <select
                className="border border-outline-variant rounded-md px-3 py-1.5 text-sm font-body text-primary focus:outline-none focus:border-primary flex-1 bg-white cursor-pointer"
                value={filterStatus === null ? 'all' : filterStatus}
                onChange={(e) => setFilterStatus(e.target.value === 'all' ? null : Number(e.target.value))}
              >
                <option value="all">Tất cả</option>
                <option value="1">Chờ kiểm kê</option>
                <option value="3">Đang tranh chấp</option>
                <option value="2">Đã hoàn tất</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex-1 divide-y divide-outline-variant">
          {filteredRecords.map((record: any) => (
            <button
              key={record.id}
              className={`w-full text-left p-4 hover:bg-surface-container-low transition-colors ${
                activeRecord === record.id ? 'active-master-item' : ''
              }`}
              onClick={() => handleSelectRecord(record.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-primary">
                  {record.room} - {record.id}
                </span>
                {record.trangthai === 1 && <span className="px-2 py-0.5 bg-secondary-container text-primary text-[10px] rounded font-bold uppercase">Chờ kiểm kê</span>}
                {record.trangthai === 2 && <span className="px-2 py-0.5 bg-success/20 text-success text-[10px] rounded font-bold uppercase">Đã hoàn tất</span>}
                {record.trangthai === 3 && <span className="px-2 py-0.5 bg-error/20 text-error text-[10px] rounded font-bold uppercase">Đang tranh chấp</span>}
              </div>
              <div className="flex items-center justify-between text-secondary mt-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">person</span>
                  <span className="font-body text-sm">{record.name}</span>
                </div>
                {record.date && (
                  <div className="flex items-center gap-1 text-[11px] bg-surface-container px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[12px]">calendar_clock</span>
                    <span>{new Date(record.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
          {records.length === 0 && (
            <div className="p-8 text-center text-secondary">
              Không có yêu cầu trả phòng nào.
            </div>
          )}
        </div>
      </aside>

      {/* DETAIL FORM (70%) */}
      <section className="flex-1 overflow-y-auto p-container-padding">
        {!activeRecord ? (
          <div className="flex flex-col items-center justify-center h-full text-secondary opacity-50">
             <span className="material-symbols-outlined text-6xl mb-4">inventory_2</span>
             <p className="font-h2 text-h2">Không có phiếu nào cần xử lý</p>
          </div>
        ) : isComplainMode ? (
          <>
            <div className="mb-8">
              <h1 className="font-h1 text-h1 text-primary mb-2">
                Phiếu khiếu nại
              </h1>
              <p className="text-secondary font-body">
                Ghi nhận thông tin khiếu nại về tình trạng phòng và thiết bị.
              </p>
            </div>

            {/* INFO BLOCK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-md">
              <div className="bg-primary text-white p-6 rounded-xl shadow-md flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">
                    description
                  </span>
                </div>
                <div>
                  <p className="font-label text-white/70">Mã HĐ</p>
                  <p className="font-h2 text-h2 text-white">{activeRecord}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
                <div className="bg-surface-container p-3 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">person</span>
                </div>
                <div>
                  <p className="font-label text-secondary">Khách thuê</p>
                  <p className="font-h2 text-h2 font-bold text-primary">
                    {activeRecord === 'HD-9999'
                      ? 'Nguyễn Văn A'
                      : activeRecord === 'HD-8821'
                      ? 'Trần Thị B'
                      : 'Lê Văn C'}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
                <div className="bg-surface-container p-3 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">
                    meeting_room
                  </span>
                </div>
                <div>
                  <p className="font-label text-secondary">Phòng</p>
                  <p className="font-h2 text-h2 font-bold text-primary">
                    {activeRecord === 'HD-9999'
                      ? 'P.102'
                      : activeRecord === 'HD-8821'
                      ? 'P.205'
                      : 'P.401'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm mb-stack-md">
              <h3 className="font-h3 text-h3 text-primary mb-4">Nguyên nhân khiếu nại</h3>
              <textarea
                className="w-full h-32 p-4 border border-outline-variant rounded-lg focus:ring-primary focus:border-primary outline-none resize-none font-body"
                placeholder="Nhập chi tiết nội dung khiếu nại..."
                value={complainReason}
                onChange={(e) => setComplainReason(e.target.value)}
              ></textarea>
            </div>



            <div className="flex justify-center md:justify-end gap-stack-md pb-8">
              <button
                className="px-8 py-3 rounded-lg font-bold shadow-sm transition-all border border-outline-variant text-secondary bg-white hover:bg-surface-container-lowest"
                onClick={() => setIsComplainMode(false)}
              >
                Quay lại
              </button>
              <button
                className="px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all bg-primary text-white hover:opacity-90"
                onClick={() => {
                  if (!complainReason.trim()) {
                    alert('Vui lòng nhập nguyên nhân khiếu nại!');
                    return;
                  }
                  const maHDNumber = parseInt(activeRecord.replace('HD-', ''));
                  axios.post('/api/finance/tra-phong/khieu-nai', {
                    maHD: maHDNumber,
                    lyDo: complainReason
                  }).then(res => {
                    alert('Đã chuyển hồ sơ sang trạng thái Tranh chấp!');
                    setIsComplainMode(false);
                    // Cập nhật state nội bộ
                    setRecords(records.map(r => r.id === activeRecord ? { ...r, trangthai: 3 } : r));
                  }).catch(err => {
                    alert('Lỗi: ' + (err.response?.data?.message || err.message));
                  });
                }}
              >
                <span className="material-symbols-outlined">send</span>
                Gửi khiếu nại
              </button>
            </div>
          </>
        ) : (
          <>
        <div className="mb-8">
          <h1 className="font-h1 text-h1 text-primary mb-2">
            Kiểm Tra Phòng & Lưu Trú
          </h1>
          <p className="text-secondary font-body">
            Kiểm tra tình trạng bàn giao thiết bị và hoàn tất thủ tục trả phòng cho
            khách thuê.
          </p>
        </div>

        {/* INFO BLOCK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-md">
          <div className="bg-primary-container text-white p-6 rounded-xl shadow-md flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <span className="material-symbols-outlined text-white">
                description
              </span>
            </div>
            <div>
              <p className="font-label text-white/70">Mã HĐ</p>
              <p className="font-h2 text-h2">{activeRecord}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="bg-surface-container p-3 rounded-lg">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div>
              <p className="font-label text-secondary">Khách thuê</p>
              <p className="font-h2 text-h2">
                {activeRecord === 'HD-9999'
                  ? 'Nguyễn Văn A'
                  : activeRecord === 'HD-8821'
                  ? 'Trần Thị B'
                  : 'Lê Văn C'}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="bg-surface-container p-3 rounded-lg">
              <span className="material-symbols-outlined text-primary">
                meeting_room
              </span>
            </div>
            <div>
              <p className="font-label text-secondary">Phòng</p>
              <p className="font-h2 text-h2">
                {activeRecord === 'HD-9999'
                  ? 'P.102'
                  : activeRecord === 'HD-8821'
                  ? 'P.205'
                  : 'P.401'}
              </p>
            </div>
          </div>
        </div>

        {/* SURVEY TABLE */}
        <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden mb-stack-md">
          <div 
            className="p-6 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center cursor-pointer hover:bg-surface-container-low transition-colors"
            onClick={() => setIsEquipmentExpanded(!isEquipmentExpanded)}
          >
            <h2 className="font-h2 text-h2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                inventory
              </span>
              Kiểm kê thiết bị bàn giao
            </h2>
            <span className="material-symbols-outlined text-secondary">
              {isEquipmentExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </div>
          {isEquipmentExpanded && (
          <table className="w-full text-left">
            <thead className="bg-surface-container-low font-label text-secondary uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Thiết bị</th>
                <th className="px-6 py-4">Tình trạng</th>
                <th className="px-6 py-4">Mức độ thiệt hại</th>
                <th className="px-6 py-4 text-right">Đơn giá đền bù (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-surface-container-lowest transition-colors"
                >
                  <td className="px-6 py-4 font-bold">{item.name}</td>
                  <td className="px-6 py-4">
                    <select
                      className="border border-outline-variant rounded-md px-3 py-1.5 text-sm font-body text-primary focus:outline-none focus:border-primary disabled:bg-surface-container-low disabled:text-secondary disabled:cursor-not-allowed"
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      disabled={currentStatus !== 1}
                    >
                      <option value="good">Tốt</option>
                      <option value="damaged">Hư hỏng</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className={`border border-outline-variant rounded-md w-full py-1.5 px-3 outline-none text-sm font-body ${
                        item.status === 'good'
                          ? 'bg-surface-container-low cursor-not-allowed text-secondary'
                          : 'text-primary'
                      } disabled:opacity-50`}
                      value={item.severity}
                      onChange={(e) =>
                        handleSeverityChange(item.id, Number(e.target.value))
                      }
                      disabled={item.status === 'good' || currentStatus !== 1}
                    >
                      <option value={0}>Không (0 VNĐ)</option>
                      <option value={100000}>Nhẹ (100,000 VNĐ)</option>
                      <option value={500000}>Trung bình (500,000 VNĐ)</option>
                      <option value={1000000}>Nặng (1,000,000 VNĐ)</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      className={`w-full text-right border rounded-md px-3 py-1.5 text-sm font-body focus:outline-none transition-colors ${
                        item.status === 'damaged'
                          ? 'border-error text-error focus:border-error bg-error/5'
                          : 'border-outline-variant text-secondary bg-surface-container-lowest'
                      } disabled:opacity-70 disabled:cursor-not-allowed`}
                      type="number"
                      value={item.severity}
                      onChange={(e) =>
                        handleSeverityChange(item.id, Number(e.target.value))
                      }
                      disabled={item.status === 'good' || currentStatus !== 1}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* EXTRA COSTS & SUMMARY */}
        <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden mb-stack-md">
          <div 
            className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center cursor-pointer hover:bg-surface-container-lowest transition-colors"
            onClick={() => setIsCleaningExpanded(!isCleaningExpanded)}
          >
            <h3 className="font-h3 text-h3 text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">cleaning_services</span>
              Kiểm kê vệ sinh phát sinh
            </h3>
            <span className="material-symbols-outlined text-secondary">
              {isCleaningExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </div>
          {isCleaningExpanded && (
          <table className="w-full text-left">
            <thead className="bg-surface-container-lowest font-label text-secondary text-sm">
              <tr>
                <th className="px-6 py-4">Hạng mục</th>
                <th className="px-6 py-4">Tình trạng</th>
                <th className="px-6 py-4">Mức độ bẩn</th>
                <th className="px-6 py-4 text-right">Phí dọn dẹp (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body">
              {cleaningItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-surface-container-lowest transition-colors"
                >
                  <td className="px-6 py-4 font-bold">{item.name}</td>
                  <td className="px-6 py-4">
                    <select
                      className="border border-outline-variant rounded-md px-3 py-1.5 text-sm font-body text-primary focus:outline-none focus:border-primary disabled:bg-surface-container-low disabled:text-secondary disabled:cursor-not-allowed"
                      value={item.status}
                      onChange={(e) => handleCleaningStatusChange(item.id, e.target.value)}
                      disabled={currentStatus !== 1}
                    >
                      <option value="clean">Sạch sẽ</option>
                      <option value="dirty">Cần dọn dẹp</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className={`border border-outline-variant rounded-md w-full py-1.5 px-3 outline-none text-sm font-body ${
                        item.status === 'clean'
                          ? 'bg-surface-container-low cursor-not-allowed text-secondary'
                          : 'text-primary'
                      } disabled:opacity-50`}
                      value={item.severity}
                      onChange={(e) =>
                        handleCleaningSeverityChange(item.id, Number(e.target.value))
                      }
                      disabled={item.status === 'clean' || currentStatus !== 1}
                    >
                      <option value={0}>Không (0 VNĐ)</option>
                      <option value={50000}>Nhẹ (50,000 VNĐ)</option>
                      <option value={100000}>Trung bình (100,000 VNĐ)</option>
                      <option value={200000}>Nặng (200,000 VNĐ)</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      className={`w-full text-right border rounded-md px-3 py-1.5 text-sm font-body focus:outline-none transition-colors ${
                        item.status === 'dirty'
                          ? 'border-error text-error focus:border-error bg-error/5'
                          : 'border-outline-variant text-secondary bg-surface-container-lowest'
                      } disabled:opacity-70 disabled:cursor-not-allowed`}
                      type="number"
                      value={item.severity}
                      onChange={(e) =>
                        handleCleaningSeverityChange(item.id, Number(e.target.value))
                      }
                      disabled={item.status === 'clean' || currentStatus !== 1}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md items-start">
          <div className="hidden md:block"></div>
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm text-right">
            <p className="font-label text-secondary">TỔNG CHI PHÍ PHÁT SINH</p>
            <p className="font-h1 text-h1 text-error">
              {new Intl.NumberFormat('vi-VN').format(calculateTotal())}đ
            </p>
          </div>
        </div>

        {/* ACTION FOOTER */}
        <div className="mt-8 flex justify-end gap-stack-md pb-8">
          <div className="flex flex-col items-end gap-4">
            <div className="flex flex-col gap-2">
              <label className={`flex items-center gap-3 ${currentStatus !== 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 disabled:opacity-50"
                  checked={keyReturned}
                  onChange={(e) => setKeyReturned(e.target.checked)}
                  disabled={currentStatus !== 1}
                />
                <span className="font-body text-on-surface">
                  Ghi nhận thu hồi chìa khóa
                </span>
              </label>
              <label className={`flex items-center gap-3 ${currentStatus !== 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 disabled:opacity-50"
                  checked={signed}
                  onChange={(e) => setSigned(e.target.checked)}
                  disabled={currentStatus !== 1}
                />
                <span className="font-body text-on-surface">
                  Khách đã ký biên bản trả phòng
                </span>
              </label>
            </div>
            <div className="flex gap-stack-md">
              {currentStatus === 3 ? (
                <button
                  className="px-8 py-3 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-all border border-success text-success bg-white hover:bg-success/10"
                  onClick={() => {
                    const maHDNumber = parseInt(activeRecord.replace('HD-', ''));
                    axios.post('/api/finance/tra-phong/giai-quyet-khieu-nai', { maHD: maHDNumber })
                      .then(res => {
                        alert('Đã giải quyết khiếu nại, hồ sơ được mở khóa!');
                        setRecords(records.map(r => r.id === activeRecord ? { ...r, trangthai: 1 } : r));
                      })
                      .catch(err => alert('Lỗi: ' + (err.response?.data?.message || err.message)));
                  }}
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Đã giải quyết
                </button>
              ) : currentStatus === 1 ? (
                <button
                  className="px-8 py-3 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-all border border-primary text-primary bg-white hover:bg-surface-container-lowest"
                  onClick={() => setIsComplainMode(true)}
                >
                  <span className="material-symbols-outlined">report</span>
                  Khiếu nại
                </button>
              ) : null}
              
              <button
                disabled={!canConfirm || currentStatus !== 1}
                className={`px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all ${
                  (canConfirm && currentStatus === 1)
                    ? 'bg-primary text-white shadow-primary/20 hover:opacity-90'
                    : 'bg-surface-container-highest text-secondary opacity-50 cursor-not-allowed'
                }`}
                onClick={() => {
                  const maHDNumber = parseInt(activeRecord.replace('HD-', ''));
                  axios.post('/api/finance/tra-phong/xac-nhan-ban-giao', {
                    maHD: maHDNumber,
                    phiVeSinh: cleaningCost,
                    thuHoiKhoa: keyReturned,
                    kyBienBan: signed,
                    chiTiet: items,
                    maPhong: parseInt((records.find((r: any) => r.id === activeRecord)?.room || '0').replace('P.', ''))
                  }).then(res => {
                    alert('Ghi nhận và bàn giao thành công!');
                    setRecords(records.map(r => r.id === activeRecord ? { ...r, trangthai: 2 } : r));
                  }).catch(err => {
                    alert('Lỗi từ Server: ' + (err.response?.data?.message || err.message));
                  });
                }}
              >
                <span className="material-symbols-outlined">task_alt</span>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
        </>
        )}
      </section>
    </div>
  );
};

export default RoomCheck;
