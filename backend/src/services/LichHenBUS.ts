import { LichHenDB } from '../repositories/LichHenDB';
import { LichHenDTO } from '../models';

export class LichHenBUS {
    static async themLichhen(lh: LichHenDTO): Promise<any> {
        console.log("LichHenBUS: themLichhen called với", lh);
        const newLichHen = await LichHenDB.them(lh);
        return newLichHen;
    }

    static async LayDSLichHen(): Promise<LichHenDTO[]> {
        console.log("LichHenBUS: LayDSLichHen called");
        return await LichHenDB.LayDS();
    }

    static async ThayDoiTrangThai(id: number, tt: number) {
        console.log("LichHenBUS: ThayDoiTrangThai called with id", id, "status", tt);
        return await LichHenDB.CapNhatTT(id, tt);
    }

}

