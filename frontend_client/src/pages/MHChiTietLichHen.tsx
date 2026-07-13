import React, { useState, useEffect } from 'react';

export const MHChiTietLichHen = () => {
    // Thuộc tính giao diện
    const [lblTenKhach, setLblTenKhach] = useState("");
    const [lblSDT, setLblSDT] = useState("");
    const [lblNgayHen, setLblNgayHen] = useState("");
    const [dsPhongQuanTam, setDsPhongQuanTam] = useState([]);
    const [MoTa, setMoTa] = useState(""); // Read-only textbox

    // Phương thức
    const hienThi = () => {
        console.log("MHChiTietLichHen: hienThi called");
    };

    const btn_Huy = () => {
        console.log("MHChiTietLichHen: btn_Huy called");
        // Gọi ThayDoiTrangThai
    };

    const btn_Duyet = () => {
        console.log("MHChiTietLichHen: btn_Duyet called");
        // Gọi ThayDoiTrangThai
    };

    const btn_KhongDuyet = () => {
        console.log("MHChiTietLichHen: btn_KhongDuyet called");
        // Gọi ThayDoiTrangThai
    };

    useEffect(() => {
        hienThi();
    }, []);

    return (
        <div>
            <h1>Màn hình Chi tiết lịch hẹn</h1>
            <button onClick={btn_Duyet}>Duyệt</button>
            <button onClick={btn_KhongDuyet}>Không duyệt</button>
            <button onClick={btn_Huy}>Hủy</button>
        </div>
    );
};
