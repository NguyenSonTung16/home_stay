import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MHTimKiemPhong } from './pages/MHTimKiemPhong';
import { MHDangKyLichHenXemPhong } from './pages/MHDangKyLichHenXemPhong';
import { MHLichSuLichHen } from './pages/MHLichSuLichHen';
import Search from './pages/Search';
import Roomdetail from './pages/Roomdetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MHTimKiemPhong />} />
        <Route path="/phong/:id" element={<Roomdetail />} />
        <Route path="/search-demo" element={<Search />} />
        <Route path="/dat-lich-hen" element={<MHDangKyLichHenXemPhong />} />
        <Route path="/lich-su-lich-hen" element={<MHLichSuLichHen />} />
      </Routes>
    </Router>
  );
}


export default App;
