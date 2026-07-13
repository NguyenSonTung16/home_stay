import React from 'react';

const Invoices: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#f8f9fa] md:bg-white min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-outline-variant max-w-md w-full animate-fade-in">
        <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">build</span>
        </div>
        <h2 className="text-xl font-bold text-[#002B7F] mb-2 font-h1">Tính năng đang cập nhật</h2>
        <p className="text-secondary text-sm">
          Tính năng quản lý hóa đơn (Invoices) hiện đang trong quá trình phát triển và sẽ sớm được ra mắt trong thời gian tới. Mong bạn thông cảm!
        </p>
      </div>
    </div>
  );
};

export default Invoices;
