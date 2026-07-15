import { useState, useEffect, useCallback } from 'react';
import { layLichSuDatCoc } from '../services/bookingApi';
import type { PhieuLichSu, TabCounts } from '../services/bookingApi';

export function useLichSuDatCoc(maKH: number, filterTrangThai: string) {
  const [data, setData] = useState<PhieuLichSu[]>([]);
  const [counts, setCounts] = useState<TabCounts>({ all: 0, pending: 0, completed: 0, canceled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // map filterTrangThai to trangThai param for API
      // filterTrangThai values from tabs: 'Tất cả' | 'Đang chờ' | 'Đã hoàn tất' | 'Đã hủy'
      let apiTrangThai = '';
      if (filterTrangThai === 'Đang chờ') {
        apiTrangThai = 'DangCho';
      } else if (filterTrangThai === 'Đã hoàn tất') {
        apiTrangThai = 'DaThanhToan';
      } else if (filterTrangThai === 'Đã hủy') {
        apiTrangThai = 'DaHuy';
      }
      
      const res = await layLichSuDatCoc(maKH, apiTrangThai || undefined);
      setData(res.data);
      setCounts(res.counts);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách phiếu cọc.');
    } finally {
      setLoading(false);
    }
  }, [maKH, filterTrangThai]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, counts, loading, error, refetch: fetchData };
}
