const fs = require('fs');
const path = require('path');
const pagesDir = 'd:/vscode/home_stay/frontend_client/src/pages';
const files = ['MHTimKiemPhong.tsx', 'MHDangKyLichHenXemPhong.tsx', 'MHHopDongTraPhong.tsx', 'MHLichSuLichHen.tsx', 'MHThanhToanDinhKy.tsx', 'ThanhToanCoc.tsx', 'YeuCauTraPhong.tsx'];

files.forEach(file => {
    let content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
    if (!content.includes('import BottomNav')) {
        content = "import BottomNav from '../components/BottomNav';\n" + content;
        fs.writeFileSync(path.join(pagesDir, file), content);
        console.log('Added import to ' + file);
    }
});
