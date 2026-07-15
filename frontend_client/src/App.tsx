import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ClientLayout } from './components/ClientLayout';
import { MHTimKiemPhong } from './pages/MHTimKiemPhong';
import { MHDangKyLichHenXemPhong } from './pages/MHDangKyLichHenXemPhong';
import { MHLichSuLichHen } from './pages/MHLichSuLichHen';
import { MHHopDongTraPhong } from './pages/MHHopDongTraPhong';
import ThanhToanCoc from './pages/ThanhToanCoc';
import { MHThanhToanDinhKy } from './pages/MHThanhToanDinhKy';
import { MHThanhToan } from './pages/MHThanhToan';
import { MHQuetMaQR } from './pages/MHQuetMaQR';
import { MHThongBaoKetQua } from './pages/MHThongBaoKetQua';
import Roomdetail from './pages/Roomdetail';
import YeuCauTraPhong from './pages/YeuCauTraPhong';
import XacNhanDatCoc from './pages/XacNhanDatCoc';
import KetQuaDatCoc from './pages/KetQuaDatCoc';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<ClientLayout />}>
            <Route path="/" element={<MHTimKiemPhong />} />
            <Route path="/dat-lich-hen" element={<MHDangKyLichHenXemPhong />} />
            <Route path="/lich-su-lich-hen" element={<MHLichSuLichHen />} />
            <Route path="/hop-dong" element={<MHHopDongTraPhong />} />
            <Route path="/thanh-toan-coc" element={<ThanhToanCoc />} />
            <Route path="/phong/:id" element={<Roomdetail />} />
            <Route path="/yeu-cau-tra-phong" element={<YeuCauTraPhong />} />
            
            <Route path="/thanh-toan-dinh-ky" element={<MHThanhToanDinhKy />} />
            <Route path="/thanh-toan/:loaiHoaDon/:maHoaDon" element={<MHThanhToan />} />
            <Route path="/quet-qr/:maDH" element={<MHQuetMaQR />} />
            <Route path="/thanh-toan-ket-qua" element={<MHThongBaoKetQua />} />

            {/* Thanh toán cọc — Tin's feature */}
            <Route path="/xac-nhan-dat-coc/:maPDC" element={<XacNhanDatCoc />} />
            <Route path="/ket-qua-dat-coc/:maPDC" element={<KetQuaDatCoc />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
