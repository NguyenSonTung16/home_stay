import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export class AuthController {
    async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu' });
            }
            
            const result = await authService.login(username, password);
            
            if (!result.success) {
                return res.status(401).json(result); // Unauthorized
            }
            
            return res.status(200).json(result);
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
        }
    }
}
