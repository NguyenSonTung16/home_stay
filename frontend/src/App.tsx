import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import RoomCheck from './pages/RoomCheck';
import RefundCheck from './pages/RefundCheck';
import { RequestCheckout } from './pages/RequestCheckout';
import Invoices from './pages/Invoices';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import MobileBottomNav from './components/MobileBottomNav';

const MainLayout = () => (
  <div className="bg-surface font-body text-on-surface flex min-h-screen">
    <Sidebar />
    <main className="ml-0 md:ml-sidebar-width flex-1 min-h-screen flex flex-col relative overflow-x-hidden pb-16 md:pb-0">
      <Header />
      <Outlet />
      <MobileBottomNav />
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              
              {/* Only QuanLy can access RoomCheck */}
              <Route element={<ProtectedRoute allowedRoles={['QuanLy']} />}>
                <Route path="/room_check" element={<RoomCheck />} />
              </Route>
              
              {/* Only KeToan can access RefundCheck */}
              <Route element={<ProtectedRoute allowedRoles={['KeToan']} />}>
                <Route path="/refund_check" element={<RefundCheck />} />
              </Route>
              
              {/* Only Khach can access RequestCheckout */}
              <Route element={<ProtectedRoute allowedRoles={['Khach']} />}>
                <Route path="/request_checkout" element={<RequestCheckout />} />
              </Route>
              
              {/* Invoices Placeholder */}
              <Route path="/invoices" element={<Invoices />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
