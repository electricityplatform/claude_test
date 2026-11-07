// ================= الهيدر العلوي (DaisyUI navbar) =================
// showSearch: يظهر البحث (كتابة / صوت / كاميرا) فقط داخل رحلة "شراء قطع الغيار"
function getHeaderTemplate(showSearch = false) {
    const headerHtml = `
        <header class="app-topbar flex-shrink-0${showSearch ? ' has-search' : ''}">
            <div class="navbar min-h-0 p-0 gap-3">
                <div class="flex flex-1 min-w-0 items-center justify-center gap-2.5 topbar-center">
                    <span class="topbar-brand">ELECTRICITY</span>
                    <span class="brand-chip">${logoImg()}</span>
                </div>
            </div>
        </header>
    `;
    // showSearch === true: البحث شريط منفصل تحت الهيدر (بيفضل ثابت فوق وانت بتنزل)
    // showSearch === 'home': الهيدر بس (والبحث بيتحط في الرئيسية تحت مجسم التليفون)
    renderBottomNav();   // الشريط السفلي (الرئيسية / القائمة / الإعدادات / حسابي)
    return showSearch === true ? headerHtml + getSearchBarHtml() : headerHtml;
}

// ================= شريط البحث (كتابة / صوت / كاميرا) =================
function getSearchBarHtml() {
    return `
            <div class="search-sentinel" aria-hidden="true"></div>
            <div class="app-search-bar">
                <label class="input input-bordered flex items-center gap-2 flex-1 min-w-0 bg-base-100">
                    ${uiIcon('search', 'w-4 h-4 opacity-60')}
                    <input type="text" class="grow w-0 min-w-0" placeholder="ابحث" aria-label="ابحث">
                </label>
                <button type="button" onclick="alert('جارِ الاستماع للصوت...فعل ميكروفون المتصفح')" class="btn btn-outline btn-square" title="بحث صوتي" aria-label="بحث صوتي">
                    ${uiIcon('mic', 'w-5 h-5')}
                </button>
                <button type="button" onclick="alert('جارِ فتح الكاميرا للمسح الضوئي...')" class="btn btn-outline btn-square" title="بحث بالكاميرا" aria-label="بحث بالكاميرا">
                    ${uiIcon('camera', 'w-5 h-5')}
                </button>
            </div>
    `;
}

// ================= أيقونة عنصر القائمة الجانبية =================
function menuIconFor(item) {
    if (item.includes('البيانات الشخصية')) return 'user';
    if (item.includes('المستخدمين')) return 'users';
    if (item.includes('مركز البيانات')) return 'database';
    if (item.includes('الإعدادات')) return 'cog';
    if (item.includes('المنتجات')) return 'tag';
    if (item.includes('خروج')) return 'logout';
    return 'bolt';
}

// ================= القائمة الجانبية الديناميكية (DaisyUI menu) =================
// القائمة الجانبية القديمة اتلغت (القائمة بقت صفحة من الشريط السفلي). الدالة فاضية عشان الشاشات القديمة بتناديها.
function loadDynamicMenuIntoSidebar() {}

// ================= صفحة القائمة =================
// البيانات الشخصية + الإعدادات العامة + تسجيل الخروج اتنقلوا للشريط السفلي، فهنا مجرد تنبيه.
async function renderMenuScreen() {
    document.getElementById('appContainer').innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex items-center mb-4 flex-shrink-0">
            <h2 class="text-sm sm:text-base font-bold text-base-content">القائمة</h2>
        </div>
        <div id="menuPageContent" class="flex-1 p-1">
            <div class="text-center text-base-content/50 text-sm py-8"><span class="loading loading-dots loading-sm"></span></div>
        </div>
    `;
    const box = document.getElementById('menuPageContent');

    try {
        const { data, error } = await supabaseClient.rpc('get_main_menu', { p_user_id: currentUserId });
        if (error) {
            box.innerHTML = `<div class="text-center text-error text-sm py-4">تعذر تحميل القائمة</div>`;
            return;
        }

        let menuItems = [];
        if (Array.isArray(data)) {
            menuItems = data;
        } else if (typeof data === 'string') {
            try { menuItems = JSON.parse(data); } catch (e) {}
        }

        if (!menuItems || menuItems.length === 0) {
            box.innerHTML = `<div class="text-center text-base-content/50 text-sm py-4">لا توجد عناصر متاحة</div>`;
            return;
        }

        box.innerHTML = `<div class="flex flex-col gap-3 pb-4">` + menuItems.map(item => {
            let clickAction = `alert(${jsArg(item)})`;
            if (item.includes('بيانات المستخدمين')) {
                clickAction = "renderUserProfilesScreen()";
            } else if (item.includes('مركز البيانات')) {
                clickAction = "renderDataCenterScreen()";
            } else if (item.includes('مركز العمليات')) {
                clickAction = "renderOperationCenterScreen()";
            } else if (item.includes('المنتجات المعروضة للبيع')) {
                clickAction = "renderMyProductsScreen()";
            }
            return menuListCardHtml(item, clickAction);
        }).join('') + `</div>`;
    } catch (err) {
        box.innerHTML = `<div class="text-center text-error text-sm py-4">خطأ في الاتصال</div>`;
    }
}

// ================= الإعدادات (من الشريط السفلي) =================
function openSettingsScreen() {
    if (typeof renderGeneralSettingsScreen === 'function') renderGeneralSettingsScreen();
    else alert('الإعدادات العامة');
}

// ================= صفحة حسابي: الصورة + البيانات الشخصية + تسجيل الخروج =================
function openAccountScreen() {
    if (!currentUserId) { renderLoginScreen(); return; }   // الزائر: يروح لشاشة الدخول
    renderAccountScreen();
}

function renderAccountScreen() {
    // نفس كارت قوائم مركز البيانات بالظبط (menuListCardHtml): نفس الحجم والخط، من غير أيقونة
    const card = (icon, label, action) => menuListCardHtml(label, action);
    const avatar = typeof profileAvatarHtml === 'function'
        ? profileAvatarHtml()
        : `<div class="avatar placeholder"><div class="bg-neutral text-neutral-content w-9 rounded-full"><span class="text-sm font-bold">${escapeHtmlValue(String(currentUserName || '').trim().charAt(0))}</span></div></div>`;

    document.getElementById('appContainer').innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex-1 p-1 flex flex-col items-center gap-4 pt-2">
            <button type="button" class="user-avatar-btn user-avatar-lg" onclick="openProfilePhotoSheet()" aria-label="تغيير الصورة الشخصية">${avatar}</button>
            <div class="text-center">
                <div class="font-bold text-lg acct-name" dir="auto">${escapeHtmlValue(currentUserName)}</div>
                ${currentUserRole ? `<div class="text-sm acct-meta text-base-content/70" dir="auto">${escapeHtmlValue(currentUserRole)}</div>` : ''}
                ${currentUserPhone ? `<div class="text-sm acct-meta text-base-content/70" dir="ltr">${escapeHtmlValue(currentUserPhone)}</div>` : ''}
            </div>
            <div class="w-full flex flex-col gap-3 pb-4">
                ${card('user', 'البيانات الشخصية', 'renderPersonalProfileScreen()')}
                ${card('cog', 'الإعدادات العامة', 'openSettingsScreen()')}
                ${card('logout', 'تسجيل خروج', 'logoutUser()')}
            </div>
        </div>
    `;
}

// ================= الشريط السفلي: الرئيسية | القائمة | حسابي (الإعدادات جوه حسابي) =================
function renderBottomNav() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    const loggedIn = !!(currentUserId && currentUserName);
    const avatar = loggedIn
        ? (typeof profileAvatarHtml === 'function' ? profileAvatarHtml() : uiIcon('user', 'w-6 h-6'))
        : ((typeof rememberedAvatarHtml === 'function' && rememberedAvatarHtml()) || uiIcon('user', 'w-6 h-6'));   // مفيش حد داخل: صورة "تذكرني" لو موجودة
    nav.innerHTML = `
        <button type="button" onclick="renderMainDashboard()" class="bottom-nav-item" aria-label="الرئيسية">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        </button>
        <button type="button" onclick="renderMenuScreen()" class="bottom-nav-item" aria-label="القائمة">
            ${uiIcon('menu', 'w-6 h-6')}
        </button>
        <button type="button" onclick="openAccountScreen()" class="bottom-nav-item" aria-label="حسابي">
            <span class="user-avatar-btn">${avatar}</span>
        </button>
    `;}
function filterSideMenu(q) {
    q = (q || '').trim();
    document.querySelectorAll('#sidebarContent .side-item').forEach(el => {
        el.style.display = !q || (el.dataset.label || '').includes(q) ? '' : 'none';
    });
}


// ================= ارتفاع الهيدر الثابت (عشان شريط البحث يتعلق تحته مباشرة) =================
(function () {
    function syncTopbarHeight() {
        const bar = document.querySelector('#appContainer .app-topbar');
        if (bar) document.documentElement.style.setProperty('--topbar-h', bar.offsetHeight + 'px');
    }
    const host = document.getElementById('appContainer');
    if (host) new MutationObserver(syncTopbarHeight).observe(host, { childList: true });
    window.addEventListener('resize', syncTopbarHeight);
    window.addEventListener('load', syncTopbarHeight);
    syncTopbarHeight();
})();


// ================= الهيدر يختفي لما شريط البحث يوصله (بمسافة واضحة بينهم) =================
// بينفع في الرئيسية وشاشات الرحلات (اللي فيها شريط بحث). شريط البحث بيفضل ثابت تحت الهيدر بمسافة GAP،
// ولما يوصل للمسافة دي الهيدر بيبدأ يختفي وشريط البحث بيطلع مكانه، ولما ترجع لفوق الهيدر بيرجع.
(function () {
    const GAP = 6;   // المسافة بين الهيدر وشريط البحث وهو ثابت (قريب جداً من غير ما يلزق)
    let ticking = false;
    function update() {
        ticking = false;
        const bar = document.querySelector('#appContainer .app-topbar');
        if (!bar) return;
        const sentinel = document.querySelector('#appContainer .search-sentinel');
        const root = document.documentElement;
        if (!sentinel) {
            bar.classList.remove('topbar-hidden');
            root.style.removeProperty('--search-top');
            return;
        }
        const h = bar.offsetHeight;
        // هستريسيس: الهيدر يختفي عند h+GAP، ومايرجعش إلا لما نبعد عن الحد ده بـ 24px (عشان الشريط والأزرار ما يرعشوش عند الحد)
        const wasHidden = bar.classList.contains('topbar-hidden');
        const top = sentinel.getBoundingClientRect().top;
        const scrolled = (window.scrollY || document.documentElement.scrollTop || 0) > 2;
        const hide = scrolled && (wasHidden ? top <= h + GAP + 24 : top <= h + GAP);
        bar.classList.toggle('topbar-hidden', hide);
        root.style.setProperty('--search-top', hide ? '.5rem' : (h + GAP) + 'px');
    }
    function schedule() {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule);
    const host = document.getElementById('appContainer');
    if (host) new MutationObserver(schedule).observe(host, { childList: true });
    schedule();
})();
