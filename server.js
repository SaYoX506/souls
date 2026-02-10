const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Configure Storage (Memory Storage for Vercel/Cloud)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { uploadToGitHub, getJson, saveJson } = require('./lib/github');

// API: List Emojis
app.get('/api/emojis', (req, res) => {
    const emojiDir = path.join(__dirname, 'public', 'emojis');
    fs.readdir(emojiDir, (err, files) => {
        if (err) return res.json([]);
        // Filter for images/gifs only
        const emojis = files.filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f));
        res.json(emojis);
    });
});



// API: Get Cloud Data
app.get('/api/data', async (req, res) => {
    try {
        const data = await getJson('data.json');
        if (data) {
            console.log('✅ Loaded data from GitHub');
            res.json(data);
        } else {
            console.log('⚠️ No GitHub data found, using local default');
            res.status(404).json({ error: 'Not found' });
        }
    } catch (err) {
        console.error('GitHub Fetch Error:', err);
        res.status(500).json({ error: 'Failed to fetch' });
    }
});

// API: Save Cloud Data
app.post('/api/save', async (req, res) => {
    try {
        const success = await saveJson('data.json', req.body);
        if (success) {
            console.log('✅ Saved data to GitHub');
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'GitHub Save Failed' });
        }
    } catch (err) {
        console.error('GitHub Save Error:', err);
        res.status(500).json({ error: 'Failed to save' });
    }
});

// API: Upload Image (Enhanced with GitHub Support)
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // 1. Generate Unique Filename
    const userId = req.body.userId;
    const type = req.body.type;
    const ext = path.extname(req.file.originalname) || '.png';
    const filename = `${userId}_${type}_${Date.now()}${ext}`;

    // 2. Check if we should use GitHub (Vercel Mode)
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
        try {
            console.log(`🚀 Uploading to GitHub: ${filename}`);
            // Buffer is available directly in req.file.buffer with memoryStorage
            const rawUrl = await uploadToGitHub(filename, req.file.buffer);
            console.log(`✅ GitHub Upload Success: ${rawUrl}`);
            return res.json({ path: rawUrl });

        } catch (err) {
            console.error('❌ GitHub Upload Error:', err);
            return res.status(500).json({ error: 'GitHub Upload Failed' });
        }
    }

    // 3. Local Mode Fallback (Not recommended for Vercel)
    console.warn('⚠️ GitHub tokens missing, attempting local save');

    try {
        const uploadDir = path.join(__dirname, 'public', 'useravatarandbanner');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        res.json({ path: `useravatarandbanner/${filename}` });
    } catch (e) {
        console.error("Local save failed (Read-only FS?):", e);
        res.status(500).json({ error: "Upload failed: Read-only filesystem" });
    }
});

// Export for Vercel (Serverless)
module.exports = app;

// Start Server (Local Only)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`✅ Soul's Server running at http://localhost:${port}`);
        console.log(`📂 Serving public folder`);
    });
}
