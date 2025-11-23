// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();

// 允许任意前端访问（开发阶段图省事）
app.use(cors());
app.use(express.json());

// 用内存保存上传的图片（重启会清空，先练手用）
const photos = []; // { id, userId, base64, filename, uploadedAt }

// multer：接收上传文件，先放在内存里
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 最大 5MB 一张，自己可调
});

// 主页测试接口
app.get('/', (req, res) => {
  res.send('Random Gallery backend is running ✅');
});

// 上传接口：POST /upload
app.post('/upload', upload.single('file'), (req, res) => {
  const userId = req.headers['x-user-id'] || 'test-user';

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  const base64 = req.file.buffer.toString('base64');
  const id = Date.now().toString() + Math.random().toString(16).slice(2);

  photos.push({
    id,
    userId,
    base64,
    filename: req.file.originalname,
    uploadedAt: new Date().toISOString()
  });

  res.json({ success: true, id });
});

// 管理端接口：GET /admin/photos
app.get('/admin/photos', (req, res) => {
  res.json(photos);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
});
