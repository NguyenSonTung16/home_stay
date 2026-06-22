const fs = require('fs');
const path = require('path');

const root = 'd:/vscode/home_stay';

const dirs = [
  'frontend/src',
  'backend/src/controllers',
  'backend/src/services',
  'backend/src/repositories',
  'backend/src/models',
  'backend/src/routes',
  'backend/src/config'
];

dirs.forEach(d => fs.mkdirSync(path.join(root, d), { recursive: true }));

const files = {
  'backend/app.js': `const express = require('express');\nconst app = express();\nconst routes = require('./src/routes');\n\napp.use(express.json());\napp.use('/api', routes);\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => {\n    console.log(\`Server is running on port \${PORT}\`);\n});`,
  'backend/src/config/db.js': `// Cấu hình kết nối Database PostgreSQL\n// const { Pool } = require('pg');\n// const pool = new Pool({ ... });\n// module.exports = { query: (text, params) => pool.query(text, params) };\n\nmodule.exports = {\n    query: async (sql) => {\n        console.log('Executing SQL:', sql);\n        return [];\n    }\n};`,
  'backend/src/routes/index.js': `const express = require('express');\nconst router = express.Router();\n\nconst authRoutes = require('./authRoutes'); // Tín\nconst serviceRoutes = require('./serviceRoutes'); // Tuấn\nconst bookingRoutes = require('./bookingRoutes'); // Liêm\nconst financeRoutes = require('./financeRoutes'); // Tùng\n\nrouter.use('/auth', authRoutes);\nrouter.use('/services', serviceRoutes);\nrouter.use('/booking', bookingRoutes);\nrouter.use('/finance', financeRoutes);\n\nmodule.exports = router;`,
  'backend/src/routes/financeRoutes.js': `const express = require('express');\nconst router = express.Router();\nconst FinanceController = require('../controllers/FinanceController');\n\n// Mọi route về Hoàn cọc, Trả phòng đặt tại đây\nrouter.post('/hoan-coc', FinanceController.xuLyHoanCoc);\nrouter.post('/tra-phong', FinanceController.xuLyTraPhong);\n\nmodule.exports = router;`,
  'backend/src/controllers/FinanceController.js': `const FinanceService = require('../services/FinanceService');\n\nexports.xuLyHoanCoc = async (req, res) => {\n    try {\n        const data = await FinanceService.hoanCoc(req.body);\n        res.status(200).json(data);\n    } catch (err) {\n        res.status(500).send(err.message);\n    }\n};\n\nexports.xuLyTraPhong = async (req, res) => {\n    try {\n        // Logic\n        res.status(200).json({ message: 'Xử lý trả phòng thành công' });\n    } catch (err) {\n        res.status(500).send(err.message);\n    }\n};`,
  'backend/src/services/FinanceService.js': `const FinanceRepository = require('../repositories/FinanceRepository');\n\nexports.hoanCoc = async (data) => {\n    // Xử lý logic tại đây (ví dụ: tính toán khấu trừ)\n    return await FinanceRepository.updateHopDong(data);\n};`,
  'backend/src/repositories/FinanceRepository.js': `const db = require('../config/db'); // Kết nối DB\n\nexports.updateHopDong = async (data) => {\n    // Chỉ ghi câu lệnh SQL tại đây\n    // return await db.query('UPDATE HopDong SET ...');\n    return { success: true, message: 'Đã cập nhật hợp đồng' };\n};`,
};

// Generate stubs for the other 3 members
const members = [
  { name: 'Auth', file: 'authRoutes.js' },
  { name: 'Service', file: 'serviceRoutes.js' },
  { name: 'Booking', file: 'bookingRoutes.js' }
];

members.forEach(m => {
  files[\`backend/src/routes/\${m.file}\`] = \`const express = require('express');\\nconst router = express.Router();\\nconst \${m.name}Controller = require('../controllers/\${m.name}Controller');\\n\\nmodule.exports = router;\`;
  files[\`backend/src/controllers/\${m.name}Controller.js\`] = \`const \${m.name}Service = require('../services/\${m.name}Service');\\n\`;
  files[\`backend/src/services/\${m.name}Service.js\`] = \`const \${m.name}Repository = require('../repositories/\${m.name}Repository');\\n\`;
  files[\`backend/src/repositories/\${m.name}Repository.js\`] = \`const db = require('../config/db');\\n\`;
});

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(root, filepath), content);
}

console.log('Structure created successfully!');
