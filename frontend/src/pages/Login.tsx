import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setLoginError('');
        try {
            const res = await axios.post('/api/auth/login', {
                username: data.username,
                password: data.password
            });
            if (res.data.success) {
                login(res.data.data.token, res.data.data.user);
                navigate('/');
            } else {
                setLoginError(res.data.message || 'Đăng nhập thất bại');
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                setLoginError(error.response.data.message);
            } else {
                setLoginError('Lỗi kết nối đến máy chủ.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-white font-body">
            {/* Left Column (Illustration) - Hidden on Mobile */}
            <div className="hidden lg:flex w-1/2 bg-[#253e85] flex-col items-center justify-center p-12 text-white relative">
                <div className="absolute top-12 flex flex-col items-center">
                    <h2 className="text-xl font-bold tracking-widest text-blue-200">FIT 4.0</h2>
                    <p className="mt-2 text-lg font-light text-blue-100">Giải pháp quản lý thông minh</p>
                </div>
                
                {/* SVG Illustration Placeholder */}
                <div className="bg-white p-8 rounded-lg shadow-2xl mt-12 w-full max-w-md h-[500px] flex items-center justify-center relative overflow-hidden">
                    <img 
                        src="https://raw.githubusercontent.com/KaterinaLupacheva/react-admin-dashboard/main/public/assets/login-illustration.svg" 
                        alt="Illustration" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            // Fallback if URL is broken
                            (e.target as HTMLImageElement).src = "https://undraw.co/api/illustrations/svg/undraw_smart_home_re_orvn";
                        }}
                    />
                </div>
                
                <div className="absolute bottom-8">
                    <p className="text-xs tracking-[0.2em] text-blue-300/50 uppercase">CORE SYSTEM v4.0.2 // STABLE RELEASE</p>
                </div>
            </div>

            {/* Right Column (Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    
                    {/* Header */}
                    <div className="mb-8">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex flex-col items-center mb-10 text-[#253e85]">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-3xl">domain</span>
                                <h2 className="text-2xl font-bold">FIT 4.0</h2>
                            </div>
                            <p className="text-sm text-gray-500">Quản lý Ký túc xá & Nhà trọ</p>
                        </div>
                        
                        <h1 className="text-xl font-bold text-gray-800 mb-2">Đăng nhập hệ thống</h1>
                        <p className="text-sm text-gray-500 hidden lg:block">Quản lý Ký túc xá & Nhà trọ thông minh</p>
                    </div>

                    {/* Error Banner */}
                    {loginError && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
                            <p className="text-sm font-medium leading-relaxed">{loginError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        
                        {/* Username Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Tên đăng nhập
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className={`material-symbols-outlined text-[20px] ${errors.username ? 'text-red-400' : 'text-gray-400'}`}>
                                        person
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    className={`block w-full pl-10 pr-3 py-3 border ${errors.username ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-[#253e85] focus:border-[#253e85]'} rounded-lg text-sm bg-white outline-none transition-colors duration-200`}
                                    placeholder="admin"
                                    {...register('username', { required: 'Vui lòng nhập tên đăng nhập' })}
                                />
                            </div>
                            {errors.username && (
                                <p className="mt-1.5 text-xs text-red-500">{errors.username.message as string}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className={`material-symbols-outlined text-[20px] ${errors.password ? 'text-red-400' : 'text-gray-400'}`}>
                                        lock
                                    </span>
                                </div>
                                <input
                                    type="password"
                                    className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-[#253e85] focus:border-[#253e85]'} rounded-lg text-sm bg-white outline-none transition-colors duration-200`}
                                    placeholder="Nhập mật khẩu"
                                    {...register('password', { 
                                        required: 'Vui lòng nhập mật khẩu',
                                        minLength: { value: 3, message: 'Mật khẩu phải chứa ít nhất 3 ký tự' }
                                    })}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600">
                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                </div>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-500">{errors.password.message as string}</p>
                            )}
                        </div>

                        {/* Remember & Forgot Password */}
                        <div className="flex items-center justify-between text-sm pt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#253e85] focus:ring-[#253e85]" />
                                Ghi nhớ đăng nhập
                            </label>
                            <a href="#" className="text-gray-500 hover:text-[#253e85] transition-colors">
                                Quên mật khẩu?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-[#253e85] hover:bg-[#1a2c61] text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#253e85] mt-6"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                            {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                        </button>
                        
                    </form>

                    {/* Footer Mobile Alternatives */}
                    <div className="mt-10 lg:hidden text-center">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-white text-gray-500">Hoặc tiếp tục với</span>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button className="flex justify-center items-center py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-[#253e85]">
                                <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                            </button>
                            <button className="flex justify-center items-center py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-[#253e85]">
                                <span className="material-symbols-outlined text-[20px]">key</span>
                            </button>
                        </div>
                        <div className="mt-8">
                            <a href="#" className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                                Quay lại Trang chủ
                            </a>
                            <h3 className="text-6xl font-black text-gray-100 mt-4 tracking-tighter">FIT</h3>
                        </div>
                    </div>

                    {/* Footer Desktop */}
                    <div className="hidden lg:flex flex-col items-center mt-12 text-xs text-gray-400 gap-4">
                        <div className="flex gap-6">
                            <a href="#" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                                <span className="material-symbols-outlined text-[14px]">help</span>
                                Hỗ trợ kỹ thuật
                            </a>
                            <a href="#" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                                <span className="material-symbols-outlined text-[14px]">language</span>
                                Tiếng Việt
                            </a>
                        </div>
                        <p>© 2024 FIT DORMITORY SOLUTIONS. ALL RIGHTS RESERVED.</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
