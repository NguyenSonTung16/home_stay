import React from 'react';

const Header: React.FC = () => {
  const currentUser = { id: 1, hoten: "Demo Admin", email: "admin@example.com", vaitro: "QuanLy" };

  return (
    <>
      <header className="h-16 sticky top-0 right-0 bg-white dark:bg-inverse-surface border-b border-outline-variant dark:border-outline shadow-sm z-20 flex items-center justify-between px-gutter">
        <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant w-96">
          <span className="material-symbols-outlined text-secondary mr-2">
            search
          </span>
          <input
            className="bg-transparent border-none focus:ring-0 text-body w-full outline-none"
            placeholder="Tìm kiếm tài sản, khách hàng..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-secondary hover:bg-surface-container rounded-full transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <div className="h-8 w-px bg-outline-variant mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-label text-on-surface font-bold">
                {currentUser.hoten || currentUser.email}
              </p>
              <p className="text-[10px] text-secondary uppercase tracking-wider font-bold">
                {currentUser.vaitro || 'Nhân viên'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border-2 border-primary-fixed flex items-center justify-center text-primary font-bold">
              {(currentUser.hoten || currentUser.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
