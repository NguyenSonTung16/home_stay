import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hoten, setHoten] = useState('');
  const [sdt, setSdt] = useState('');
  const [cccd, setCccd] = useState('');
  const [diachi, setDiachi] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập Email và Mật khẩu.');
      return;
    }
    if (isRegistering && (!hoten.trim() || !sdt.trim() || !cccd.trim())) {
      setErrorMsg('Vui lòng điền đủ Họ tên, Số điện thoại và Số CCCD/CMND.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegistering ? `${import.meta.env.VITE_API_URL}/api/auth/register` : `${import.meta.env.VITE_API_URL}/api/auth/login`;
      const bodyPayload = isRegistering
        ? { username: username.trim() || email.trim(), email: email.trim(), password, hoten: hoten.trim(), sdt: sdt.trim(), cccd: cccd.trim(), diachi: diachi.trim() }
        : { email: email.trim(), password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('currentUser', JSON.stringify(result.data));
        onSuccess(result.data);
        onClose();
      } else {
        setErrorMsg(result.message || 'Có lỗi xảy ra!');
      }
    } catch (err) {
      console.error('Lỗi kết nối auth:', err);
      setErrorMsg('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-[95%] sm:w-[480px] min-w-[340px] sm:min-w-[450px] max-w-[520px] shrink-0 overflow-hidden border border-[#E0E3E5] transform transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header tabs */}
        <div className="flex border-b border-[#F2F4F6] bg-[#F8FAFC]">
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setErrorMsg(''); }}
            className={`flex-1 py-4 text-center font-bold text-[15px] transition-colors border-b-2 ${
              !isRegistering
                ? 'text-[#00236F] border-[#00236F] bg-white'
                : 'text-[#54647A] border-transparent hover:text-[#00236F]'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setErrorMsg(''); }}
            className={`flex-1 py-4 text-center font-bold text-[15px] transition-colors border-b-2 ${
              isRegistering
                ? 'text-[#00236F] border-[#00236F] bg-white'
                : 'text-[#54647A] border-transparent hover:text-[#00236F]'
            }`}
          >
            Đăng ký mới
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center mb-2">
            <h3 className="text-[#00236F] font-extrabold text-[20px]">
              {isRegistering ? 'Tạo tài khoản mới' : 'Chào mừng trở lại'}
            </h3>
            <p className="text-[#54647A] text-[13px] mt-1">
              {isRegistering
                ? 'Đăng ký nhanh chỉ với email và mật khẩu'
                : 'Đăng nhập để đặt lịch hẹn xem phòng và quản lý phiếu'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {isRegistering && (
            <>
              <div>
                <label className="block text-[#444651] font-semibold text-xs mb-1">
                  Tên đăng nhập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: nguyenvana123"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#00236F] text-sm font-medium text-[#191C1E]"
                />
              </div>

              <div>
                <label className="block text-[#444651] font-semibold text-xs mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={hoten}
                  onChange={(e) => setHoten(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#00236F] text-sm font-medium text-[#191C1E]"
                />
              </div>

              <div>
                <label className="block text-[#444651] font-semibold text-xs mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={sdt}
                  onChange={(e) => setSdt(e.target.value)}
                  placeholder="Ví dụ: 0901234567"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#00236F] text-sm font-medium text-[#191C1E]"
                />
              </div>

              <div>
                <label className="block text-[#444651] font-semibold text-xs mb-1">
                  Số CCCD / CMND <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={cccd}
                  onChange={(e) => setCccd(e.target.value)}
                  placeholder="Ví dụ: 079099001234"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#00236F] text-sm font-medium text-[#191C1E]"
                />
              </div>

              <div>
                <label className="block text-[#444651] font-semibold text-xs mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={diachi}
                  onChange={(e) => setDiachi(e.target.value)}
                  placeholder="Ví dụ: Quận 1, TP. HCM"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#00236F] text-sm font-medium text-[#191C1E]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[#444651] font-semibold text-xs mb-1">
              {isRegistering ? 'Email (Lưu vào KhachHang)' : 'Tên đăng nhập'} <span className="text-rose-500">*</span>
            </label>
            <input
              type={isRegistering ? "email" : "text"}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isRegistering ? "nguyenvana@gmail.com" : "Nhập tên đăng nhập"}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#00236F] text-sm font-medium text-[#191C1E]"
            />
          </div>

          <div>
            <label className="block text-[#444651] font-semibold text-xs mb-1">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#00236F] text-sm font-medium text-[#191C1E]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#00236F] hover:bg-[#00184D] text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : isRegistering ? (
                <>
                  <span className="material-symbols-outlined text-base">person_add</span>
                  <span>Đăng ký tài khoản</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Đăng nhập ngay</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2 border-t border-[#F2F4F6]">
            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); }}
              className="text-xs text-[#00236F] font-semibold hover:underline"
            >
              {isRegistering
                ? 'Đã có tài khoản? Đăng nhập ngay'
                : 'Chưa có tài khoản? Đăng ký mới ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
