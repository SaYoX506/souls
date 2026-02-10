const https = require('https');
const path = require('path');

function uploadToGitHub(filename, buffer) {
    return new Promise((resolve, reject) => {
        const token = process.env.GITHUB_TOKEN;
        const repo = process.env.GITHUB_REPO; // e.g., "username/repo"
        const branch = process.env.GITHUB_BRANCH || 'main';

        if (!token || !repo) {
            return reject(new Error('Missing GITHUB_TOKEN or GITHUB_REPO env vars'));
        }

        const filePath = `public/useravatarandbanner/${filename}`;
        const apiUrl = `/repos/${repo}/contents/${filePath}`;

        // 1. Get current SHA (if file exists) to allow update
        const getOptions = {
            hostname: 'api.github.com',
            path: `/${repo}/contents/${filePath}?ref=${branch}`, // Fix: correct path
            method: 'GET',
            headers: {
                'User-Agent': 'Souls-App',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        const getReq = https.request(getOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                let sha = null;
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        sha = json.sha;
                    } catch (e) {
                        console.error('Error parsing GitHub response:', e);
                    }
                }

                // 2. Upload (PUT)
                const content = buffer.toString('base64');
                const body = JSON.stringify({
                    message: `Update ${filename} via Web Dashboard [skip ci]`,
                    content: content,
                    branch: branch,
                    sha: sha // Include SHA if updating
                });

                const putOptions = {
                    hostname: 'api.github.com',
                    path: apiUrl,
                    method: 'PUT',
                    headers: {
                        'User-Agent': 'Souls-App',
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(body)
                    }
                };

                const putReq = https.request(putOptions, (putRes) => {
                    let putData = '';
                    putRes.on('data', (chunk) => putData += chunk);
                    putRes.on('end', () => {
                        if (putRes.statusCode === 200 || putRes.statusCode === 201) {
                            // Construct raw URL
                            // https://raw.githubusercontent.com/USER/REPO/BRANCH/PATH
                            const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${filePath}`;
                            resolve(rawUrl);
                        } else {
                            reject(new Error(`GitHub Upload Failed: ${putRes.statusCode} ${putData}`));
                        }
                    });
                });

                putReq.on('error', (e) => reject(e));
                putReq.write(body);
                putReq.end();
            });
        });

        getReq.on('error', (e) => reject(e));
        getReq.end();
    });
}

// Helper: Get File SHA (needed for updates)
function getFileSha(path, token, repo, branch) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${repo}/contents/${path}?ref=${branch}`,
            method: 'GET',
            headers: {
                'User-Agent': 'Souls-App',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try { resolve(JSON.parse(data).sha); } catch { resolve(null); }
                } else { resolve(null); }
            });
        });
        req.on('error', () => resolve(null));
        req.end();
    });
}

function getJson(filename) {
    return new Promise((resolve, reject) => {
        const token = process.env.GITHUB_TOKEN;
        const repo = process.env.GITHUB_REPO;
        const branch = process.env.GITHUB_BRANCH || 'main';
        if (!token || !repo) return resolve(null); // Fallback to local if no env

        const options = {
            hostname: 'api.github.com',
            path: `/repos/${repo}/contents/${filename}?ref=${branch}`,
            method: 'GET',
            headers: {
                'User-Agent': 'Souls-App',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3.raw' // Request RAW content
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
                } else {
                    console.error('GitHub GET Error:', res.statusCode);
                    resolve(null);
                }
            });
        });
        req.on('error', (e) => { console.error(e); resolve(null); });
        req.end();
    });
}

async function saveJson(filename, content) {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    if (!token || !repo) return false;

    // 1. Get SHA to update
    const sha = await getFileSha(filename, token, repo, branch);

    // 2. Upload
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            message: `Update ${filename} via Web [skip ci]`,
            content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
            branch: branch,
            sha: sha
        });

        const options = {
            hostname: 'api.github.com',
            path: `/repos/${repo}/contents/${filename}`,
            method: 'PUT',
            headers: {
                'User-Agent': 'Souls-App',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode === 200 || res.statusCode === 201) resolve(true);
            else resolve(false);
        });
        req.on('error', () => resolve(false));
        req.write(body);
        req.end();
    });
}

module.exports = { uploadToGitHub, getJson, saveJson };
