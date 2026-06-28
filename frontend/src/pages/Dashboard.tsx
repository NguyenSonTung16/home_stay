import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-container-padding flex-1 flex flex-col items-center justify-center">
      <span className="material-symbols-outlined text-[64px] text-primary mb-4">
        dashboard
      </span>
      <h1 className="font-h1 text-h1 text-primary mb-2">Dashboard</h1>
      <p className="text-secondary font-body text-center max-w-md">
        Trang tổng quan hệ thống quản lý. Chức năng sẽ được cập nhật trong các phiên bản sau.
        Vui lòng chọn chức năng "Xử lý trả phòng" hoặc "Xử lý hoàn cọc" trên sidebar.
      </p>
    </div>
  );
};

export default Dashboard;
