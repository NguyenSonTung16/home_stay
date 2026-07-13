import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MHTimKiemPhong } from './pages/MHTimKiemPhong';
import { MHDangKyLichHenXemPhong } from './pages/MHDangKyLichHenXemPhong';
import { MHLichSuLichHen } from './pages/MHLichSuLichHen';
import { MHHopDongTraPhong } from './pages/MHHopDongTraPhong';
import Search from './pages/Search';
import DatCoc from './pages/DatCoc';
import ThanhToanCoc from './pages/ThanhToanCoc';
import YeuCauTraPhong from './pages/YeuCauTraPhong';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MHTimKiemPhong />} />
        <Route path="/search-demo" element={<Search />} />
        <Route path="/dat-lich-hen" element={<MHDangKyLichHenXemPhong />} />
        <Route path="/lich-su-lich-hen" element={<MHLichSuLichHen />} />
        <Route path="/hop-dong" element={<MHHopDongTraPhong />} />
        <Route path="/dat-coc" element={<DatCoc />} />
        <Route path="/thanh-toan-coc" element={<ThanhToanCoc />} />
        <Route path="/yeu-cau-tra-phong" element={<YeuCauTraPhong />} />
      </Routes>
    </Router>
  );
}


export default App;
