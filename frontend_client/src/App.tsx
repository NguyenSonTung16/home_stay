import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MHTimKiemPhong } from './pages/MHTimKiemPhong';
import { MHDangKyLichHenXemPhong } from './pages/MHDangKyLichHenXemPhong';
import { MHXuLyLichHen } from './pages/MHXuLyLichHen';
import Search from './pages/Search';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MHTimKiemPhong />} />
        <Route path="/search-demo" element={<Search />} />
        <Route path="/dat-lich-hen" element={<MHDangKyLichHenXemPhong />} />
        <Route path="/quan-ly-lich-hen" element={<MHXuLyLichHen />} />
      </Routes>
    </Router>
  );
}


export default App;
