import { PhongDB } from '../repositories/PhongDB';
import { PhongDTO } from '../models';

export class PhongBUS {
    static async layDSphong(): Promise<PhongDTO[]> {
        console.log("PhongBUS: layDSphong called (không tham số)");
        return await PhongDB.layDS();
    }
}
