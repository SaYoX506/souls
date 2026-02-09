// Core Application Data (v8 with Backend Upload Support)
let db = JSON.parse(localStorage.getItem('souls_db_v8')) || {
    hxkn: {
        id: 'hxkn', name: 'h.xkn', avatar: '', banner: '', avatarUrl: '', bannerUrl: '',
        colorGlow: '#ffffff', colorText: '#ffffff', colorBar: '#ffffff', colorBg: '#000000',
        level: 0, xp: 0, password: null, logs: [], rewards: {}
    },
    chidori: {
        id: 'chidori', name: 'Chidori', avatar: '', banner: '', avatarUrl: '', bannerUrl: '',
        colorGlow: '#ffffff', colorText: '#ffffff', colorBar: '#ffffff', colorBg: '#000000',
        level: 0, xp: 0, password: null, logs: [], rewards: {}
    }
};

let currentUser = null;
let isAuth = false;
let activeTab = 'xp';
let viewLvl = 0;
let selectedEmoji = null;
let emojisList = [];

const SERVER_URL = 'http://localhost:3000'; // Target our Node server

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

// App Boot
window.onload = () => { setupEmojis(); refreshSelectionAvatars(); };

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
    return `${SERVER_URL}/${relativeOrFull}`;
}

function refreshSelectionAvatars() {
    const hImg = getImgPath(db.hxkn.avatarUrl || db.hxkn.avatar) || `https://api.dicebear.com/7.x/shapes/svg?seed=hxkn`;
    const cImg = getImgPath(db.chidori.avatarUrl || db.chidori.avatar) || `https://api.dicebear.com/7.x/shapes/svg?seed=chidori`;
    document.getElementById('sel-hxkn-img').src = hImg;
    document.getElementById('sel-chidori-img').src = cImg;
}

function initUser(id) {
    currentUser = db[id];
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginPass').value = '';
    document.getElementById('loginPass').focus();
}

function confirmLogin() {
    const input = document.getElementById('loginPass').value;
    if (currentUser.password === null) {
        if (!input) return alert("Key required");
        currentUser.password = input; save(); isAuth = true; launchDashboard();
    } else if (currentUser.password === input) { isAuth = true; launchDashboard(); }
    else { alert("Fail"); }
}

function skipLogin() { isAuth = false; launchDashboard(); }

function launchDashboard() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('selectionScreen').classList.add('hidden');
    document.getElementById('mainWindow').classList.remove('hidden');

    if (isAuth) {
        document.getElementById('authStatus').classList.remove('hidden');
        document.getElementById('addBtn').classList.remove('hidden');
        document.getElementById('editBtn').classList.remove('hidden');
    } else {
        document.getElementById('authStatus').classList.add('hidden');
        document.getElementById('addBtn').classList.add('hidden');
        document.getElementById('editBtn').classList.add('hidden');
    }
    viewLvl = currentUser.level; renderIdentity();
}

function renderIdentity() {
    document.getElementById('winName').textContent = currentUser.name;
    document.getElementById('winLevelNum').textContent = currentUser.level;

    const avatar = getImgPath(currentUser.avatarUrl || currentUser.avatar) || `https://api.dicebear.com/7.x/shapes/svg?seed=${currentUser.id}`;
    document.getElementById('winAvatarImg').src = avatar;

    const banner = document.getElementById('winBanner');
    const bannerSrc = getImgPath(currentUser.bannerUrl || currentUser.banner);
    if (bannerSrc) {
        banner.style.backgroundImage = `url(${bannerSrc})`;
        banner.style.backgroundSize = 'cover';
        banner.style.backgroundPosition = 'center';
    } else { banner.style.background = 'rgba(128,128,128,0.1)'; banner.style.backgroundImage = 'none'; }

    const root = document.documentElement;
    root.style.setProperty('--glow-color', currentUser.colorGlow || '#ffffff');
    root.style.setProperty('--text-color', currentUser.colorText || '#ffffff');
    root.style.setProperty('--bar-color', currentUser.colorBar || '#ffffff');
    root.style.setProperty('--profile-bg', currentUser.colorBg || '#000000');

    refreshXP(); refreshViewTier(); renderSignalLogs();
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
    document.getElementById('viewLvlReward').style.opacity = (!isAuth && viewLvl > currentUser.level) ? '0.2' : '1';
}

function renderSignalLogs() {
    const container = document.getElementById('winLogs');
    if (currentUser.logs.length === 0) { container.innerHTML = '<div class="py-10 text-center opacity-20 text-[8px] uppercase font-bold tracking-widest">Awaiting Pulse</div>'; return; }
    container.innerHTML = currentUser.logs.map(l => {
        const emo = emojisList.find(e => e.name === l.emoji) || emojisList[0];
        return `
        <div class="log-item">
            <img src="emojis/${emo.file}" class="log-emoji">
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
            <button onclick="selectEmoji('${e.name}')" class="p-2 hover:bg-white/10 rounded-xl transition-all"><img src="emojis/${e.file}" class="w-full h-full object-contain"></button>
        `).join('');
    }
}

function selectEmoji(name) {
    selectedEmoji = emojisList.find(e => e.name === name);
    document.getElementById('selectedEmojiImg').src = `emojis/${selectedEmoji.file}`;
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
    if (isNaN(target) || target < 0 || target > 100) return alert("Fail");
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
    document.getElementById('editAvatarUrl').value = currentUser.avatarUrl || '';
    document.getElementById('editBannerUrl').value = currentUser.bannerUrl || '';
    document.getElementById('editColorGlow').value = currentUser.colorGlow || '#ffffff';
    document.getElementById('editColorText').value = currentUser.colorText || '#ffffff';
    document.getElementById('editColorBar').value = currentUser.colorBar || '#ffffff';
    document.getElementById('editColorBg').value = currentUser.colorBg || '#000000';
    document.getElementById('editPass').value = '';
}

function saveProfile() {
    currentUser.name = document.getElementById('editName').value;
    currentUser.avatarUrl = document.getElementById('editAvatarUrl').value;
    currentUser.bannerUrl = document.getElementById('editBannerUrl').value;
    currentUser.colorGlow = document.getElementById('editColorGlow').value;
    currentUser.colorText = document.getElementById('editColorText').value;
    currentUser.colorBar = document.getElementById('editColorBar').value;
    currentUser.colorBg = document.getElementById('editColorBg').value;
    const np = document.getElementById('editPass').value;
    if (np) currentUser.password = np;
    save(); renderIdentity(); refreshSelectionAvatars(); closeModals();
}

async function handleImage(input, type) {
    const file = input.files[0];
    if (!file) return;

    // Show loading state or feedback if needed
    console.log(`Uploading ${type}...`);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', currentUser.id);
    formData.append('type', type);

    try {
        const response = await fetch(`${SERVER_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        const result = await response.json();
        const serverPath = result.path; // e.g., "useravatarandbanner/hxkn_avatar_123.png"

        if (type === 'avatar') {
            currentUser.avatarUrl = serverPath;
            currentUser.avatar = ''; // Clear base64 if it existed
        } else {
            currentUser.bannerUrl = serverPath;
            currentUser.banner = ''; // Clear base64 if it existed
        }

        save();
        renderIdentity();
        alert(`${type} saved to server!`);

    } catch (err) {
        console.error(err);
        alert('Could not upload to server. Make sure server.js is running!');

        // Fallback to Base64 if server is down (optional)
        const reader = new FileReader();
        reader.onload = e => {
            if (type === 'avatar') currentUser.avatar = e.target.result;
            else currentUser.banner = e.target.result;
            save(); renderIdentity();
        };
        reader.readAsDataURL(file);
    }
}

function save() { localStorage.setItem('souls_db_v8', JSON.stringify(db)); }
function logout() { window.location.reload(); }
function closeModals() { document.querySelectorAll('.modal').forEach(m => m.classList.remove('active')); }
