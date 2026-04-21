'use strict';

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const multer     = require('multer');
const sharp      = require('sharp');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// Paths — use /tmp on Vercel (writable), local otherwise
// ─────────────────────────────────────────────
const IS_VERCEL   = !!process.env.VERCEL;
const TMP_DIR     = IS_VERCEL ? '/tmp/wedding-data' : path.join(__dirname, 'data');
const DATA_DIR    = path.join(__dirname, 'data');
const CONTENT_PATH = path.join(DATA_DIR, 'content.json');   // read from bundle
const RSVP_PATH    = path.join(TMP_DIR, 'rsvp.json');       // writable
const USERS_PATH   = path.join(TMP_DIR, 'users.json');      // writable
const IMAGES_DIR   = IS_VERCEL ? '/tmp/wedding-images' : path.join(__dirname, 'public', 'images');
const UPLOADS_DIR  = IS_VERCEL ? '/tmp/wedding-uploads' : path.join(__dirname, 'uploads');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';
const SALT_ROUNDS = 12;

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
// Bootstrap — ensure data files exist
// ─────────────────────────────────────────────
async function bootstrap() {
  if (IS_VERCEL) fs.mkdirSync(TMP_DIR, { recursive: true });
  if (!IS_VERCEL) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  // Ensure image subdirs
  const imageFolders = ['hero', 'gallery', 'couple', 'story', 'schedule'];
  for (const folder of imageFolders) {
    const dir = path.join(IMAGES_DIR, folder);
    fs.mkdirSync(dir, { recursive: true });
  }

  // Create users.json from DEFAULT_ADMIN_PASSWORD if missing
  if (!fs.existsSync(USERS_PATH)) {
    const defaultPass = process.env.DEFAULT_ADMIN_PASSWORD;
    if (!defaultPass) {
      console.error('ERROR: Set DEFAULT_ADMIN_PASSWORD in env before first run');
      if (!IS_VERCEL) process.exit(1);
      return;
    }
    const hash = await bcrypt.hash(defaultPass, SALT_ROUNDS);
    fs.writeFileSync(USERS_PATH, JSON.stringify([{ id: '1', username: 'admin', password: hash }], null, 2));
    console.log('✅  Created admin account from DEFAULT_ADMIN_PASSWORD');
  }

  // Init rsvp.json
  if (!fs.existsSync(RSVP_PATH)) {
    fs.writeFileSync(RSVP_PATH, '[]');
  }

  // content.json is bundled in repo — only create if truly missing
  if (!fs.existsSync(CONTENT_PATH)) {
    fs.writeFileSync(CONTENT_PATH, JSON.stringify(defaultContent(), null, 2));
    console.log('✅  Created default content.json');
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ─────────────────────────────────────────────
// Auth middleware
// ─────────────────────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─────────────────────────────────────────────
// Multer — memory storage for sharp processing
// ─────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB raw, sharp will compress
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// ─────────────────────────────────────────────
// API — Auth
// ─────────────────────────────────────────────

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    const users = readJSON(USERS_PATH);
    const user = users[0]; // single admin
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/change-password
app.post('/api/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });

    const users = readJSON(USERS_PATH);
    const user  = users[0];
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ error: 'Old password is incorrect' });

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    writeJSON(USERS_PATH, users);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// API — Content
// ─────────────────────────────────────────────

// GET /api/content
app.get('/api/content', (_req, res) => {
  try {
    res.json(readJSON(CONTENT_PATH));
  } catch {
    res.json(defaultContent());
  }
});

// GET /api/content/:section
app.get('/api/content/:section', (req, res) => {
  try {
    const content = readJSON(CONTENT_PATH);
    const section = content[req.params.section];
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/content/:section
app.put('/api/content/:section', requireAuth, (req, res) => {
  try {
    const content = readJSON(CONTENT_PATH);
    const { section } = req.params;
    const allowed = ['general','hero','story','couple','location','schedule','gallery','details','saigonGuide'];
    if (!allowed.includes(section)) return res.status(400).json({ error: 'Unknown section' });

    content[section] = req.body;
    writeJSON(CONTENT_PATH, content);
    res.json({ success: true, section });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// API — Image Upload
// ─────────────────────────────────────────────

// POST /api/upload/:folder
app.post('/api/upload/:folder', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const folder = req.params.folder;
    const allowedFolders = ['hero', 'gallery', 'couple', 'story', 'schedule'];
    if (!allowedFolders.includes(folder)) return res.status(400).json({ error: 'Invalid folder' });

    const timestamp = Date.now();
    const safeName  = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
    const filename  = `${timestamp}-${safeName.replace(/\.[^.]+$/, '')}.jpg`;
    const outputDir = path.join(IMAGES_DIR, folder);
    const outputPath = path.join(outputDir, filename);

    const maxWidth = folder === 'hero' ? 2400 : folder === 'gallery' ? 1800 : 1200;

    await sharp(req.file.buffer)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);

    res.json({ url: `/images/${folder}/${filename}`, filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// DELETE /api/image
app.delete('/api/image', requireAuth, (req, res) => {
  try {
    const { imagePath } = req.body;
    if (!imagePath) return res.status(400).json({ error: 'imagePath required' });

    // Security: only allow deleting from public/images/
    const resolved = path.resolve(path.join(__dirname, 'public', imagePath));
    const imagesRoot = path.resolve(IMAGES_DIR);
    if (!resolved.startsWith(imagesRoot)) {
      return res.status(403).json({ error: 'Path not allowed' });
    }

    if (fs.existsSync(resolved)) {
      fs.unlinkSync(resolved);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// API — RSVP
// ─────────────────────────────────────────────

// POST /api/rsvp
app.post('/api/rsvp', (req, res) => {
  try {
    const { name, phone, attend, guests, event, message } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!attend) return res.status(400).json({ error: 'Attendance confirmation required' });

    const list = readJSON(RSVP_PATH);
    const entry = {
      id:        Date.now().toString(),
      name:      name.trim().slice(0, 100),
      phone:     (phone || '').trim().slice(0, 20),
      attend:    attend === 'yes' ? 'yes' : 'no',
      guests:    Math.min(parseInt(guests) || 1, 10),
      event:     event || 'reception',
      message:   (message || '').trim().slice(0, 500),
      createdAt: new Date().toISOString(),
    };
    list.push(entry);
    writeJSON(RSVP_PATH, list);
    res.json({ success: true, id: entry.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/rsvp (admin)
app.get('/api/rsvp', requireAuth, (_req, res) => {
  try {
    res.json(readJSON(RSVP_PATH));
  } catch {
    res.json([]);
  }
});

// DELETE /api/rsvp/:id (admin)
app.delete('/api/rsvp/:id', requireAuth, (req, res) => {
  try {
    const list    = readJSON(RSVP_PATH);
    const updated = list.filter(r => r.id !== req.params.id);
    if (updated.length === list.length) return res.status(404).json({ error: 'Not found' });
    writeJSON(RSVP_PATH, updated);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/rsvp/export — CSV download (admin)
app.get('/api/rsvp/export', requireAuth, (_req, res) => {
  try {
    const list = readJSON(RSVP_PATH);
    const headers = ['STT','Tên','SĐT','Tham dự','Số khách','Sự kiện','Lời nhắn','Thời gian'];
    const rows    = list.map((r, i) => [
      i + 1,
      `"${r.name.replace(/"/g, '""')}"`,
      r.phone,
      r.attend === 'yes' ? 'Có' : 'Không',
      r.guests,
      r.event,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      new Date(r.createdAt).toLocaleString('vi-VN'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="rsvp-kevin-ady.csv"');
    res.send('﻿' + csv); // BOM for Excel Vietnamese
  } catch (err) {
    res.status(500).json({ error: 'Export failed' });
  }
});

// ─────────────────────────────────────────────
// SPA fallback for /admin route
// ─────────────────────────────────────────────
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ─────────────────────────────────────────────
// Error handler
// ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large (max 20MB)' });
  res.status(500).json({ error: 'Internal server error' });
});

// ─────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────
if (IS_VERCEL) {
  // Serverless: wrap app to await bootstrap before handling any request
  const bootstrapPromise = bootstrap().catch(console.error);
  const handler = async (req, res) => {
    await bootstrapPromise;
    app(req, res);
  };
  module.exports = handler;
} else {
  bootstrap().then(() => {
    app.listen(PORT, () => {
      console.log(`\n🌸  Kevin & Ady Wedding Server`);
      console.log(`    Public site: http://localhost:${PORT}`);
      console.log(`    Admin panel: http://localhost:${PORT}/admin\n`);
    });
  });
}

// ─────────────────────────────────────────────
// Default content
// ─────────────────────────────────────────────
function defaultContent() {
  return {
    general: {
      groom: { vi: 'Kevin', en: 'Kevin' },
      bride: { vi: 'Ady', en: 'Ady' },
      weddingDate: '2026-11-15T18:00:00+07:00',
      hashtag: '#KevinAndAdyForever',
      venue: { vi: 'An Lam Retreats Saigon, Hồ Chí Minh, Việt Nam', en: 'An Lam Retreats Saigon, Ho Chi Minh, Vietnam' },
    },
    hero: {
      image: '',
      dateText:  { vi: '15 Tháng Mười Một 2026', en: '15 November 2026' },
      venueText: { vi: 'An Lam Retreats Saigon, Hồ Chí Minh, Việt Nam', en: 'An Lam Retreats Saigon, Ho Chi Minh, Vietnam' },
      hashtag: '#KevinAndAdyForever',
    },
    story: {
      subtitle: { vi: '(Qua lăng kính của Kevin ;))', en: "(Through Kevin's lens ;))" },
      paragraphs: [
        {
          vi: 'Chúng mình gặp nhau vào một buổi chiều tháng Ba, tại một quán cà phê nhỏ ở Quận 1. Lúc đó mình chỉ nghĩ đây là một cuộc hẹn bình thường — nhưng hóa ra là cuộc hẹn thay đổi cả cuộc đời.',
          en: 'We met on a quiet March afternoon at a small café in District 1. I thought it was just another ordinary date — turns out it was the one that changed everything.',
        },
        {
          vi: 'Ady có cái cười làm mình quên hết mọi thứ. Cô ấy nói chuyện với ánh mắt long lanh, và mình biết mình đã thua ngay từ đầu.',
          en: "Ady has a smile that makes everything else disappear. She talks with bright, sparkling eyes — and I knew I was gone from the very start.",
        },
        {
          vi: 'Hai năm rưỡi sau, mình quỳ xuống ở đúng nơi chúng mình lần đầu hẹn hò — và cô ấy đã nói có. Giờ chúng mình sắp bắt đầu chương mới đẹp nhất của cuộc đời.',
          en: "Two and a half years later, I got down on one knee at the very same spot — and she said yes. Now we're about to start the most beautiful chapter of our lives.",
        },
        {
          vi: 'Cảm ơn bạn đã là một phần trong hành trình của chúng mình. Sự hiện diện của bạn là món quà lớn nhất.',
          en: 'Thank you for being part of our journey. Your presence is the greatest gift of all.',
        },
      ],
      image: '',
    },
    couple: {
      groom: {
        name: 'Kevin',
        role: { vi: 'Chú rể', en: 'The Groom' },
        desc: {
          vi: 'Yêu cà phê sáng, ghét dậy sớm. Luôn cố gắng nấu ngon nhưng kết quả... thường là gọi đồ ăn. Yêu Ady bằng cả trái tim và còn thêm vài phần nữa.',
          en: 'Loves morning coffee, hates waking up for it. Always tries to cook well but the result... usually ends with delivery. Loves Ady with all his heart and then some.',
        },
        portrait: '',
      },
      bride: {
        name: 'Ady',
        role: { vi: 'Cô dâu', en: 'The Bride' },
        desc: {
          vi: 'Cô gái của những buổi chiều xem phim, những trang sách thơm, và tiếng cười giòn tan. Người đã biến căn nhà nhỏ của Kevin thành ngôi nhà thực sự.',
          en: "A girl of lazy movie afternoons, good books, and the most contagious laugh. The one who turned Kevin's little apartment into a real home.",
        },
        portrait: '',
      },
    },
    location: {
      note: {
        vi: 'Chúng mình khuyến khích bạn thêm 30 phút so với thời gian Google Maps hiển thị để tránh kẹt xe.\n\nAn Lam Saigon River có dịch vụ đưa đón bằng thuyền miễn phí từ Quận 1 và Quận 2 đến địa điểm tiệc theo khung giờ cố định.',
        en: 'We recommend allowing an extra 30 minutes on top of the travel time shown on Google Maps to account for traffic.\n\nAn Lam Saigon River offers complimentary boat transfers from District 1 and District 2 to the reception venue at scheduled times.',
      },
      venues: [
        {
          id: '1',
          name:    'Nhà thờ Chợ Quán',
          address: { vi: '120 Trần Bình Trọng, Phường 2, Chợ Quán, Hồ Chí Minh', en: '120 Tran Binh Trong, Ward 2, Cho Quan, Ho Chi Minh' },
          image:   '',
          mapUrl:  '',
        },
        {
          id: '2',
          name:    'Saigon River House, An Lam Retreats',
          address: { vi: '785 Trung Lương, Vĩnh Phú, Biên Hoà, Hồ Chí Minh', en: '785 Trung Luong, Vinh Phu, Bien Hoa, Ho Chi Minh' },
          image:   '',
          mapUrl:  '',
        },
      ],
    },
    schedule: {
      dateHeading: { vi: 'Chủ Nhật, 15 tháng 11 năm 2026', en: 'Sunday, 15th November 2026' },
      image: '',
      imageLabel:  { vi: 'Địa điểm tiệc', en: 'Wedding Venue' },
      items: [
        { id: '1', time: '9:00 SA',  event: { vi: 'Lễ gia tiên',       en: 'Tea Ceremony' } },
        { id: '2', time: '10:30 SA', event: { vi: 'Lễ rước dâu',       en: "Bride's Farewell" } },
        { id: '3', time: '4:30 CH',  event: { vi: 'Lễ trao lời thề',   en: 'Vow Ceremony' } },
        { id: '4', time: '6:00 CH',  event: { vi: 'Đón khách & Khai tiệc', en: 'Reception Starts' } },
        { id: '5', time: '7:00 CH',  event: { vi: 'Tiệc tối',          en: 'Dinner Served' } },
        { id: '6', time: '9:00 CH',  event: { vi: 'Tiễn khách',        en: 'Farewell' } },
      ],
    },
    gallery: [
      { id: '1',  src: '', size: 'big',    caption: { vi: 'Khoảnh khắc đầu tiên',  en: 'First moment' },       order: 1  },
      { id: '2',  src: '', size: 'tall',   caption: { vi: 'Ánh mắt',                en: 'The look' },             order: 2  },
      { id: '3',  src: '', size: 'square', caption: { vi: 'Niềm vui',               en: 'Pure joy' },             order: 3  },
      { id: '4',  src: '', size: 'wide',   caption: { vi: 'Cùng nhau',              en: 'Together' },             order: 4  },
      { id: '5',  src: '', size: 'small',  caption: { vi: 'Chi tiết nhỏ',           en: 'Small details' },        order: 5  },
      { id: '6',  src: '', size: 'medium', caption: { vi: 'Khoảnh khắc vàng',       en: 'Golden moment' },        order: 6  },
      { id: '7',  src: '', size: 'square', caption: { vi: 'Nụ cười',                en: 'Smiles' },               order: 7  },
      { id: '8',  src: '', size: 'tall',   caption: { vi: 'Lãng mạn',               en: 'Romance' },              order: 8  },
      { id: '9',  src: '', size: 'wide',   caption: { vi: 'Hoàng hôn',              en: 'Sunset' },               order: 9  },
      { id: '10', src: '', size: 'big',    caption: { vi: 'Hạnh phúc',              en: 'Happiness' },            order: 10 },
      { id: '11', src: '', size: 'small',  caption: { vi: 'Tình yêu',               en: 'Love' },                 order: 11 },
      { id: '12', src: '', size: 'medium', caption: { vi: 'Mãi mãi',                en: 'Forever' },              order: 12 },
    ],
    details: {
      dressCode: {
        title:   { vi: 'Trang phục', en: 'Dress Code' },
        flower:  'rose',
        swatches: ['#d4cfc0', '#f5d742', '#c97b6f', '#ede6cf', '#c9b28a'],
        content: {
          vi: 'Garden Formal hoặc Cocktail\nChúng mình rất vui khi bạn ăn mặc theo gam màu đất hoặc vàng ánh kim.\nVui lòng tránh mặc trắng hoàn toàn.',
          en: 'Garden Formal or Cocktail\nWe would love for you to dress in earthy tones or warm gold hues.\nPlease avoid all-white outfits.',
        },
      },
      wishingWell: {
        title:   { vi: 'Hộp quà tặng', en: 'Wishing Well' },
        flower:  'daisy',
        content: {
          vi: 'Sự hiện diện của bạn là món quà lớn nhất với chúng mình.\nNếu bạn muốn tặng thêm, chúng mình trân trọng những đóng góp cho "Quỹ tuần trăng mật" — hộp phong bì sẽ có tại buổi tiệc.',
          en: 'Your presence is the greatest gift we could ask for.\nIf you wish to give more, we would gratefully welcome contributions to our "Honeymoon Fund" — an envelope box will be available at the reception.',
        },
      },
      diningNotes: {
        title:   { vi: 'Thực đơn', en: 'Dining Notes' },
        flower:  'tulip',
        content: {
          vi: 'Tối hôm đó chúng mình sẽ phục vụ theo phong cách chia sẻ bàn — nhiều món nhỏ đặc sắc từ đầu bếp của An Lam.\n\nDành cho các bé, sẽ có menu riêng phù hợp với trẻ em. Nếu có dị ứng thực phẩm, vui lòng ghi trong phần lời nhắn khi RSVP.',
          en: 'We will be serving a shared-plates style dinner — a selection of small, beautifully crafted dishes by An Lam\'s kitchen team.\n\nFor little ones, a children\'s menu will be available. If you have any dietary requirements, please let us know in your RSVP message.',
        },
      },
    },
    saigonGuide: {
      stays: [
        { id: 's1', tag: { vi: 'Khách sạn 5 sao', en: 'Luxury Hotel' },     name: 'Park Hyatt Saigon',             desc: { vi: 'Khách sạn sang trọng bậc nhất ngay trung tâm Quận 1, đối diện Nhà hát Thành phố.', en: 'The pinnacle of Saigon luxury, right on the city square opposite the Opera House.' },           area: { vi: 'Quận 1', en: 'District 1' } },
        { id: 's2', tag: { vi: 'Boutique', en: 'Boutique Hotel' },           name: 'The Reverie Saigon',             desc: { vi: 'Khách sạn boutique siêu sang với nội thất Ý xa hoa, view sông tuyệt đẹp.', en: 'Ultra-luxurious boutique hotel with Italian furnishings and stunning river views.' },               area: { vi: 'Quận 1', en: 'District 1' } },
        { id: 's3', tag: { vi: 'Tầm trung', en: 'Mid-Range' },               name: 'Silverland Jolie Hotel',        desc: { vi: 'Khách sạn ấm cúng, vị trí trung tâm, phòng sạch đẹp, nhân viên thân thiện.', en: 'Cozy boutique hotel with a central location, spotless rooms and friendly staff.' },               area: { vi: 'Quận 1', en: 'District 1' } },
        { id: 's4', tag: { vi: 'Design Hotel', en: 'Design Hotel' },         name: 'Fusion Suites Saigon',          desc: { vi: 'Concept spa-hotel độc đáo, mỗi phòng đều có spa riêng tư miễn phí mỗi ngày.', en: 'Unique spa-hotel concept where every room includes a complimentary daily spa treatment.' },         area: { vi: 'Quận Bình Thạnh', en: 'Binh Thanh' } },
        { id: 's5', tag: { vi: 'Ngân sách', en: 'Budget' },                  name: 'The Common Room Project',       desc: { vi: 'Hostel & guesthouse hiện đại, cộng đồng backpacker thân thiện, giá hợp lý.', en: 'Modern hostel & guesthouse with a welcoming backpacker community and great prices.' },              area: { vi: 'Quận 1', en: 'District 1' } },
        { id: 's6', tag: { vi: 'Căn hộ', en: 'Apartment' },                  name: 'Vinhomes Golden River Rentals', desc: { vi: 'Căn hộ cao cấp ngắn hạn, tầm view đẹp ra sông và thành phố, bếp riêng tiện lợi.', en: 'Premium short-term apartments with stunning river & city views and private kitchens.' },          area: { vi: 'Quận 1', en: 'District 1' } },
      ],
      eat: [
        { id: 'e1', tag: { vi: 'Phở truyền thống', en: 'Traditional Pho' }, name: 'Phở Hòa Pasteur',               desc: { vi: 'Quán phở lâu đời nhất Sài Gòn. Nước dùng hầm 12 tiếng, thịt bò tươi ngon.', en: 'One of Saigon\'s oldest pho spots. 12-hour broth, fresh beef, no frills — just perfect.' },            area: { vi: 'Quận 3', en: 'District 3' } },
        { id: 'e2', tag: { vi: 'Bánh mì', en: 'Banh Mi' },                   name: 'Bánh Mì Huỳnh Hoa',             desc: { vi: 'Bánh mì nhân đầy ú, hàng dài mỗi sáng — xứng đáng chờ đợi.', en: 'Overstuffed bánh mì with a queue every morning — always worth the wait.' },                                       area: { vi: 'Quận 3', en: 'District 3' } },
        { id: 'e3', tag: { vi: 'Fine Dining', en: 'Fine Dining' },           name: 'Anan Saigon',                   desc: { vi: 'Nhà hàng đương đại của chef Peter Cuong Franklin — reimagine ẩm thực Việt theo cách hiện đại.', en: 'Chef Peter Cuong Franklin\'s contemporary restaurant reimagining Vietnamese food.' },       area: { vi: 'Quận 1', en: 'District 1' } },
        { id: 'e4', tag: { vi: 'Cà phê', en: 'Café' },                       name: 'The Workshop Coffee',           desc: { vi: 'Không gian làm việc & cà phê specialty yên tĩnh ngay trung tâm. Cà phê pha tay tuyệt hảo.', en: 'Quiet specialty coffee & work space right in the centre. Exceptional pour-overs.' },           area: { vi: 'Quận 1', en: 'District 1' } },
        { id: 'e5', tag: { vi: 'Cocktail Bar', en: 'Cocktail Bar' },         name: 'The Long Bar',                  desc: { vi: 'Bar cổ điển bên trong khách sạn Caravelle, cocktails sáng tạo, nhạc jazz nhẹ nhàng.', en: 'Classic bar inside the Caravelle Hotel, creative cocktails, smooth live jazz.' },               area: { vi: 'Quận 1', en: 'District 1' } },
        { id: 'e6', tag: { vi: 'Hải sản', en: 'Seafood' },                   name: 'Quán Hải Sản Bến Bình Đông',   desc: { vi: 'Khu ăn hải sản tươi sống theo cân, chế biến tại chỗ, vibe bình dân cực kỳ đặc trưng Sài Gòn.', en: 'Live seafood priced by weight, cooked on the spot — quintessential Saigon street vibes.' }, area: { vi: 'Quận 8', en: 'District 8' } },
      ],
      explore: [
        { id: 'x1', tag: { vi: 'Di tích lịch sử', en: 'Historic Site' },    name: 'Dinh Độc Lập',                  desc: { vi: 'Công trình kiến trúc lịch sử biểu tượng, mang đậm dấu ấn lịch sử Việt Nam thế kỷ 20.', en: 'Iconic architectural landmark carrying the weight of 20th-century Vietnamese history.' },        area: { vi: 'Quận 1', en: 'District 1' } },
        { id: 'x2', tag: { vi: 'Bảo tàng', en: 'Museum' },                  name: 'Bảo Tàng Chứng Tích Chiến Tranh', desc: { vi: 'Bảo tàng đầy cảm xúc về chiến tranh Việt Nam. Nên đến để hiểu hơn về đất nước và con người Việt.', en: 'Moving war museum offering deep insight into the Vietnam War and its people.' },  area: { vi: 'Quận 3', en: 'District 3' } },
        { id: 'x3', tag: { vi: 'Chợ', en: 'Market' },                       name: 'Chợ Bến Thành',                 desc: { vi: 'Biểu tượng Sài Gòn. Mua sắm, ăn vặt, và chụp ảnh kỷ niệm. Nhớ mặc cả nhé!', en: 'Saigon\'s most iconic market. Shop, snack, and snap photos — always haggle first.' },                 area: { vi: 'Quận 1', en: 'District 1' } },
        { id: 'x4', tag: { vi: 'Kiến trúc', en: 'Architecture' },           name: 'Nhà thờ Đức Bà',                desc: { vi: 'Nhà thờ Công giáo thế kỷ 19 với kiến trúc Gothic đặc sắc giữa trung tâm thành phố.', en: '19th-century Catholic cathedral with striking Gothic architecture in the city centre.' },          area: { vi: 'Quận 1', en: 'District 1' } },
        { id: 'x5', tag: { vi: 'Phố đêm', en: 'Night Life' },               name: 'Phố đi bộ Bùi Viện',            desc: { vi: 'Khu phố Tây tấp nập nhất Sài Gòn. Ăn uống, nhạc sống, và vibe nhiệt đới đặc trưng.', en: 'Saigon\'s liveliest expat street. Food, live music, and the full tropical night vibe.' },              area: { vi: 'Quận 1', en: 'District 1' } },
        { id: 'x6', tag: { vi: 'Thiên nhiên', en: 'Nature' },               name: 'Rừng Ngập Mặn Cần Giờ',        desc: { vi: 'Khu dự trữ sinh quyển UNESCO chỉ 1 tiếng từ trung tâm — hoàn hảo cho chuyến ngoại ô 1 ngày.', en: 'UNESCO biosphere reserve just 1 hour from the centre — perfect for a day trip escape.' },     area: { vi: 'Huyện Cần Giờ', en: 'Can Gio District' } },
      ],
      transport: [
        { id: 't1', tag: { vi: 'Từ sân bay', en: 'From Airport' },          name: 'Taxi từ Tân Sơn Nhất',          desc: { vi: 'Dùng Grab hoặc taxi đồng hồ hãng Vinasun/Mai Linh. Từ sân bay vào trung tâm khoảng 100-150k VNĐ, 30-45 phút.', en: 'Use Grab or metered Vinasun/Mai Linh taxis. Airport to centre ~100-150k VND, 30-45 mins.' }, area: { vi: 'Toàn thành phố', en: 'Citywide' } },
        { id: 't2', tag: { vi: 'Ứng dụng', en: 'App' },                     name: 'Grab',                          desc: { vi: 'Ứng dụng gọi xe số 1 Việt Nam — GrabCar, GrabBike, GrabFood. Thanh toán tiền mặt hoặc thẻ.', en: 'Vietnam\'s no.1 ride-hailing app — GrabCar, GrabBike, GrabFood. Cash or card.' },                area: { vi: 'Toàn thành phố', en: 'Citywide' } },
        { id: 't3', tag: { vi: 'Metro', en: 'Metro' },                       name: 'Metro Tuyến 1 (MRT)',            desc: { vi: 'Tuyến metro đầu tiên của TP.HCM, đi từ Bến Thành đến Suối Tiên, khai trương 2024.', en: 'Ho Chi Minh City\'s first metro line, running from Ben Thanh to Suoi Tien, opened 2024.' },       area: { vi: 'Quận 1 – TP. Thủ Đức', en: 'D1 – Thu Duc' } },
        { id: 't4', tag: { vi: 'Xe máy', en: 'Motorbike' },                 name: 'Thuê xe máy',                   desc: { vi: 'Trải nghiệm Sài Gòn theo cách địa phương nhất. Nhiều chỗ thuê ở Phạm Ngũ Lão, khoảng 150k/ngày.', en: 'The most local way to experience Saigon. Rentals near Pham Ngu Lao from ~150k/day.' },        area: { vi: 'Toàn thành phố', en: 'Citywide' } },
        { id: 't5', tag: { vi: 'Buýt sông', en: 'Water Bus' },              name: 'Buýt Sông Sài Gòn',             desc: { vi: 'Đi thuyền dọc sông Sài Gòn — vừa đi lại thực dụng vừa ngắm thành phố từ trên sông.', en: 'Hop on a river bus along the Saigon River — part commute, part city sightseeing.' },               area: { vi: 'Quận 1 – Bình Thạnh', en: 'D1 – Binh Thanh' } },
        { id: 't6', tag: { vi: 'Xe buýt', en: 'Bus' },                      name: 'Xe buýt công cộng',             desc: { vi: 'Hệ thống xe buýt rộng khắp, giá vé chỉ 7k-10k VNĐ. Dùng app BusMap để tra cứu lộ trình.', en: 'Extensive bus network, tickets just 7k-10k VND. Use the BusMap app to plan routes.' },             area: { vi: 'Toàn thành phố', en: 'Citywide' } },
      ],
      tip: {
        vi: '💡 Mẹo từ người địa phương: Sài Gòn có 2 mùa rõ rệt — mùa mưa (5-11) và mùa khô (12-4). Tháng 11 vẫn có thể có mưa chiều, đừng quên mang ô theo! Và nhớ đổi tiền mặt VNĐ — nhiều quán ăn ngon nhất không nhận thẻ.',
        en: '💡 Local tip: Saigon has two seasons — rainy (May-Nov) and dry (Dec-Apr). November can still bring afternoon showers, so carry a small umbrella! Also, bring cash VND — many of the best local spots are cash-only.',
      },
    },
  };
}
