import { db } from '../config/db'; // Kết nối DB

export const FinanceRepository = {
    updateHopDong: async (data: any) => {
        // Chỉ ghi câu lệnh SQL tại đây
        // return await db.query('UPDATE HopDong SET ...');
        return { success: true, message: 'Đã hoàn cọc / cập nhật hợp đồng' };
    }
};
