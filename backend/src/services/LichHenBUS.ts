import { LichHenDB } from '../repositories/LichHenDB';
import { LichHenDTO } from '../models';
import { EmailService } from './EmailService';
import { KhachHangBUS } from './KhachHangBUS';

export class LichHenBUS {
    static async themLichhen(lh: LichHenDTO): Promise<any> {
        console.log("LichHenBUS: themLichhen called với", lh);
        const newLichHen = await LichHenDB.them(lh);
        return newLichHen;
    }

    static async LayDSLichHen(): Promise<LichHenDTO[]> {
        console.log("LichHenBUS: LayDSLichHen called");
        const dsLichHen = await LichHenDB.LayDS();

        // Kết hợp thông tin Khách hàng tại tầng BUS thông qua KhachHangBUS.LayThongTinKH
        const enrichedList = await Promise.all(
            dsLichHen.map(async (lh: any) => {
                const maKH = lh.makh ?? lh.MaKH;
                if (maKH) {
                    const khachHang = await KhachHangBUS.LayThongTinKH(maKH);
                    if (khachHang) {
                        return {
                            ...lh,
                            hoten: (khachHang as any).hoten || khachHang.HoTen,
                            HoTen: khachHang.HoTen || (khachHang as any).hoten,
                            sdt: (khachHang as any).sdt || khachHang.SDT,
                            SDT: khachHang.SDT || (khachHang as any).sdt,
                            email: (khachHang as any).email || khachHang.Email,
                            Email: khachHang.Email || (khachHang as any).email
                        };
                    }
                }
                return lh;
            })
        );

        return enrichedList;
    }

    static async ThayDoiTrangThai(id: number, tt: number, phanHoi?: string) {
        console.log("LichHenBUS: ThayDoiTrangThai called with id", id, "status", tt, "phanHoi", phanHoi);
        const result = await LichHenDB.CapNhatTT(id, tt, phanHoi);

        if (result && result.email) {
            const statusStr = tt === 1 ? 'ĐÃ PHÊ DUYỆT' : (tt === -1 ? 'TỪ CHỐI' : 'CẬP NHẬT');
            const noteStr = phanHoi && phanHoi.trim() ? `\n\nLời nhắn từ Homestay:\n"${phanHoi.trim()}"` : '';
            const htmlNote = phanHoi && phanHoi.trim() ? `
                <div style="background-color: #F3F4F6; padding: 16px; border-left: 4px solid #00236F; border-radius: 6px; margin: 16px 0;">
                    <p style="margin: 0; font-size: 13px; color: #4B5563;">Lời nhắn từ nhân viên hỗ trợ:</p>
                    <p style="margin: 8px 0 0 0; font-weight: bold; color: #1F2937;">"${phanHoi.trim()}"</p>
                </div>
            ` : '';

            const mailOptions = {
                to: result.email,
                subject: `[FIT 4.0 HomeStay] Thông báo kết quả Lịch hẹn xem phòng #${id}`,
                text: `Chào ${result.hoten},\n\nLịch hẹn xem phòng của bạn (Mã phiếu #${id}) đã được ${statusStr}.${noteStr}\n\nTrân trọng,\nĐội ngũ CSKH FIT 4.0 HomeStay.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                        <h2 style="color: #00236F; margin-top: 0;">Kết quả Lịch hẹn xem phòng #${id}</h2>
                        <p>Chào <strong>${result.hoten}</strong>,</p>
                        <p>Lịch hẹn xem phòng của bạn đã được chuyển sang trạng thái: <strong style="color: ${tt === 1 ? '#10B981' : '#EF4444'};">${statusStr}</strong>.</p>
                        ${htmlNote}
                        <p style="margin-top: 20px;">Cảm ơn bạn đã quan tâm dịch vụ FIT 4.0 HomeStay!</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #6B7280;">Đây là email thông báo tự động từ hệ thống FIT 4.0 HomeStay.</p>
                    </div>
                `
            };
            // Send email asynchronously
            EmailService.sendMail(mailOptions).catch(err => console.error("Lỗi gửi email:", err));
        }

        return result;
    }
}

