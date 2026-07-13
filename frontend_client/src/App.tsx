import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MHTimKiemPhong } from './pages/MHTimKiemPhong';
import { MHDangKyLichHenXemPhong } from './pages/MHDangKyLichHenXemPhong';
import { MHLichSuLichHen } from './pages/MHLichSuLichHen';
import { MHHopDongTraPhong } from './pages/MHHopDongTraPhong';
import Search from './pages/Search';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MHTimKiemPhong />} />
        <Route path="/search-demo" element={<Search />} />
        <Route path="/dat-lich-hen" element={<MHDangKyLichHenXemPhong />} />
        <Route path="/lich-su-lich-hen" element={<MHLichSuLichHen />} />
        <Route path="/hop-dong" element={<MHHopDongTraPhong />} />
      </Routes>
    </Router>
  );
}


export default App;
