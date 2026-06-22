// Cấu hình kết nối DB
export const db = {
    query: async (sql: string, params?: any[]) => {
        // Thực thi query
        console.log('Executing SQL:', sql);
        return [];
    }
};
