import { FinanceRepository } from '../repositories/FinanceRepository';

export const FinanceService = {
    hoanCoc: async (data: any) => {
        // Xử lý logic tại đây (ví dụ: tính toán khấu trừ)
        return await FinanceRepository.updateHopDong(data);
    }
};
