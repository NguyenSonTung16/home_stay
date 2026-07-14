import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ClientLayout } from './components/ClientLayout';
import { MHTimKiemPhong } from './pages/MHTimKiemPhong';
import { MHDangKyLichHenXemPhong } from './pages/MHDangKyLichHenXemPhong';
import { MHLichSuLichHen } from './pages/MHLichSuLichHen';
import { MHHopDongTraPhong } from './pages/MHHopDongTraPhong';
import ThanhToanCoc from './pages/ThanhToanCoc';

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
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
