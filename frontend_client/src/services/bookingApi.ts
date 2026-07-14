import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

export interface PhieuLichSu {
  macoc: number;
  tenphong: string;
  sogiuongthue: number;
  tiencoc: number;
  ptthanhtoan: string | null;
  trangthai: string;
  thoigiantao: string;
  thoigianhethan: string;
  thoigianxacnhan: string | null;
}

export interface TabCounts {
  all: number;
  pending: number;
  completed: number;
  canceled: number;
}

export interface LichSuResponse {
  data: PhieuLichSu[];
  counts: TabCounts;
}

export async function layLichSuDatCoc(maKH: number, trangThai?: string): Promise<LichSuResponse> {
  const url = `${API}/api/booking/dat-coc/lich-su`;
  const res = await axios.get(url, {
    params: { maKH, trangThai }
  });
  return {
    data: res.data.data || [],
    counts: res.data.counts || { all: 0, pending: 0, completed: 0, canceled: 0 }
  };
}
