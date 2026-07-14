const fs = require('fs');
const path = require('path');
const pagesDir = 'd:/vscode/home_stay/frontend_client/src/pages';

const fixFile = (fileName, replacements) => {
    let content = fs.readFileSync(path.join(pagesDir, fileName), 'utf-8');
    let changed = false;
    for (const [search, replace] of replacements) {
        if (content.includes(search)) {
            content = content.replace(search, replace);
            changed = true;
        } else {
            console.log(`Warning: Could not find "${search}" in ${fileName}`);
        }
    }
    if (changed) {
        fs.writeFileSync(path.join(pagesDir, fileName), content);
        console.log(`Fixed ${fileName}`);
    }
};

fixFile('MHTimKiemPhong.tsx', [
    ['const userId = currentUser.user?.id || currentUser.id || 1;', 'const userId = currentUser.user?.makh || currentUser.makh || currentUser.user?.id || currentUser.id || 1;']
]);

fixFile('MHDangKyLichHenXemPhong.tsx', [
    ['const maKH = userData.makh || userData.id;', 'const maKH = userData.user?.makh || userData.user?.id || userData.makh || userData.id;']
]);

fixFile('ThanhToanCoc.tsx', [
    ['const maKH = Number(userData.makh || userData.id) || 1;', 'const maKH = Number(userData.user?.makh || userData.user?.id || userData.makh || userData.id) || 1;']
]);

fixFile('YeuCauTraPhong.tsx', [
    ['const maKH = Number(userData.makh || userData.id) || 1;', 'const maKH = Number(userData.user?.makh || userData.user?.id || userData.makh || userData.id) || 1;']
]);

fixFile('MHLichSuLichHen.tsx', [
    ['String(p.makh) === String(userData.id) || String(p.makh) === String(userData.makh)', 'String(p.makh) === String(userData.user?.makh || userData.makh || userData.user?.id || userData.id)']
]);
