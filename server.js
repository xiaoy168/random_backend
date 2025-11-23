const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();

// 允许跨域
app.use(cors());
app.use(express.json());

// 用内存保存上传的图片（重启会清空）
const photos = []; // { id, userId, base64, filename, uploadedAt }

// multer：接收上传文件，存在内存里
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 单张最大 20MB，防止 iPhone 原图太大
  },
});

// 测试接口
app.get('/', (req, res) => {
  res.send('Random Gallery backend is running ✅');
});

// 上传接口：POST /upload
app.post('/upload', (req, res) => {
  // 把 multer 当成中间件手动调用，这样可以抓到错误
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Upload failed',
      });
    }

    const userId = req.headers['x-user-id'] || 'test-user';

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    try {
      const base64 = req.file.buffer.toString('base64');
      const id = Date.now().toString() + Math.random().toString(16).slice(2);

      photos.push({
        id,
        userId,
        base64,
        filename: req.file.originalname,
        uploadedAt: new Date().toISOString(),
      });

      res.json({ success: true, id });
    } catch (e) {
      console.error('Unexpected error in /upload:', e);
      res.status(500).json({
        success: false,
        error: e.message || 'Server error',
      });
    }
  });
});

// 管理端接口：GET /admin/photos
app.get('/admin/photos', (req, res) => {
  res.json(photos);
});

// 兜底错误处理（防止其他中间件抛错直接 500 HTML）
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
