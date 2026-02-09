// Core Application Data (v8)
// Core Application Data (v9 - Cloud)
let db = {
    hxkn: {
        id: 'hxkn', name: 'h.xkn', avatar: '', banner: '', avatarUrl: '', bannerUrl: '',
        colorGlow: '#ffffff', colorText: '#ffffff', colorBar: '#ffffff', colorBg: '#000000',
        level: 0, xp: 0, password: null, logs: [], rewards: {},
        status: { emoji: '1019-c-cry.gif', text: '' }
    },
    chidori: {
        id: 'chidori', name: 'Chidori', avatar: '', banner: '', avatarUrl: '', bannerUrl: '',
        colorGlow: '#ffffff', colorText: '#ffffff', colorBar: '#ffffff', colorBg: '#000000',
        level: 0, xp: 0, password: null, logs: [], rewards: {},
        status: { emoji: '1022-c-photo.gif', text: '' }
    }
};

let currentUser = null;
let activeTab = 'xp';
let viewLvl = 0;
let selectedEmoji = null;
let emojisList = [];

// Determine environment
const IS_LOGIN_PAGE = !!document.getElementById('selectionScreen');
const IS_DASHBOARD_PAGE = !!document.getElementById('mainWindow');

// Emoji Files (Mapped to /emojis route)
const EMOJI_FILES = [
    "1019-c-cry.gif", "1022-c-photo.gif", "1089-scarletgun.png", "11453-moderniadum.png", "1186-taiga-stare.png",
    "1272-boyfighting.png", "1335-bleh.png", "13554-kaorukodevilishsmile.png", "1359-c-wow.gif", "1493-c-twirl.gif",
    "1538-marinkitagawa-smile.gif", "1573-d-gimme.gif", "1576-boyangry.png", "1593-c-tears.gif", "1626-marinkitagawa-blush.gif",
    "16329-aqua-crying.png", "163320-usamiangry.png", "1660-giggle.gif", "168691-sakugun.png", "1720-kanna-uhh.png",
    "17302-anime-albedoscold.png", "175089-anyasly.png", "17963-reigun.png", "1848-marinkitagawa-sad.gif", "19168-boring.png",
    "2051-kitagawa-embarrassed.png", "21315-thinking.png", "213792-kaorukocute.png", "2146-c-bite.gif", "227860-kaorukodisgust.png",
    "229140-kyokosigh.png", "2322-shyasf.gif", "23410-taigablush.gif", "2371-marin-touched.png", "2393_bakuNO.png",
    "239945-anyadisgust.png", "2415-100-kannapat.gif", "2425-marin-peak.png", "24878-cute-shy-anime-girl.png", "2575_Suicidekanna.png",
    "2590-marin-shy.gif", "2594-laugh.gif", "2598-doroshifty.png", "2630-marinkitagawa-freaked.gif", "2825-boyconfused.png"
];

const SERVER_URL = ''; // Relative path since we serve from same origin

window.onload = async () => {
    setupEmojis();

    // Load Data from GitHub/Server
    try {
        const res = await fetch('/api/data');
        if (res.ok) {
            const cloudData = await res.json();
            // Deep merge or fallback to default
            if (cloudData && (cloudData.hxkn || cloudData.chidori)) {
                db = { ...db, ...cloudData }; // Merge cloud data on top of defaults
                console.log('✅ Cloud Data Merged');
            } else if (cloudData && cloudData.users) {
                // Handle Migration from Old JSON format
                console.log('⚠️ Detected Old Data Format - Migrating...');
                if (cloudData.users['h.xkn']) {
                    db.hxkn.level = cloudData.users['h.xkn'].level || 0;
                    db.hxkn.xp = cloudData.users['h.xkn'].xp || 0;
                }
                if (cloudData.users['Chidori']) {
                    db.chidori.level = cloudData.users['Chidori'].level || 0;
                    db.chidori.xp = cloudData.users['Chidori'].xp || 0;
                }
            } else {
                console.warn('⚠️ Cloud Data Invalid - Using Defaults');
            }
        }
    } catch (e) {
        console.error('Offline or First Run', e);
    }

    if (IS_LOGIN_PAGE) {
        refreshSelectionAvatars();
        // Clear previous session
        sessionStorage.removeItem('activeUserId');
        sessionStorage.removeItem('isAuth');
    }

    if (IS_DASHBOARD_PAGE) {
        const activeId = sessionStorage.getItem('activeUserId');
        if (!activeId || !db[activeId]) {
            window.location.href = '/'; // Go back to login if no session
            return;
        }
        currentUser = db[activeId];
        viewLvl = currentUser.level;

        // Auth check
        const isAuth = sessionStorage.getItem('isAuth') === 'true';
        if (isAuth) {
            document.getElementById('authStatus').classList.remove('hidden');
            document.getElementById('addBtn').classList.remove('hidden');
            document.getElementById('editBtn').classList.remove('hidden');
        } else {
            document.getElementById('authStatus').classList.add('hidden');
            document.getElementById('addBtn').classList.add('hidden');
            document.getElementById('editBtn').classList.add('hidden');
        }

        renderIdentity();
    }
};

function setupEmojis() {
    emojisList = EMOJI_FILES.map(f => {
        let name = f.split('-').pop().split('.')[0].replace(/[^a-zA-Z]/g, '');
        return { name, file: f };
    });
    selectedEmoji = emojisList[0];
}

function getImgPath(relativeOrFull) {
    if (!relativeOrFull) return null;
    if (relativeOrFull.startsWith('http') || relativeOrFull.startsWith('data:')) return relativeOrFull;
    // Assuming relativeOrFull is like "useravatarandbanner/xxx.png"
    // We need to make sure we serve this correctly.
    // If it starts with "/" use it as is, otherwise prepend "/"
    if (relativeOrFull.startsWith('/')) return relativeOrFull;
    return `/${relativeOrFull}`;
}

const getCacheBustUrl = (url) => {
    if (!url) return null;
    const cleanUrl = getImgPath(url);
    // Always append random timestamp to user uploads to bypass browser/CDN cache
    if (cleanUrl.includes('useravatarandbanner')) {
        return `${cleanUrl}?v=${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
    return cleanUrl;
};

function refreshSelectionAvatars() {
    if (!db.hxkn || !db.chidori) return;
    const hImg = getCacheBustUrl(db.hxkn.avatarUrl || db.hxkn.avatar) || `https://api.dicebear.com/7.x/shapes/svg?seed=hxkn`;
    const cImg = getCacheBustUrl(db.chidori.avatarUrl || db.chidori.avatar) || `https://api.dicebear.com/7.x/shapes/svg?seed=chidori`;
    if (document.getElementById('sel-hxkn-img')) document.getElementById('sel-hxkn-img').src = hImg;
    if (document.getElementById('sel-chidori-img')) document.getElementById('sel-chidori-img').src = cImg;
}

// --- Login Page Logic ---

function initUser(id) {
    currentUser = db[id];
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginPass').value = '';
    document.getElementById('loginPass').focus();
}

function confirmLogin() {
    const input = document.getElementById('loginPass').value;
    if (!currentUser) return showToast("Select a user first", "error");

    if (currentUser.password === null) {
        if (!input) return alert("Key required");
        currentUser.password = input;
        save();
        proceedToDash(true);
    } else if (currentUser.password === input) {
        proceedToDash(true);
    } else {
        showToast("Access Denied", "error");
    }
}

function skipLogin() { proceedToDash(false); }

function proceedToDash(isAuth) {
    sessionStorage.setItem('activeUserId', currentUser.id);
    sessionStorage.setItem('isAuth', isAuth);
    window.location.href = '/dashboard';
}

// --- Dashboard Logic ---

function renderIdentity() {
    document.getElementById('winName').textContent = currentUser.name;
    document.getElementById('winLevelNum').textContent = currentUser.level;

    // Avatar
    let avatarSrc = getCacheBustUrl(currentUser.avatarUrl || currentUser.avatar) ||
        `https://api.dicebear.com/7.x/shapes/svg?seed=${currentUser.id}`;

    document.getElementById('winAvatarImg').src = avatarSrc;

    // Banner
    const banner = document.getElementById('winBanner');
    let bannerSrc = getCacheBustUrl(currentUser.bannerUrl || currentUser.banner);

    if (bannerSrc) {
        banner.style.backgroundImage = `url(${bannerSrc})`;
        banner.style.backgroundSize = 'cover';
        banner.style.backgroundPosition = 'center';
    } else {
        banner.style.background = 'rgba(128,128,128,0.1)';
        banner.style.backgroundImage = 'none';
    }

    const root = document.documentElement;
    root.style.setProperty('--glow-color', currentUser.colorGlow || '#ffffff');
    root.style.setProperty('--text-color', currentUser.colorText || '#ffffff');
    root.style.setProperty('--bar-color', currentUser.colorBar || '#ffffff');
    root.style.setProperty('--profile-bg', currentUser.colorBg || '#000000');

    refreshXP(); refreshViewTier(); renderSignalLogs();

    // Status
    const st = currentUser.status || { emoji: '1019-c-cry.gif', text: '' };
    // Fallback if emoji is old text format
    const emoFile = st.emoji.includes('.') ? st.emoji : '1019-c-cry.gif';
    document.getElementById('winStatusEmoji').src = `emojis/${emoFile}`;
    document.getElementById('winStatusText').textContent = st.text;
}

function refreshXP() {
    const maxXp = 100 + (currentUser.level * 25);
    const progress = (currentUser.xp / maxXp) * 100;
    document.getElementById('winXPBar').style.width = `${progress}%`;
    document.getElementById('winXPStatus').textContent = `${currentUser.xp} / ${maxXp} XP`;

    const dotsCont = document.getElementById('winXPDots');
    dotsCont.innerHTML = '';
    for (let i = 0; i < 20; i++) {
        const d = document.createElement('div');
        d.className = `dot ${i <= (currentUser.level % 20) ? 'active' : ''}`;
        dotsCont.appendChild(d);
    }

    const labelCont = document.getElementById('xpLabelPoints');
    labelCont.innerHTML = '';
    [0, Math.floor(maxXp * 0.25), Math.floor(maxXp * 0.5), Math.floor(maxXp * 0.75), maxXp].forEach(p => {
        const span = document.createElement('span');
        span.className = `xp-point-val ${currentUser.xp >= p ? 'active' : ''}`;
        span.textContent = p; labelCont.appendChild(span);
    });
}

function navViewLevel(dir) { viewLvl = Math.max(0, Math.min(100, viewLvl + dir)); refreshViewTier(); }

function refreshViewTier() {
    document.getElementById('viewLvlLabel').textContent = `Tier ${viewLvl}`;
    document.getElementById('viewLvlReward').textContent = currentUser.rewards[viewLvl] || (viewLvl === 0 ? "Evolution Hub" : "???");

    const isAuth = sessionStorage.getItem('isAuth') === 'true';
    document.getElementById('viewLvlReward').style.opacity = (!isAuth && viewLvl > currentUser.level) ? '0.2' : '1';
}

function renderSignalLogs() {
    const container = document.getElementById('winLogs');
    const logs = currentUser.logs || [];
    if (logs.length === 0) { container.innerHTML = '<div class="py-10 text-center opacity-20 text-[8px] uppercase font-bold tracking-widest">Awaiting Pulse</div>'; return; }
    container.innerHTML = logs.map(l => {
        const emo = emojisList.find(e => e.name === l.emoji) || emojisList[0];
        return `
        <div class="log-item">
            <img src="../emojis/${emo.file}" class="log-emoji">
            <div class="flex-1">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-[10px] font-black ${l.type === 'sub' ? 'text-red-600' : 'text-inherit'}">${l.type === 'sub' ? '-' : '+'}${l.amt} XP</span>
                    <span class="text-[7px] opacity-30 font-black uppercase">${new Date(l.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p class="text-[8px] opacity-60 font-bold uppercase tracking-tight">${l.reason}</p>
            </div>
        </div>`;
    }).join('');
}

function openActionModal() { document.getElementById('actionModal').classList.add('active'); setActionTab('xp'); }

function setActionTab(tab) {
    activeTab = tab;
    document.getElementById('pane-xp').classList.toggle('hidden', tab !== 'xp');
    document.getElementById('pane-rewards').classList.toggle('hidden', tab !== 'rewards');
    const xpBtn = document.getElementById('tab-xp'), rewBtn = document.getElementById('tab-rewards');
    xpBtn.style.background = tab === 'xp' ? '#fff' : 'rgba(128,128,128,0.1)';
    xpBtn.style.color = tab === 'xp' ? '#000' : '#555';
    rewBtn.style.background = tab === 'rewards' ? '#fff' : 'rgba(128,128,128,0.1)';
    rewBtn.style.color = tab === 'rewards' ? '#000' : '#555';
    if (tab === 'rewards') renderRewardsPane();
}

function toggleEmojiPicker() {
    const p = document.getElementById('emojiPicker');
    p.classList.toggle('hidden');
    if (!p.classList.contains('hidden')) {
        p.innerHTML = emojisList.map(e => `
            <button onclick="selectEmoji('${e.name}')" class="p-2 hover:bg-white/10 rounded-xl transition-all"><img src="../emojis/${e.file}" class="w-full h-full object-contain"></button>
        `).join('');
    }
}

function selectEmoji(name) {
    selectedEmoji = emojisList.find(e => e.name === name);
    document.getElementById('selectedEmojiImg').src = `../emojis/${selectedEmoji.file}`;
    document.getElementById('emojiPicker').classList.add('hidden');
}

function applyXP(plus) {
    const amt = parseInt(document.getElementById('xpAmount').value) || 0;
    const reas = document.getElementById('xpReason').value || "Manual Mod";
    if (amt <= 0) return;
    currentUser.xp += plus ? amt : -amt;
    let max = 100 + (currentUser.level * 25);
    while (currentUser.xp >= max && currentUser.level < 100) { currentUser.xp -= max; currentUser.level++; max = 100 + (currentUser.level * 25); }
    while (currentUser.xp < 0 && currentUser.level > 0) { currentUser.level--; max = 100 + (currentUser.level * 25); currentUser.xp += max; }
    currentUser.logs.unshift({ type: plus ? 'add' : 'sub', amt, reason: reas, emoji: selectedEmoji.name, time: new Date().toISOString() });
    save(); renderIdentity(); document.getElementById('xpAmount').value = ''; document.getElementById('xpReason').value = '';
}

function applyLevelJump() {
    const target = parseInt(document.getElementById('jumpLevel').value);
    if (isNaN(target) || target < 0 || target > 100) return showToast("Invalid Tier", "error");
    currentUser.level = target; currentUser.xp = 0;
    currentUser.logs.unshift({ type: 'jump', amt: target, reason: 'Warp', emoji: selectedEmoji.name, time: new Date().toISOString() });
    save(); renderIdentity();
}

function renderRewardsPane() {
    const grid = document.getElementById('rewardsGrid');
    grid.innerHTML = Array.from({ length: 101 }, (_, i) => `
        <div onclick="prepSetReward(${i})" class="reward-card">
            <span class="block text-[7px] opacity-30 font-black uppercase mb-1">Tier ${i}</span>
            <span class="block text-[10px] font-bold leading-tight">${currentUser.rewards[i] || "???"}</span>
        </div>
    `).join('');
}

let activeRewardTarget = 0;
function prepSetReward(lvl) {
    activeRewardTarget = lvl;
    document.getElementById('rewardSetLvl').textContent = lvl;
    document.getElementById('rewardInput').value = currentUser.rewards[lvl] || '';
    document.getElementById('setRewardModal').classList.add('active');
}

function confirmReward() {
    const val = document.getElementById('rewardInput').value;
    if (val) currentUser.rewards[activeRewardTarget] = val; else delete currentUser.rewards[activeRewardTarget];
    save(); renderRewardsPane(); refreshViewTier(); closeRewardModal();
}

function closeRewardModal() { document.getElementById('setRewardModal').classList.remove('active'); }

function openEditModal() {
    document.getElementById('editModal').classList.add('active');
    document.getElementById('editName').value = currentUser.name;

    // Helper to parse Hex+Alpha
    const parseColor = (hexAlpha) => {
        if (!hexAlpha) return { hex: '#ffffff', alpha: 255 };
        // If it's 9 chars (#RRGGBBAA), split it
        if (hexAlpha.length === 9) {
            return {
                hex: hexAlpha.substring(0, 7),
                alpha: parseInt(hexAlpha.substring(7), 16)
            };
        }
        return { hex: hexAlpha, alpha: 255 };
    };

    const setVal = (id, val) => document.getElementById(id).value = val;

    const cg = parseColor(currentUser.colorGlow || '#ffffff');
    setVal('editColorGlow', cg.hex); setVal('editOpacityGlow', cg.alpha);

    const ct = parseColor(currentUser.colorText || '#ffffff');
    setVal('editColorText', ct.hex); setVal('editOpacityText', ct.alpha);

    const cb = parseColor(currentUser.colorBar || '#ffffff');
    setVal('editColorBar', cb.hex); setVal('editOpacityBar', cb.alpha);

    const cbg = parseColor(currentUser.colorBg || '#000000');
    setVal('editColorBg', cbg.hex); setVal('editOpacityBg', cbg.alpha);

    document.getElementById('editPass').value = '';

    // Status Inputs
    const st = currentUser.status || { emoji: '1019-c-cry.gif', text: '' };
    selectedStatusEmoji = st.emoji.includes('.') ? st.emoji : '1019-c-cry.gif';
    document.getElementById('editStatusEmojiPreview').src = `emojis/${selectedStatusEmoji}`;
    document.getElementById('editStatusText').value = st.text;
}

let selectedStatusEmoji = '';

function toggleStatusPicker() {
    const p = document.getElementById('statusEmojiPicker');
    p.classList.toggle('hidden');
    if (!p.classList.contains('hidden')) {
        p.innerHTML = emojisList.map(e => `
            <button onclick="selectStatusEmoji('${e.file}')" class="p-2 hover:bg-white/10 rounded-xl transition-all">
                <img src="../emojis/${e.file}" class="w-full h-full object-contain">
            </button>
        `).join('');
    }
}

function selectStatusEmoji(filename) {
    selectedStatusEmoji = filename;
    document.getElementById('editStatusEmojiPreview').src = `emojis/${filename}`;
    document.getElementById('statusEmojiPicker').classList.add('hidden');
}

function saveProfile() {
    currentUser.name = document.getElementById('editName').value;

    // Save Status
    currentUser.status = {
        emoji: selectedStatusEmoji,
        text: document.getElementById('editStatusText').value
    };

    const getHexAlpha = (hexId, alphaId) => {
        const hex = document.getElementById(hexId).value;
        const alpha = parseInt(document.getElementById(alphaId).value).toString(16).padStart(2, '0');
        return `${hex}${alpha}`;
    };

    currentUser.colorGlow = getHexAlpha('editColorGlow', 'editOpacityGlow');
    currentUser.colorText = getHexAlpha('editColorText', 'editOpacityText');
    currentUser.colorBar = getHexAlpha('editColorBar', 'editOpacityBar');
    currentUser.colorBg = getHexAlpha('editColorBg', 'editOpacityBg');
    const np = document.getElementById('editPass').value;
    if (np) currentUser.password = np;
    save(); renderIdentity(); closeModals();
}

async function handleImage(input, type) {
    const file = input.files[0];
    if (!file) return;

    const btn = input.parentElement;
    const originalText = btn.innerText; // Store original text "Upload Avatar"

    // UI Loading State
    btn.innerHTML = 'Uploading... <span class="animate-spin inline-block w-3 h-3 border-2 border-white/20 border-t-white rounded-full ml-1"></span>';
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.7';

    console.log(`Uploading ${type}...`);

    const formData = new FormData();
    // CRITICAL: Append text fields BEFORE file so Multer can read them in time
    formData.append('userId', currentUser.id);
    formData.append('type', type);
    formData.append('image', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        const result = await response.json();
        const serverPath = result.path; // e.g., "useravatarandbanner/hxkn_avatar.png"

        if (type === 'avatar') {
            currentUser.avatarUrl = serverPath;
            currentUser.avatar = ''; // Clear base64 if it existed
        } else {
            currentUser.bannerUrl = serverPath;
            currentUser.banner = ''; // Clear base64 if it existed
        }

        save();
        renderIdentity();
        showToast(`${type} Updated`, "success");
        input.value = ''; // BUG FIX: Reset input to allow re-upload

        // Reset UI
        btn.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" class="inline mr-1"><path d="M5 13l4 4L19 7"></path></svg> Success';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.pointerEvents = 'all';
            btn.style.opacity = '1';
        }, 1500);

    } catch (err) {
        console.error(err);
        showToast('Upload Failed', 'error');
        input.value = ''; // BUG FIX: Reset input on error too

        // Reset UI on error
        btn.innerHTML = 'Failed ❌';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.pointerEvents = 'all';
            btn.style.opacity = '1';
        }, 1500);
    }
}


function logout() {
    sessionStorage.clear();
    window.location.href = '/';
}
function closeModals() { document.querySelectorAll('.modal').forEach(m => m.classList.remove('active')); }

// Toast System
function showToast(msg, type = 'success') {
    const cont = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `
        <div class="w-2 h-2 rounded-full ${type === 'success' ? 'bg-green-400' : 'bg-red-400'}"></div>
        <span>${msg}</span>
    `;
    cont.appendChild(t);
    setTimeout(() => {
        t.style.animation = 'toast-out 0.3s forwards';
        setTimeout(() => t.remove(), 300);
    }, 3000);
}

async function save() {
    // Optimistic UI: Save locally just in case, but rely on cloud
    localStorage.setItem('souls_db_v9', JSON.stringify(db));

    showToast("Syncing...", "success");
    try {
        await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(db)
        });
    } catch (e) {
        showToast("Sync Failed", "error");
    }
}
