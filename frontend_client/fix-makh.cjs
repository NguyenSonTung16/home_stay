const fs = require('fs');
const path = require('path');
const pagesDir = 'd:/vscode/home_stay/frontend_client/src/pages';

// 1. Fix ThanhToanCoc.tsx
let ttc = fs.readFileSync(path.join(pagesDir, 'ThanhToanCoc.tsx'), 'utf-8');
ttc = ttc.replace(/const \[loading, setLoading\] = useState\(true\);[\s\S]*?const handleSelect/, 
`const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    fetchDanhSach();
  }, []);

  const fetchDanhSach = async () => {
    try {
      setLoading(true);
      const userDataStr = localStorage.getItem('currentUser');
      const userData = userDataStr ? JSON.parse(userDataStr) : {};
      const maKH = Number(userData.makh || userData.id) || 1;

      const res = await axios.get(\`/api/booking/phieu-coc/chua-thanh-toan?maKH=\${maKH}\`);
      setPhieuList(res.data.data || []);
    } catch (err: any) {
      setError('Không thể tải danh sách phiếu cọc.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect`);
fs.writeFileSync(path.join(pagesDir, 'ThanhToanCoc.tsx'), ttc);

// 2. Fix YeuCauTraPhong.tsx
let yctp = fs.readFileSync(path.join(pagesDir, 'YeuCauTraPhong.tsx'), 'utf-8');
yctp = yctp.replace(/const res = await axios\.get\('\/api\/booking\/hop-dong\/dang-hoat-dong\?maKH=1'\);/, 
`const userDataStr = localStorage.getItem('currentUser');
      const userData = userDataStr ? JSON.parse(userDataStr) : {};
      const maKH = Number(userData.makh || userData.id) || 1;
      const res = await axios.get(\`/api/booking/hop-dong/dang-hoat-dong?maKH=\${maKH}\`);`);
fs.writeFileSync(path.join(pagesDir, 'YeuCauTraPhong.tsx'), yctp);
console.log('Fixed both');
