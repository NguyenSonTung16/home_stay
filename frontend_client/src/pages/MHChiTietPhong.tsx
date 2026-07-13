import React, { useEffect } from 'react';

export const MHChiTietPhong = () => {
    // Phương thức
    const hienThi = () => {
        console.log("MHChiTietPhong: hienThi called");
    };

    useEffect(() => {
        hienThi();
    }, []);

    return (
        <div>
            <h1>Màn hình Chi tiết phòng</h1>
        </div>
    );
};
