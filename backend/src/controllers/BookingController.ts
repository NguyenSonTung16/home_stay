import { Request, Response } from 'express';
import { db } from '../config/db';
import { LichHenBUS } from '../services/LichHenBUS';
import { LichHenDTO } from '../models/LichHenDTO';

export const searchRooms = async (req: Request, res: Response) => {
  try {
    const { capacity, maxPrice } = req.query;

    let query = `
      SELECT p.MaPhong as "id", p.TenPhong as "name", p.TrangThai as "status", p.ChiNhanh as "branch", p.TieuChiGioiTinh as "gender",
             lp.TenLoai as "type", lp.GiaTien as "price", lp.SucChua as "capacity",
             (lp.SucChua 
              - (SELECT COUNT(*) FROM Giuong g WHERE g.MaPhong = p.MaPhong AND g.TrangThai = 1)
              - COALESCE((SELECT SUM(SoGiuong) FROM PhieuDatCoc pdc WHERE pdc.MaPhong = p.MaPhong AND pdc.TrangThai IN (0, 1, 2, 3)), 0)
             )::int AS "sogiuongtrong",
             (
               SELECT json_agg(dvp.TenDichVu)
               FROM ChiTietDichVuPhong ct
               JOIN DichVuPhong dvp ON ct.MaDVP = dvp.MaDVP
               WHERE ct.MaLoai = lp.MaLoai
             ) as "amenities"
      FROM Phong p
      JOIN LoaiPhong lp ON p.MaLoai = lp.MaLoai
      WHERE (lp.SucChua 
              - (SELECT COUNT(*) FROM Giuong g WHERE g.MaPhong = p.MaPhong AND g.TrangThai = 1)
              - COALESCE((SELECT SUM(SoGiuong) FROM PhieuDatCoc pdc WHERE pdc.MaPhong = p.MaPhong AND pdc.TrangThai IN (0, 1, 2, 3)), 0)
             ) > 0
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (capacity) {
      query += ` AND lp.SucChua >= $${paramIndex++}`;
      params.push(parseInt(capacity as string, 10));
    }

    if (maxPrice) {
      query += ` AND lp.GiaTien <= $${paramIndex++}`;
      params.push(parseFloat(maxPrice as string));
    }

    // Default to order by status (TrangThai = 1 means available)
    query += ` ORDER BY p.TrangThai ASC, lp.GiaTien ASC`;

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error searching rooms:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRoomDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT p.MaPhong as "id", p.MaPhong as "maphong", p.TenPhong as "name", p.TenPhong as "tenphong", p.TrangThai as "status", p.ChiNhanh as "branch", p.ChiNhanh as "chinhanh", p.TieuChiGioiTinh as "gender", p.HinhAnh as "image", p.HinhAnh as "hinhanh",
             lp.TenLoai as "type", lp.GiaTien as "price", lp.GiaTien as "giatien", lp.SucChua as "capacity", lp.SucChua as "succhua",
             (lp.SucChua 
              - (SELECT COUNT(*) FROM Giuong g WHERE g.MaPhong = p.MaPhong AND g.TrangThai = 1)
              - COALESCE((SELECT SUM(SoGiuong) FROM PhieuDatCoc pdc WHERE pdc.MaPhong = p.MaPhong AND pdc.TrangThai IN (0, 1, 2, 3)), 0)
             )::int AS "sogiuongtrong",
             (
               SELECT json_agg(dvp.TenDichVu)
               FROM ChiTietDichVuPhong ct
               JOIN DichVuPhong dvp ON ct.MaDVP = dvp.MaDVP
               WHERE ct.MaLoai = lp.MaLoai
             ) as "amenities"
      FROM Phong p
      JOIN LoaiPhong lp ON p.MaLoai = lp.MaLoai
      WHERE p.MaPhong = $1
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error getting room details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { soNguoi, ngayHen, gioHen, ghiChu, dsPhongXem, maKH } = req.body;
    
    const lichHenData: LichHenDTO = {
        MaKH: maKH || 1,
        DanhSachMaPhong: dsPhongXem || [],
        NgayHen: ngayHen,
        GioHen: gioHen,
        GhiChu: ghiChu,
        TrangThai: 1
    };
    
    const result = await LichHenBUS.themLichhen(lichHenData);
    
    res.status(201).json({ message: 'Appointment created successfully', data: result });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
