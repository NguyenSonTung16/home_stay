import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;
      const loginIdentifier = username || email;

      if (!loginIdentifier || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu' });
      }

      const result = await authService.login(loginIdentifier, password);

      if (!result.success) {
        return res.status(401).json(result); // Unauthorized
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, hoten, sdt, cccd, diachi, username } = req.body;
      
      if (!email || !password || !hoten) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ email, mật khẩu và họ tên' });
      }
      
      const result = await authService.register(email, password, hoten, sdt || '', cccd || '', diachi || '', username || '');
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
    }
  }
}