import { KhachHangDB } from '../repositories/KhachHangDB';
import { KhachHangDTO } from '../models/KhachHangDTO';

export class KhachHangBUS {
    static async LayThongTinKH(MaKH: string | number): Promise<KhachHangDTO | null> {
        console.log("KhachHangBUS: LayThongTinKH called with", MaKH);
        return await KhachHangDB.DocThongTin(MaKH);
    }
}

