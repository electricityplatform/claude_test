// ================= تمرير قيمة نصية بأمان داخل onclick="..." =================
// بيرجّع نص JS literal (بين " ") ومتهرّب منه HTML، فأي اسم فيه ' أو " أو \ ما بيكسرش الزرار.
function jsArg(v) {
    return JSON.stringify(String(v ?? ''))
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ================= الأيقونات (مشتركة بين كل الشاشات) =================
// استعمالها: uiIcon('bell', 'w-5 h-5') — بترجّع SVG بلون currentColor
const UI_ICON_PATHS = {
    bolt: 'M13 10V3L4 14h7v7l9-11h-7z',
    menu: 'M4 6h16M4 12h16M4 18h16',
    chevron: 'M15 19l-7-7 7-7',
    search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
    mic: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
    camera: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z',
    cart: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    link: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    database: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
    cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
    tag: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    device: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
    logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
};

function uiIcon(name, cls = 'w-5 h-5') {
    const d = UI_ICON_PATHS[name] || UI_ICON_PATHS.bolt;
    return `<svg class="${cls}" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="${d}"></path></svg>`;
}

// شعار الشرارة (مليان)
function boltMarkSvg() {
    return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
}

// ================= دوال مساعدة: المحافظات والمناطق والنطاقات =================
function getGovernoratesOptionsHtml(selectedValue = "") {
    return `<option value="">اختر المحافظة...</option>` +
        EGYPTIAN_GOVERNORATES.map(gov =>
            `<option value="${gov}" ${gov === selectedValue ? 'selected' : ''}>${gov}</option>`
        ).join('');
}

function getRegionsListForCity(city) {
    if (city === 'أسوان') {
        return ['إدفو', 'كوم أمبو', 'دراو', 'مركز أسوان'];
    } else if (city) {
        return [`${city} - عام`];
    }
    return [];
}

function getAreasListForRegion(region) {
    if (region === 'مركز أسوان') {
        return ['السيل', 'الطابية', 'النفق', 'التأمين'];
    } else if (region) {
        return ['عام'];
    }
    return [];
}

function updateRegionsDropdown(cityId, regionId, areaId) {
    const cityVal = document.getElementById(cityId)?.value;
    const regionSelect = document.getElementById(regionId);
    const areaSelect = document.getElementById(areaId);

    if (!regionSelect) return;

    const regions = getRegionsListForCity(cityVal);
    regionSelect.innerHTML = '<option value="">اختر المنطقة...</option>' +
        regions.map(r => `<option value="${r}">${r}</option>`).join('');

    if (areaSelect) {
        areaSelect.innerHTML = '<option value="">اختر النطاق أولاً...</option>';
    }
}

function updateAreasDropdown(regionId, areaId) {
    const regionVal = document.getElementById(regionId)?.value;
    const areaSelect = document.getElementById(areaId);

    if (!areaSelect) return;

    const areas = getAreasListForRegion(regionVal);
    areaSelect.innerHTML = '<option value="">اختر النطاق...</option>' +
        areas.map(a => `<option value="${a}">${a}</option>`).join('');
}

// ================= تبديل رؤية كلمة المرور (العين) =================
function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
    } else {
        input.type = 'password';
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />`;
    }
}

// ================= القائمة الجانبية =================
function closeSidebar() {
    const sidebar = document.getElementById('sideMenu');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sideMenu');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar.classList.contains('translate-x-full')) {
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    } else {
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

// ================= نظام الهيرت بيت (Heartbeat) =================
function startHeartbeat() {
    if (heartbeatInterval) clearInterval(heartbeatInterval);

    heartbeatInterval = setInterval(async () => {
        if (!currentUserId) return;

        try {
            await supabaseClient.rpc('update_last_active_at', {
                target_user_id: currentUserId
            });
        } catch (err) {
            console.error("Heartbeat error:", err);
        }
    }, 10000);
}

// ================= تقرير حالة النظام والأخطاء =================
function showSystemAlert(title, idStatus, menuStatus, errorDetails = "") {
    let message = `--- 🔍 تقرير حالة النظام والأخطاء ---\n\n`;
    message += `📌 الحدث: ${title}\n`;
    message += `🆔 حالة الـ ID: ${idStatus}\n`;
    message += `📋 حالة جلب البيانات: ${menuStatus}\n`;
    if (errorDetails) {
        message += `⚠ تفاصيل العطل / السبب: ${errorDetails}\n`;
    } else {
        message += `✅ الحالة العامة: سليم بدون أخطاء\n`;
    }
    alert(message);
}

function getRotatingCardStyle(index) {
    return { bg: "bg-base-200 hover:bg-base-300 rounded-3xl", border: "border-base-300 hover:border-primary/40", text: "text-base-content", icon: "text-base-content/40 group-hover:text-primary" };
}


// ================= مساعدات الجداول (مشتركة بين كل الشاشات) =================
// صف رسالة "لا توجد بيانات" داخل الجدول نفسه: الجدول يظهر دائماً بعناوينه حتى لو فاضي.
// الرسالة ثابتة (sticky) عشان تفضل ظاهرة حتى لو الجدول عريض ومحتاج سكرول أفقي.
function emptyTableRowHtml(colspan, message) {
    return `
        <tr>
            <td colspan="${colspan}" class="p-0">
                <div class="sticky right-0 w-72 max-w-[85vw] p-6 text-center text-gray-400 text-sm font-semibold">${message}</div>
            </td>
        </tr>`;
}


// ================= خلفية كهربائية (صواعق وتروس ولمبات ودوائر على تيل) =================
// الاسم floralBgSvg محفوظ عشان باقي الملفات بتستدعيه.
function floralBgSvg() {
    const C = '#f4a58a', L = '#f7c0ab', W = '#ffffff';
    const bolt = (x, y, r, s, c) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="${c}"/></g>`;
    const gear = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}" fill-opacity=".9">${[0,45,90,135].map(a => `<rect x="-5" y="-22" width="10" height="44" rx="3" transform="rotate(${a})"/>`).join('')}<circle r="15"/><circle r="6" fill="#027f8a"/></g>`;
    const bulb = (x, y, r, s, c) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0-22a15 15 0 0 1 9 27v6h-18v-6a15 15 0 0 1 9-27z" fill="${c}"/><rect x="-7" y="13" width="14" height="5" rx="2" fill="#fff" fill-opacity=".85"/><rect x="-5" y="19" width="10" height="4" rx="2" fill="#fff" fill-opacity=".85"/></g>`;
    const plug = (x, y, r, s, c) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><rect x="-6" y="-26" width="4" height="14" rx="2" fill="${c}"/><rect x="2" y="-26" width="4" height="14" rx="2" fill="${c}"/><rect x="-12" y="-12" width="24" height="18" rx="6" fill="${c}"/><path d="M0 6v14c0 6 8 6 8 12" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
    const circuit = (d) => `<path d="${d}" stroke="#fff" stroke-opacity=".22" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const node = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff" fill-opacity=".35"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice"><rect width="400" height="600" fill="#027f8a"/>` +
        circuit('M0 90H70L100 60H190') + circuit('M400 140H330L300 170V230') + circuit('M0 420H60L90 450H150') + circuit('M400 480H320L290 510H230') +
        node(190, 60) + node(300, 230) + node(150, 450) + node(230, 510) +
        bolt(60, 130, -15, 2.2, C) + bolt(350, 70, 12, 1.5, L) + bolt(330, 340, 10, 2.4, C) + bolt(40, 330, -12, 1.3, L) +
        gear(330, 150, 1.3, W) + gear(60, 520, 1.6, L) + gear(180, 570, .8, C) +
        bulb(260, 60, 15, 1.2, C) + bulb(370, 460, -10, 1.3, L) +
        plug(30, 210, 20, 1.1, W) + plug(120, 20, 160, .9, C) +
        `</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
// الخلفية بتتولّد مرة واحدة وتتحط كمتغير CSS (--floral-bg)، والـ CSS بيطبّقها على .teal-floral و #sideMenu.
document.documentElement.style.setProperty('--floral-bg', floralBgSvg());
// محفوظة فاضية عشان أي ملف تاني لسه بيستدعيها ما يضربش خطأ
function applyFloralBackgrounds() {}

// ================= السحب للتحديث (Pull to refresh) =================
// المتصفح مبقاش بيعمل ده لوحده لأن الصفحة نفسها مبقتش بتتمرر (التمرير جوه مناطق المحتوى بس)، فعملناه بإيدينا.
(function setupPullToRefresh() {
    const THRESHOLD = 70;
    const MAX = 110;
    let startY = 0, startX = 0, pulling = false, dist = 0, ind = null;

    function getIndicator() {
        if (!ind) {
            ind = document.createElement('div');
            ind.className = 'ptr-indicator';
            ind.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg>';
            document.body.appendChild(ind);
        }
        return ind;
    }

    function hideIndicator() {
        if (!ind) return;
        ind.style.transition = 'opacity .2s, transform .2s';
        ind.style.opacity = '0';
        ind.style.transform = 'translateY(-3rem)';
    }

    // فيه عنصر قابل للتمرير فوق نقطة اللمس وهو مش في أول مكان؟
    function canScrollUp(el) {
        while (el && el !== document.body && el !== document.documentElement) {
            const s = getComputedStyle(el);
            if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight && el.scrollTop > 0) return true;
            el = el.parentElement;
        }
        return false;
    }

    document.addEventListener('touchstart', function (e) {
        pulling = false;
        if (e.touches.length !== 1) return;
        const t = e.target;
        if (t.closest && t.closest('input, textarea, select, #sideMenu')) return;
        if (canScrollUp(t)) return;
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        dist = 0;
        pulling = true;
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
        if (!pulling) return;
        const dy = e.touches[0].clientY - startY;
        const dx = e.touches[0].clientX - startX;
        if (Math.abs(dx) > Math.abs(dy) || canScrollUp(e.target)) { pulling = false; hideIndicator(); return; }
        if (dy <= 0) { dist = 0; hideIndicator(); return; }
        dist = Math.min(dy * 0.5, MAX);
        const el = getIndicator();
        el.style.transition = 'none';
        el.style.opacity = String(Math.min(dist / THRESHOLD, 1));
        el.style.transform = 'translateY(' + (dist - 40) + 'px) rotate(' + (dist * 3) + 'deg)';
    }, { passive: true });

    document.addEventListener('touchend', function () {
        if (!pulling) return;
        pulling = false;
        if (dist >= THRESHOLD) {
            const el = getIndicator();
            el.style.transition = 'transform .2s';
            el.style.transform = 'translateY(30px)';
            el.classList.add('ptr-loading');
            setTimeout(function () { location.reload(); }, 250);
        } else {
            hideIndicator();
        }
        dist = 0;
    }, { passive: true });

    document.addEventListener('touchcancel', function () { pulling = false; dist = 0; hideIndicator(); }, { passive: true });
})();

// ================= شريط حالة الاتصال =================
(function setupConnectionBanner() {
    let banner = null;
    let hideTimer = null;

    function show(kind) {
        if (!banner) {
            banner = document.createElement('div');
            document.body.appendChild(banner);
        }
        clearTimeout(hideTimer);
        banner.className = 'conn-banner ' + kind;
        banner.innerHTML = (kind === 'offline' ? 'لا يوجد اتصال بالإنترنت' : 'عاد الاتصال بالإنترنت') +
            '<button type="button" onclick="location.reload()">تحديث</button>';
        banner.style.display = 'flex';
        if (kind === 'online') hideTimer = setTimeout(hide, 10000);
    }

    function hide() {
        if (banner) banner.style.display = 'none';
    }

    window.addEventListener('offline', function () { show('offline'); });
    window.addEventListener('online', function () {
        // لو الصفحة اتفتحت من غير مكتبات الـ CDN (لأن النت كان واقع)، نعيد التحميل تلقائي أول ما النت يرجع
        if (!window.supabase || !window.tailwind) { location.reload(); return; }
        show('online');
    });
    if (!navigator.onLine) show('offline');
})();

// ================= زر الرجوع في الموبايل =================
// التطبيق صفحة واحدة بتبدّل الشاشات، فالمتصفح مكانش عارف إن فيه "شاشات" يرجع لها وكان بيطلّعك من الموقع.
// هنا بنسجّل كل شاشة جديدة في history المتصفح، ولما تدوس رجوع بنشغّل زر "رجوع" بتاع الشاشة الحالية.
(function setupBackNavigation() {
    const container = document.getElementById('appContainer');
    if (!container || !window.history || !history.pushState) return;

    const SID = String(Date.now()) + Math.random().toString(36).slice(2);
    let navDepth = 0;          // 0 = الرئيسية أو شاشات الدخول
    let lastSignature = null;
    let pendingBack = false;   // لسه راجعين بزر الموبايل ومستنيين الشاشة السابقة ترسم
    let ignoreNextPop = false;
    let guardAdded = false;
    let timer = null;

    try { history.replaceState({ d: 0, sid: SID }, ''); } catch (e) { return; }

    function sidebarOpen() {
        const sb = document.getElementById('sideMenu');
        return !!sb && !sb.classList.contains('translate-x-full');
    }

    // أول ضغطة من المستخدم: نضيف خطوة "حارس" ورا الرئيسية، عشان زر الرجوع يوصل لينا حتى وإحنا في الرئيسية (مثلاً والقائمة مفتوحة)
    // بنعملها وقت الضغطة (مش وقت تحميل الصفحة) لأن كروم بيتجاهل الخطوات اللي بتتضاف من غير تفاعل من المستخدم.
    function addGuard() {
        if (guardAdded) return;
        guardAdded = true;
        if (navDepth !== 0) return;
        try {
            history.replaceState({ d: -1, sid: SID, base: true }, '');
            history.pushState({ d: 0, sid: SID }, '');
        } catch (e) { /* مش مشكلة */ }
    }
    document.addEventListener('click', addGuard, true);

    function isBackButton(btn) {
        return /^(رجوع|عودة|السابق)$/.test((btn.textContent || '').replace(/\s+/g, ' ').trim());
    }
    function currentBackButton() {
        return Array.prototype.find.call(container.querySelectorAll('button'), isBackButton) || null;
    }
    function isHomeScreen() {
        return !!container.querySelector('.auth-screen, #partitionsContainer');
    }
    function signature() {
        const back = currentBackButton();
        const title = container.querySelector('h1, h2');
        return (back ? (back.getAttribute('onclick') || '') : '') + '|' + (title ? title.textContent.trim() : '');
    }

    function onScreenChange() {
        if (isHomeScreen()) {
            lastSignature = null;
            if (navDepth > 0 && !pendingBack) {
                // وصلنا للرئيسية من غير رجوع (زر الرئيسية مثلاً): نشيل الشاشات اللي اتراكمت في history
                ignoreNextPop = true;
                const n = navDepth;
                navDepth = 0;
                history.go(-n);
            }
            pendingBack = false;
            return;
        }
        if (pendingBack) { pendingBack = false; lastSignature = signature(); return; }
        const sig = signature();
        if (sig === lastSignature) return;   // نفس الشاشة اتعاد رسمها
        lastSignature = sig;
        navDepth += 1;
        history.pushState({ d: navDepth, sid: SID }, '');
    }

    new MutationObserver(function () {
        clearTimeout(timer);
        timer = setTimeout(onScreenChange, 60);
    }).observe(container, { childList: true });

    // أي لمسة جديدة من المستخدم معناها إن الرجوع خلص
    document.addEventListener('pointerdown', function () { pendingBack = false; }, true);

    // زر "رجوع" اللي جوه التطبيق: نخليه يمشي عن طريق history عشان الاتنين يفضلوا متزامنين
    document.addEventListener('click', function (e) {
        const btn = e.target.closest && e.target.closest('#appContainer button');
        if (!btn || btn.dataset.navSynthetic || !isBackButton(btn)) return;
        if (navDepth > 0) {
            e.preventDefault();
            e.stopImmediatePropagation();
            history.back();
        }
    }, true);

    window.addEventListener('popstate', function (e) {
        if (ignoreNextPop) { ignoreNextPop = false; return; }
        const st = e.state;
        if (!st || st.sid !== SID) { history.back(); return; }   // خطوات قديمة من تحميل سابق للصفحة

        // القائمة الجانبية مفتوحة: نقفلها بس ونفضل في نفس الشاشة، ونرجّع الخطوة اللي اتشالت
        if (sidebarOpen()) {
            toggleSidebar();
            history.pushState({ d: navDepth, sid: SID }, '');
            return;
        }

        if (st.base) { history.back(); return; }   // رجوع من الرئيسية: نخرج من الموقع
        if (st.d >= navDepth) return;
        navDepth = st.d;
        pendingBack = true;
        const btn = currentBackButton();
        if (btn) {
            btn.dataset.navSynthetic = '1';
            btn.click();
            delete btn.dataset.navSynthetic;
        } else if (typeof renderMainDashboard === 'function') {
            renderMainDashboard();
        }
    });
})();
