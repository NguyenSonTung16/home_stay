import { db } from '../config/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export class AuthService {
    async login(username: string, password: string) {
        // Query to check if user exists and password matches
        // Note: For simplicity and following the current DB seed, we compare plain text passwords.
        // In a real production scenario, we should use bcrypt.compare here.
        const query = `
            SELECT t.MaTK, t.Username, t.VaiTro, t.TrangThai, k.MaKH 
            FROM TaiKhoan t
            LEFT JOIN KhachHang k ON t.MaTK = k.MaTK
            WHERE t.Username = $1 AND t.Password = $2
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
                    makh: user.makh,
                    username: user.username,
                    role: user.vaitro
                }
            }
        };
    }

    async register(emailOrUsername: string, password: string, hoten: string, sdt: string, cccd: string = '', diachi: string = '', usernameInput: string = '') {
        const finalUsername = usernameInput.trim() || emailOrUsername.trim();
        const finalEmail = emailOrUsername.trim();

        const checkQuery = `
            SELECT t.MaTK FROM TaiKhoan t 
            LEFT JOIN KhachHang k ON t.MaTK = k.MaTK 
            WHERE t.Username = $1 OR k.Email = $2
        `;
        const checkResult = await db.query(checkQuery, [finalUsername, finalEmail]);
        
        if (checkResult.rows.length > 0) {
            return { success: false, message: 'Tên đăng nhập hoặc email đã tồn tại' };
        }

        // Insert into TaiKhoan
        const insertTkQuery = `
            INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai)
            VALUES ($1, $2, 'Khach', 1) RETURNING MaTK
        `;
        const tkResult = await db.query(insertTkQuery, [finalUsername, password]);
        const maTK = tkResult.rows[0].matk;

        // Insert into KhachHang
        const finalCCCD = cccd.trim() || sdt || 'Chưa cập nhật';
        const insertKhQuery = `
            INSERT INTO KhachHang(HoTen, CCCD, Email, SDT, DiaChi, MaTK)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING MaKH
        `;
        await db.query(insertKhQuery, [hoten, finalCCCD, finalEmail, sdt, diachi, maTK]);
        
        // Auto login after register
        return this.login(finalUsername, password);
    }
}