const fs = require('fs');
let content = fs.readFileSync('database/seed.sql', 'utf8');
content = content.replace(/<<<<<<< HEAD\r?\n/g, '');
content = content.replace(/=======\r?\n/g, '');
content = content.replace(/>>>>>>> origin\/Tuan\r?\n/g, '');
content = content.replace(/INSERT INTO KhachHang\(HoTen, CCCD, SDT, MaTK\) VALUES \('khach(\d+)', '([0-9]+)', '([0-9]+)', (\d+)\);/g, 
  "INSERT INTO KhachHang(HoTen, CCCD, Email, SDT, MaTK) VALUES ('khach$1', '$2', 'khach$1@test.com', '$3', $4);");
fs.writeFileSync('database/seed.sql', content);
console.log('Fixed seed.sql');
