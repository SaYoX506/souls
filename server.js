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

// Configure Storage
const uploadDir = path.join(__dirname, 'public', 'useravatarandbanner');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.body.userId;
        const type = req.body.type; // 'avatar' or 'banner'

        if (!userId || !type) {
            return cb(new Error('Missing userId or type'));
        }

        const ext = path.extname(file.originalname) || '.png';
        // NUCLEAR FIX: Add timestamp to filename to FORCE unique URL
        // e.g. hxkn_avatar_173892.png
        const timestamp = Date.now();
        const finalName = `${userId}_${type}_${timestamp}${ext}`;

        // Cleanup: Delete ALL old versions of this file (avatar or banner)
        try {
            const files = fs.readdirSync(uploadDir);
            const prefix = `${userId}_${type}`;

            files.forEach(f => {
                // Check if file starts with "hxkn_avatar"
                if (f.startsWith(prefix)) {
                    try {
                        fs.unlinkSync(path.join(uploadDir, f));
                        console.log(`🗑️ Deleted old version: ${f}`);
                    } catch (e) {
                        // Ignore errors (e.g. file locked), but try to proceed
                        console.error(`Could not delete ${f}:`, e.message);
                    }
                }
            });
        } catch (err) {
            console.error('Cleanup warning:', err);
        }

        cb(null, finalName);
    }
});

const upload = multer({ storage: storage });

const { uploadToGitHub, getJson, saveJson } = require('./lib/github');

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

    // 1. Check if we should use GitHub (Vercel Mode)
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
        try {
            console.log(`🚀 Uploading to GitHub: ${req.file.filename}`);
            // Read the file we just saved locally (Multer saves it to tmp/uploads first)
            const filePath = path.join(uploadDir, req.file.filename);
            const fileBuffer = fs.readFileSync(filePath);

            // Upload to GitHub
            // Note: The library function expects filename, we give it the unique one
            const rawUrl = await uploadToGitHub(req.file.filename, fileBuffer);

            // Cleanup local file (since we are on Vercel/Serverless, or just don't need it if using GitHub)
            // But if we are local, we might want to keep it? 
            // Better to keep consistent: If GitHub mode, we rely on GitHub.
            // On Vercel, this local file would be gone anyway.

            console.log(`✅ GitHub Upload Success: ${rawUrl}`);

            // Return the GitHub Raw URL directly
            return res.json({ path: rawUrl });

        } catch (err) {
            console.error('❌ GitHub Upload Error:', err);
            return res.status(500).json({ error: 'GitHub Upload Failed' });
        }
    }

    // 2. Local Mode (Default)
    // Return path relative to 'public' folder
    const relativePath = `useravatarandbanner/${req.file.filename}`;
    console.log(`✅ Local Upload: ${req.file.filename}`);
    res.json({ path: relativePath });
});

app.listen(port, () => {
    console.log(`✅ Soul's Server running at http://localhost:${port}`);
    console.log(`📂 Serving public folder`);
});
