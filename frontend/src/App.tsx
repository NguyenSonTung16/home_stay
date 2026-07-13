import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import RoomCheck from './pages/RoomCheck';
import RefundCheck from './pages/RefundCheck';
import AppointmentCheck from './pages/AppointmentCheck';

function App() {
  return (
    <BrowserRouter>
      <div className="bg-surface font-body text-on-surface flex min-h-screen">
        <Sidebar />
        <main className="ml-sidebar-width flex-1 min-h-screen flex flex-col relative">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/room_check" element={<RoomCheck />} />
            <Route path="/refund_check" element={<RefundCheck />} />
            <Route path="/appointment_check" element={<AppointmentCheck />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
