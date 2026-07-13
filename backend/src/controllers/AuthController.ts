import { Request, Response } from 'express';
import { db } from '../config/db';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ Email và Mật khẩu!'
      });
    }

    // Kiểm tra tài khoản trong bảng TaiKhoan kết hợp bảng KhachHang hoặc NhanVien
    const query = `
      SELECT 
        tk.MaTK AS "matk",
        tk.Username AS "username",
        tk.Password AS "password",
        tk.VaiTro AS "vaitro",
        kh.MaKH AS "makh",
        kh.HoTen AS "hoten_kh",
        kh.Email AS "email_kh",
        kh.SDT AS "sdt_kh",
        nv.MaNV AS "manv",
        nv.TenNV AS "hoten_nv"
      FROM TaiKhoan tk
      LEFT JOIN KhachHang kh ON kh.MaTK = tk.MaTK
      LEFT JOIN NhanVien nv ON nv.MaTK = tk.MaTK
      WHERE (tk.Username = $1 OR kh.Email = $1)
        AND tk.Password = $2
      LIMIT 1;
    `;

    const result = await db.query(query, [email.trim(), password]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác!'
      });
    }

    const row = result.rows[0];
    const user = {
      matk: row.matk,
      id: row.makh || row.manv || row.matk,
      email: row.email_kh || row.username,
      hoten: row.hoten_kh || row.hoten_nv || row.username,
      sdt: row.sdt_kh || '',
      vaitro: row.vaitro
    };

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: user
    });
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng nhập!'
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, hoten, sdt } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ Email và Mật khẩu!'
      });
    }

    // Kiểm tra tài khoản / email đã tồn tại chưa
    const checkQuery = `
      SELECT tk.MaTK FROM TaiKhoan tk
      LEFT JOIN KhachHang kh ON kh.MaTK = tk.MaTK
      WHERE tk.Username = $1 OR kh.Email = $1
      LIMIT 1;
    `;
    const checkResult = await db.query(checkQuery, [email.trim()]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc tài khoản này đã tồn tại!'
      });
    }

    // Tạo tài khoản mới (VaiTro mặc định là Khach)
    const insertTKQuery = `
      INSERT INTO TaiKhoan (Username, Password, VaiTro, TrangThai)
      VALUES ($1, $2, 'Khach', 1)
      RETURNING MaTK;
    `;
    const tkResult = await db.query(insertTKQuery, [email.trim(), password]);
    const maTK = tkResult.rows[0].matk;

    // Tạo khách hàng
    const insertKHQuery = `
      INSERT INTO KhachHang (HoTen, CCCD, Email, SDT, MaTK)
      VALUES ($1, '', $2, $3, $4)
      RETURNING MaKH;
    `;
    const khResult = await db.query(insertKHQuery, [
      hoten || email.trim(),
      email.trim(),
      sdt || '',
      maTK
    ]);
    const maKH = khResult.rows[0].makh;

    const user = {
      matk: maTK,
      id: maKH,
      email: email.trim(),
      hoten: hoten || email.trim(),
      sdt: sdt || '',
      vaitro: 'Khach'
    };

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      data: user
    });
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng ký!'
    });
  }
};
