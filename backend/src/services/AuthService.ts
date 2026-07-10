import { db } from '../config/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export class AuthService {
    async login(username: string, password: string) {
        // Query to check if user exists and password matches
        // Note: For simplicity and following the current DB seed, we compare plain text passwords.
        // In a real production scenario, we should use bcrypt.compare here.
        const query = `
            SELECT MaTK, Username, VaiTro, TrangThai 
            FROM TaiKhoan 
            WHERE Username = $1 AND Password = $2
        `;
        
        const result = await db.query(query, [username, password]);
        
        if (result.rows.length === 0) {
            return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' };
        }
        
        const user = result.rows[0];
        
        if (user.trangthai === 0) {
            return { success: false, message: 'Tài khoản đã bị khóa' };
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.matk, 
                username: user.username, 
                role: user.vaitro 
            }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        // Optionally update last login time
        await db.query(`UPDATE TaiKhoan SET LanDangNhapCuoi = CURRENT_TIMESTAMP WHERE MaTK = $1`, [user.matk]);

        return { 
            success: true, 
            data: {
                token,
                user: {
                    id: user.matk,
                    username: user.username,
                    role: user.vaitro
                }
            } 
        };
    }
}
