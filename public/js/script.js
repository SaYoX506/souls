// Core Application Data (v8)
// Core Application Data (v9 - Cloud)
let db = {
    hxkn: {
        id: 'hxkn', name: 'h.xkn', avatar: '', banner: '', avatarUrl: '', bannerUrl: '',
        colorGlow: '#ffffff', colorText: '#ffffff', colorBar: '#ffffff', colorBg: '#000000',
        level: 0, xp: 0, password: null, logs: [], rewards: {},
        status: { emoji: '', text: '' }
    },
    chidori: {
        id: 'chidori', name: 'Chidori', avatar: '', banner: '', avatarUrl: '', bannerUrl: '',
        colorGlow: '#ffffff', colorText: '#ffffff', colorBar: '#ffffff', colorBg: '#000000',
        level: 0, xp: 0, password: null, logs: [], rewards: {},
        status: { emoji: '', text: '' }
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
// Emojis will be loaded from server
// Hardcoded Emoji List for Reliability (Vercel/Cloud)
const EMOJI_FILES = [
    "1019-c-cry.gif", "1022-c-photo.gif", "107395-processando.gif", "1089-scarletgun.png", "11453-moderniadum.png", "11588-attack.gif",
    "1186-taiga-stare.png", "1272-boyfighting.png", "12833-aiet.png", "12865-raph.png", "1335-bleh.png", "13554-kaorukodevilishsmile.png",
    "1359-c-wow.gif", "14698-huh.gif", "147471-kannarain.gif", "1493-c-twirl.gif", "1538-marinkitagawa-smile.gif", "1553-lick.png",
    "1573-d-gimme.gif", "1576-boyangry.png", "1593-c-tears.gif", "1626-marinkitagawa-blush.gif", "16329-aqua-crying.png",
    "163320-usamiangry.png", "1660-giggle.gif", "168691-sakugun.png", "1720-kanna-uhh.png", "17302-anime-albedoscold.png",
    "175089-anyasly.png", "17670-nya.gif", "17963-reigun.png", "1848-marinkitagawa-sad.gif", "188925-madaraweakness.png",
    "19131-cry.png", "19168-boring.png", "2051-kitagawa-embarrassed.png", "21168-knight.png", "21315-thinking.png",
    "213792-kaorukocute.png", "2146-c-bite.gif", "22526-pat.png", "227860-kaorukodisgust.png", "229140-kyokosigh.png",
    "23062-angry.png", "2322-shyasf.gif", "23410-taigablush.gif", "2371-marin-touched.png", "2393_bakuNO.png", "239945-anyadisgust.png",
    "2415-100-kannapat.gif", "2425-marin-peak.png", "24878-cute-shy-anime-girl.png", "24963-cry3.gif", "253811-aizen.png",
    "2575_Suicidekanna.png", "2590-marin-shy.gif", "2594-laugh.gif", "2598-doroshifty.png", "2630-marinkitagawa-freaked.gif",
    "26641-smile.gif", "26648-gun3.png", "27812-gojo-backshots.gif", "279482-sigh.png", "2825-boyconfused.png", "2952-gendo-think.png",
    "30062-happy.gif", "3047-c-spark.gif", "3069-taiga-cute.png", "30937-chikanani.gif", "3097-albedo-hm.png", "310000-usamishocked.png",
    "3162-marin-pissed.png", "319056-absolutecinema.gif", "319232-jam-pochita.gif", "319232-pet-pochita.gif", "321366-aizen.png",
    "325237-kannaamazed2.gif", "3253-kannafrustrated.png", "33393-hug.gif", "33393-panic.gif", "33393-smile.gif", "337655-rantaro-spaz.gif",
    "3381-c-tryme.gif", "34216-gojo-wtf.png", "343551-1.png", "3476-marin-flustered.gif", "35178-ramkiss.png", "355506-satella.png",
    "358603-codegeasscc.png", "3591-marinkitagawaeating.png", "3625-kannacry.png", "363284-kaorukoheh.png", "36959-yawn.gif",
    "3710-overlord-albedo1.gif", "371208-kaorukoyay.png", "3740-kannano.png", "37657-sip.png", "38061-angry.gif", "38972-shocked.png",
    "3901-boystars.png", "39337-yuji-salute.png", "3978-overlord-albedo2.gif", "402410-usamiscared.png", "4035-kiss.gif",
    "407655-love-pochita.gif", "4086_Megamilk.png", "414418-unlimitedvoidexp.png", "41629-spin.gif", "417634-annoyedkenma.png",
    "4351-marin-eh.png", "443447-megumin.png", "4443-taiga-peace.png", "4462-c-tease.gif", "44985-aira-gunpoint.png", "45449-happy.png",
    "4564-kannayay.png", "4640-shock.png", "465090-kaorukopout.png", "4724_Mamako_pout.png", "4732-ameliawatson-blush.png",
    "4799-c-smoke.gif", "47997-thinking.png", "48006-disgust2.png", "48159-pout.png", "4839_KannaLeave.png", "485125-yanderemaid.png",
    "4887_kannapog.png", "489134-usamitroll.png", "49159-angry.png", "493919-foreheadkiss.gif", "4972-reze.gif", "49969-f.png",
    "50033-animedance.gif", "5005-b-sleep.png", "5010-marin-shy.gif", "50262-sunshine-superman.png", "511513-mizukisad.png",
    "516082-sakuscared.png", "51629-remkiss.png", "518098-angrymatsu.png", "51917-awaumagic.png", "5209-marin-shy.gif",
    "5236-marin-neutral-face.png", "52538-confused.png", "5277-d-hairflip.gif", "53116-bored.png", "5331_Deku_blushing.png",
    "5347-c-jams.gif", "5380-kannapoint.png", "5426-boyiphone.png", "546699-eddgould.png", "54823-no.png", "5486-c-yum.gif",
    "552671-wagurichibi.png", "5572-d-giggle.gif", "558757-kaorukoblushed.png", "567242-anyadevious.png", "5742-kannawhat.png",
    "5747-c-sad.gif", "5811-overlord-mare.gif", "58898-no.gif", "590208-ayatoo.png", "5912-c-lush.gif", "59170-zerotwo-heartloverainbow.gif",
    "597974-kaorukosleep.png", "59864-sleepy.png", "60304-gojo-happy.png", "60601-what.png", "607449-ban.gif", "610493-sadlen.png",
    "6190-boykiss.png", "6190_76_KannaBlush.png", "6291_Anna_lewd_horny.png", "6304_kannapogg.png", "6363-overlord-shalltear.gif",
    "638524-eitoaotsuki.png", "64245-aww.png", "64245-shocked.png", "64245-sushi.png", "644629-aoi-cry.gif", "65247-miunacry.gif",
    "65520-rude.png", "655767-haikyuudaichi.png", "6566_ReigenShook.png", "6672-dance1.gif", "66731-gojo-hehe.png", "6716-c-pet.gif",
    "6734_albedotalk.gif", "6735-kannadisgusted.png", "67472-blush2.png", "6768-boyshy.png", "6783-albedofawn.gif", "6910-kannaeat.png",
    "69220-sukuna-no.gif", "69345-run.gif", "69402-triggered.gif", "6999-dorosyuen.png", "7024_man_of_culture.png", "7025-boyzzz.png",
    "70315-inlove.gif", "705133-megumi-pat2.gif", "708326-aizen.png", "7113-boyshh.png", "7118-wtf.png", "7129-overlord-ainzooalgown1.gif",
    "715213-rantaro-nervous.png", "7194_kannasip.gif", "722344-deathnotellight.png", "723946-brolyanimevanguards.png",
    "72988-cool.png", "7309_Rias_sexy.png", "736079-kannayay.gif", "73688-hit.gif", "7389-doro.png", "74043-fbi.png", "7436-moderniasmile.png",
    "74734-salut.png", "75470-toji-facepalm.png", "7559-boyeat.png", "75806-ayayapink.png", "758914-manhattancafe.gif",
    "76276-ayatostare.png", "764053-mahito-laugh.gif", "76742-shyblush.png", "767694-rantaro-pain.png", "7756-albedomoan.png",
    "7770-boyhere.png", "7790-c-yesno.gif", "7864-c-notes.gif", "7890-verynice.png", "793145-kaorukohappy.png", "8019-arkneega.gif",
    "80365-bread.png", "8072-boyheart.png", "8086-kannaokhand.png", "8101_Kanna_Heart.png", "811324-kagaminelen.png", "81539-gun.png",
    "8228-tohru-wtf.png", "823637-kaorukonom.png", "8324-taiga-whiskers.png", "8345-c-waiting.gif", "8352-d-please.gif",
    "8366_Mamako_hug_mommy.png", "845839-iso.png", "84609-kannaeat.gif", "8480-c-piano.gif", "85921-stare.png", "8600-anyashock.gif",
    "86423-love2.gif", "875653-kaorukomcdonalds.png", "8763_Menacing.png", "8783-kitagawa-blush3.png", "89059-cry.png",
    "8946-d-mashing.gif", "896076-elfenlied.png", "903791-chuzuhang.png", "9042-marinkitagawa-smile.gif", "905900-wagurihappy.gif",
    "9125-c-shuffle.gif", "9125-marin-smug.png", "913089-anyagrin.png", "9132-marin-peace.png", "9148-taiga-flustered.png",
    "9148-taiga.png", "917428-hehnicetohru.gif", "9251_37_KannaSilent.png", "92596-nobara-stressed.png", "928782-kenmacattired.png",
    "93127-umshock.gif", "95576-baka.png", "95576-sleepy.gif", "956327-atsushi-suspicious.png", "95650-nosleep.png", "9574_KannaNight.png",
    "9619_Miia_silly.png", "9647-c-sip.gif", "96735-blink.gif", "9824-c-urdead.gif", "99614-sugoi.gif", "KannaFu.png", "KannaSip.png",
    "KannaWave.png", "KannaWhat.png", "TaigaAngry.png", "TaigaBored.gif", "albedohmm.png", "kannaPat.png", "kannasleep.png", "taigaugh.gif"
];

function setupEmojis() {
    emojisList = EMOJI_FILES.map(f => {
        let name = f.split('-').pop().split('.')[0].replace(/[^a-zA-Z]/g, '');
        return { name, file: f };
    });
    selectedEmoji = emojisList[0];
}

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
        const fullUrl = `${cleanUrl}?v=${Date.now()}`;
        // If serving from raw.githubusercontent, use proxy
        if (fullUrl.startsWith('https://raw.githubusercontent.com') && !fullUrl.includes('proxy-image')) {
            return `/proxy-image?url=${encodeURIComponent(fullUrl)}`;
        }
        return fullUrl;
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
    const st = currentUser.status || { emoji: '', text: '' };
    const emoImg = document.getElementById('winStatusEmoji');
    if (st.emoji && !st.emoji.includes('undefined') && st.emoji !== '') {
        emoImg.src = `emojis/${st.emoji}`;
        emoImg.style.display = 'block';
    } else {
        emoImg.style.display = 'none';
    }
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
    const st = currentUser.status || { emoji: '', text: '' };
    selectedStatusEmoji = st.emoji || '';

    const preview = document.getElementById('editStatusEmojiPreview');
    if (selectedStatusEmoji) {
        preview.src = `emojis/${selectedStatusEmoji}`;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
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
    const preview = document.getElementById('editStatusEmojiPreview');
    preview.src = `emojis/${filename}`;
    preview.style.display = 'block';
    document.getElementById('statusEmojiPicker').classList.add('hidden');
}

function clearStatusEmoji() {
    selectedStatusEmoji = '';
    document.getElementById('editStatusEmojiPreview').style.display = 'none';
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

// Toast System (Silent Mode requested)
// Toast System
function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `p-4 rounded-2xl backdrop-blur-md border shadow-2xl flex items-center gap-3 animate-slide-in ${type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-100' : 'bg-white/10 border-white/10 text-white'
        }`;

    // Icon
    const icon = type === 'error'
        ? '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
        : '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';

    toast.innerHTML = `${icon} <span class="text-[10px] font-bold uppercase tracking-widest">${msg}</span>`;

    container.appendChild(toast);

    // Remove after 3s
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function save() {
    // Optimistic UI: Save locally just in case, but rely on cloud
    localStorage.setItem('souls_db_v9', JSON.stringify(db));

    showToast("Syncing...", "success");
    try {
        const res = await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(db)
        });
        if (!res.ok) throw new Error(`Server Error: ${res.status}`);
        showToast("Saved to Cloud", "success");
    } catch (e) {
        console.error(e);
        showToast("Sync Failed: Check GitHub Token", "error");
    }
}
