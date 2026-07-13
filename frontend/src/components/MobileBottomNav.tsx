import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface MobileBottomNavProps {
  forceShow?: boolean;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ forceShow = false }) => {
  const { user, logout } = useAuth();
  
  // Cơ chế bật/tắt: Mặc định bật cho Khách thuê, hoặc bật ép buộc qua props
  const isVisible = forceShow || user?.role === 'Khach';

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[99999] px-2 flex justify-between items-center pb-2 pt-2">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-1/4 py-1.5 rounded-xl transition-colors ${
            isActive && window.location.pathname === '/' 
              ? 'text-[#002B7F] bg-[#e8f1ff]' 
              : 'text-secondary hover:bg-surface-container'
          }`
        }
      >
        <span className="material-symbols-outlined text-[24px] mb-1">home</span>
        <span className="text-[10px] font-medium">Home</span>
      </NavLink>

      <NavLink
        to="/request_checkout"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-1/4 py-1.5 rounded-xl transition-colors ${
            isActive 
              ? 'text-[#002B7F] bg-[#e8f1ff] font-bold' 
              : 'text-secondary hover:bg-surface-container'
          }`
        }
      >
        <span className="material-symbols-outlined text-[24px] mb-1">description</span>
        <span className="text-[10px] font-medium">Contracts</span>
      </NavLink>

      <NavLink
        to="/invoices"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-1/4 py-1.5 rounded-xl transition-colors ${
            isActive 
              ? 'text-[#002B7F] bg-[#e8f1ff] font-bold' 
              : 'text-secondary hover:bg-surface-container'
          }`
        }
      >
        <span className="material-symbols-outlined text-[24px] mb-1">receipt_long</span>
        <span className="text-[10px] font-medium">Invoices</span>
      </NavLink>

      <button
        onClick={logout}
        className="flex flex-col items-center justify-center w-1/4 py-1.5 rounded-xl transition-colors text-error hover:bg-error/10"
      >
        <span className="material-symbols-outlined text-[24px] mb-1">logout</span>
        <span className="text-[10px] font-medium">Đăng xuất</span>
      </button>
    </div>
  );
};

export default MobileBottomNav;
