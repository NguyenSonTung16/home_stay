import React, { useState, useEffect } from 'react';

export const MHThongBao = () => {
    // Thuộc tính
    const [lblSoTienThànhCong, setLblSoTienThànhCong] = useState("");
    const [lblMaGiaoDich, setLblMaGiaoDich] = useState("");

    // Phương thức
    const hienThi = () => {
        console.log("MHThongBao: hienThi called");
    };

    const btn_QuayLaiTrangChu = () => {
        console.log("MHThongBao: btn_QuayLaiTrangChu called");
    };

    const toastCapNhatSystem = () => {
        console.log("MHThongBao: toastCapNhatSystem called");
    };

    useEffect(() => {
        hienThi();
    }, []);

    return (
        <div>
            <h1>Màn hình Thông báo</h1>
            <button onClick={btn_QuayLaiTrangChu}>Quay lại trang chủ</button>
        </div>
    );
};
