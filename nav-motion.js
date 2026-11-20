// ================= انسيابية التنقل (تراكب: الشاشة الجديدة بتظهر فوق القديمة وهي بتختفي) + السحب يمين/شمال =================
// 1) أي تبديل شاشة: نسخة من الشاشة القديمة بتفضل ظاهرة مكانها وبتخفت تدريجياً، والجديدة بتظهر تدريجياً فوقها في نفس اللحظة.
//    الهيدر والشريط السفلي ثابتين. مفيش انتظار قبل التنقل: الضغطة بتتنفّذ فوراً.
//    عشان تظبط السرعة: غيّر FADE_MS تحت (الأكبر = أبطأ وأنعم).
// 2) السحب: سحب الصباع من الشمال لليمين = القسم اللي بعده (الرئيسية > القائمة > الأصدقاء > حسابي)، والعكس للعكس.
//    تبويبات الأصدقاء بتتبدّل بالضغط بس (من غير سحب). شغّال حتى جوه الشاشات الفرعية: بيروح للقسم المجاور للقسم اللي فتحت منه.
(function setupNavMotion() {
    const container = document.getElementById('appContainer');
    if (!container) return;

    const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        || !container.animate;
    const FADE_MS = 450;
    const EASE = 'ease-in-out';
    window.NAV_FADE = { ms: FADE_MS, ease: EASE };   // friends.js بيستعملهم عشان تبديل التبويبات يبقى بنفس الإحساس

    // position:relative عشان نسخة الشاشة القديمة تتحط مكانها بالظبط. touch-action: المتصفح ما يخطفش السحب الأفقي.
    const style = document.createElement('style');
    style.textContent = '#appContainer{position:relative;touch-action:pan-y pinch-zoom}'
        + '.nav-ghost{position:absolute;display:flex;flex-direction:column;pointer-events:none;z-index:5}';
    document.head.appendChild(style);

    // ---------- القسم الحالي (ترتيب الشريط السفلي: 0 رئيسية، 1 قائمة، 2 أصدقاء، 3 حسابي) ----------
    let currentSection = 0;
    function navItems() { return Array.prototype.slice.call(document.querySelectorAll('.bottom-nav .bottom-nav-item')); }
    function detectSection() {
        if (container.querySelector('.auth-screen, #partitionsContainer')) currentSection = 0;
        else if (container.querySelector('#menuPageContent')) currentSection = 1;
        else if (container.querySelector('#friendsTabs')) currentSection = 2;
        else if (container.querySelector('#accountSettingsContainer')) currentSection = 3;
        // غير كده (شاشة فرعية): القسم بيفضل زي ما هو
    }
    detectSection();
    // ضغطة الشريط السفلي بتحدّد القسم فوراً (حتى لو الشاشة اللي بتفتح مفيهاش علامة واضحة)
    window.addEventListener('click', function (e) {
        const item = e.target && e.target.closest && e.target.closest('.bottom-nav .bottom-nav-item');
        if (!item) return;
        const idx = navItems().indexOf(item);
        if (idx >= 0) currentSection = idx;
    }, true);

    // ---------- التراكب ----------
    function contentKids() {
        return Array.prototype.filter.call(container.children, function (k) { return !k.matches('.app-topbar, header, .nav-ghost'); });
    }
    function clearGhosts() {
        Array.prototype.forEach.call(container.querySelectorAll(':scope > .nav-ghost'), function (g) { g.remove(); });
    }

    // removed: عناصر الشاشة القديمة (من غير الهيدر) اللي اتشالت من الصفحة
    function crossfade(removed) {
        clearGhosts();
        const kids = contentKids();

        removed = removed.filter(function (n) { return !n.matches('.intro-screen'); });   // شاشة البداية بتختفي بحركتها هي
        if (kids.some(function (k) { return k.matches('.intro-screen'); })) return;      // وبتظهر بحركتها هي
        // الجديدة: عناصرها (كروت، أقسام، عناوين...) تظهر عنصر ورا التاني
        const items = [];
        kids.forEach(function (k) {
            k.getAnimations().forEach(function (a) { a.cancel(); });
            collectItems(k, items);
        });
        revealSequence(items.length ? items : kids);

        // القديمة: ترجع تتحط مكانها وتخفت في نفس الوقت (الجديدة ظاهرة فوقها/معاها)
        if (!removed.length || !kids.length) return;
        const cs = getComputedStyle(container);
        const ghost = document.createElement('div');
        ghost.className = 'nav-ghost';
        ghost.setAttribute('aria-hidden', 'true');
        ghost.style.top = kids[0].offsetTop + 'px';
        ghost.style.left = cs.paddingLeft;
        ghost.style.right = cs.paddingRight;
        removed.forEach(function (n) { ghost.appendChild(n); });
        container.appendChild(ghost);
        const anim = ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, easing: EASE, fill: 'forwards' });
        anim.onfinish = anim.oncancel = function () { ghost.remove(); };
    }

    // بنراقب تغيّر الشاشة (قبل ما تتعرض)، وبنعمل التراكب بس لما الشاشة نفسها تتغيّر (مش لو اتعاد رسمها)
    let lastSig = null;
    function isBackText(btn) {
        return /^(رجوع|عودة|السابق)(\s|$)/.test((btn.textContent || '').replace(/\s+/g, ' ').trim());
    }
    function signature() {
        const back = Array.prototype.find.call(container.querySelectorAll('button'), isBackText);
        const title = container.querySelector('h1, h2');
        const first = contentKids()[0];   // شكل أول عنصر: يفرّق بين شاشات مفيهاش عنوان (زي البداية والرئيسية)
        return (back ? (back.getAttribute('onclick') || '') : '') + '|' + (title ? title.textContent.trim() : '')
            + '|' + (first ? (first.id + '.' + first.className) : '');
    }
    new MutationObserver(function (records) {
        detectSection();
        const removed = [];
        let relevant = false;
        records.forEach(function (r) {
            Array.prototype.forEach.call(r.removedNodes, function (n) {
                if (n.nodeType === 1 && !n.classList.contains('nav-ghost') && !n.matches('.app-topbar, header')) removed.push(n);
            });
            Array.prototype.forEach.call(r.addedNodes, function (n) {
                if (n.nodeType === 1 && !n.classList.contains('nav-ghost')) relevant = true;
            });
        });
        if (!relevant) return;   // تغيير بسبب نسخة التراكب نفسها
        const sig = signature();
        const same = sig === lastSig;
        lastSig = sig;
        if (reduceMotion || same) return;
        crossfade(removed);
    }).observe(container, { childList: true });

    // ---------- ظهور العناصر واحد ورا التاني ----------
    // أي شاشة جديدة أو محتوى بيتجلب من قاعدة البيانات (كروت، أقسام، قطع غيار، موديلات، قوائم...):
    // كل عنصر بيظهر بنعومة وبعد اللي قبله، مش كلهم مع بعض.
    const ITEM_MS = 500;        // مدة ظهور كل عنصر
    const ITEM_STEP = 130;      // الفرق بين ظهور كل عنصر والتاني (الأكبر = متتابع أوضح)
    const ITEM_MAX_DELAY = 1500; // أقصى تأخير (عشان القوائم الطويلة جداً ماتبطأش)

    const LEAF = /^(INPUT|TEXTAREA|SELECT|BUTTON|A|IMG|SVG|CANVAS|TABLE|LABEL|H1|H2|H3|H4|P|SPAN)$/i;
    function elKids(el) {
        return Array.prototype.filter.call(el.children, function (c) { return !/^(SCRIPT|STYLE|LINK)$/.test(c.tagName) && !c.matches('.nav-ghost'); });
    }
    // مجموعة عناصر "قائمة" لو كذا واحد منهم ليهم نفس الشكل (نفس الكلاسات)
    function isRepeating(kids) {
        if (kids.length < 2) return false;
        const counts = {};
        let best = 0;
        kids.forEach(function (k) { const sig = k.className || k.tagName; counts[sig] = (counts[sig] || 0) + 1; if (counts[sig] > best) best = counts[sig]; });
        return best >= 2 && best >= kids.length / 2;
    }
    // بيطلّع العناصر اللي هتظهر ورا بعض بترتيب ظهورها في الصفحة
    function collectItems(el, out) {
        if (el.nodeType !== 1) return;
        const kids = elKids(el);
        if (el.matches('.skeleton, .sr-only, .loading, .search-sentinel')) return;
        if (!kids.length || LEAF.test(el.tagName) || el.matches('.dash-card, [onclick], .modal-box, .phone-stage, .hero, .app-search-bar')) { out.push(el); return; }
        if (isRepeating(kids)) { kids.forEach(function (k) { if (!k.matches('.skeleton, .sr-only, .loading, .search-sentinel')) out.push(k); }); return; }
        kids.forEach(function (k) { collectItems(k, out); });
    }
    // شاشة البداية (أو التبويب في الخلفية): مانبدأش الحركة تحتها، عشان تخلص من غير ما تتشاف
    function revealBlocked() {
        if (document.visibilityState === 'hidden') return true;
        const sp = document.querySelector('.splash-overlay');
        if (!sp || !sp.getClientRects().length) return false;
        const c = getComputedStyle(sp);
        return c.visibility !== 'hidden' && c.display !== 'none' && c.opacity !== '0';
    }
    function whenReveal(fn, tries) {
        if (!revealBlocked() || (tries || 0) > 100) { fn(); return; }   // أقصى انتظار ~10 ثواني
        setTimeout(function () { whenReveal(fn, (tries || 0) + 1); }, 100);
    }
    function revealSequence(items) {
        // العناصر المخبية أصلاً (opacity:0 بالـCSS لحد ما تدوس، زي كلمة "تجميع") ما بنحركهاش عشان ماتبانش
        items = items.filter(function (el) { return el.isConnected && (getComputedStyle(el).opacity === '1' || el.getAnimations().length > 0); });
        if (!items.length) return;
        const run = function () {
            items.forEach(function (el, i) {
                el.style.removeProperty('opacity');
                el.animate([{ opacity: 0 }, { opacity: 1 }], {
                    duration: ITEM_MS, easing: EASE, fill: 'backwards',
                    delay: Math.min(i * ITEM_STEP, ITEM_MAX_DELAY)
                });
            });
        };
        if (revealBlocked()) {
            items.forEach(function (el) { el.style.opacity = '0'; });   // مخفيين لحد ما شاشة البداية تختفي
            whenReveal(run);
        } else run();
    }
    function skipItem(n) {
        if (n.nodeType === 1 && n.tagName === 'CANVAS' && n.closest('.hero-phone')) return false;   // مجسم التليفون: يظهر بنعومة لما يتحمّل
        if (n.nodeType !== 1 || /^(SCRIPT|STYLE|LINK)$/.test(n.tagName)) return true;
        if (n.classList.contains('nav-ghost') || n.closest('.nav-ghost')) return true;
        if (n.closest('table, input, textarea, select, [contenteditable="true"], .modal, [role="dialog"], #photoCropper, .phone-stage, .hero')) return true;
        if (n.matches('.loading, .skeleton, .ptr-indicator') || (!n.textContent.trim() && n.querySelector('.loading'))) return true;
        if (n.getAnimations().length) return true;   // ليه حركة شغالة بالفعل (زي تبويبات الأصدقاء)
        return false;
    }
    new MutationObserver(function (records) {
        if (reduceMotion) return;
        const all = [];
        records.forEach(function (r) {
            if (r.target === container) return;   // تبديل الشاشة كلها: بيتعامل معاه التراكب فوق
            if (r.target.closest && r.target.closest('.nav-ghost')) return;
            Array.prototype.forEach.call(r.addedNodes, function (n) {
                if (skipItem(n)) return;
                const items = [];
                collectItems(n, items);
                const ok = items.filter(function (i) { return !skipItem(i); });
                (ok.length ? ok : [n]).forEach(function (i) { if (all.indexOf(i) < 0) all.push(i); });
            });
        });
        // العناصر دي كلها اتجابت مع بعض: تتحط في تسلسل واحد (مش كل مجموعة تبدأ من الأول). بنشيل اللي جوه عنصر تاني.
        const flat = all.filter(function (i) { return !all.some(function (o) { return o !== i && o.contains(i); }); });
        if (flat.length) revealSequence(flat);
    }).observe(container, { childList: true, subtree: true });

    // ---------- السحب ----------
    const EDGE = 12;          // نتجاهل السحب اللي بيبدأ من حرف الشاشة (إيماءة رجوع النظام)
    const MIN_DX = 50;         // أقل مسافة أفقية (بكسل)
    const RATIO = 1.25;        // الحركة الأفقية لازم تكون أكبر من الرأسية بالنسبة دي
    const MAX_MS = 1100;
    let sx = 0, sy = 0, st = 0, lx = 0, ly = 0, tracking = false;

    function isZoomed() {
        // نفس علامة التكبير اللي في utils.js (is-zoomed على html)
        return document.documentElement.classList.contains('is-zoomed');
    }
    function blockedTarget(el) {
        if (!el || !el.closest) return true;
        if (!container.contains(el)) return true;   // اللمسة بدأت برا الشاشة (قوائم/نوافذ فوقها)
        if (el.closest('input, textarea, select, canvas, table, [contenteditable="true"], [data-no-swipe], [id*="assistant"], [class*="assistant"], #photoCropper')) return true;
        // أي عنصر بيتحرك أفقي (جداول، شرائح) بنسيبه يتحرك لوحده. شريط تبويبات الأصدقاء مستثنى عشان السحب يشتغل عليه.
        for (let n = el; n && n !== container; n = n.parentElement) {
            if (n.id === 'friendsTabs') continue;
            const c = getComputedStyle(n);
            if ((c.overflowX === 'auto' || c.overflowX === 'scroll') && n.scrollWidth > n.clientWidth + 2) return true;
        }
        return false;
    }
    // نافذة "ظاهرة فعلاً" على الشاشة (مش مجرد موجودة في الـ DOM ومخفية)
    function isShown(el) {
        if (!el || !el.getClientRects().length) return false;
        const c = getComputedStyle(el);
        if (c.visibility === 'hidden' || c.display === 'none') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < window.innerWidth && r.top < window.innerHeight;
    }
    function overlayOpen() {
        const found = document.querySelectorAll('.modal-open, [role="dialog"], #photoSheet, #photoCropper');
        for (let i = 0; i < found.length; i++) if (isShown(found[i])) return true;
        const sb = document.getElementById('sideMenu');
        return !!sb && !sb.classList.contains('translate-x-full');
    }
    function allowedSections() {
        const loggedIn = typeof currentUserId !== 'undefined' && !!currentUserId;
        return loggedIn ? [0, 1, 2, 3] : [0, 1];   // الزائر: الرئيسية والقائمة بس
    }

    document.addEventListener('touchstart', function (e) {
        tracking = false;
        if (e.touches.length !== 1 || isZoomed() || overlayOpen()) return;
        if (container.querySelector('.auth-screen')) return;   // شاشات الدخول من غير سحب
        const t = e.touches[0];
        if (t.clientX < EDGE || t.clientX > window.innerWidth - EDGE) return;
        if (blockedTarget(e.target)) return;
        sx = lx = t.clientX; sy = ly = t.clientY; st = Date.now();
        tracking = true;
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
        if (!tracking) return;
        if (e.touches.length !== 1) { tracking = false; return; }   // إصبعين = تكبير
        lx = e.touches[0].clientX; ly = e.touches[0].clientY;
    }, { passive: true });

    function finishSwipe(x, y) {
        if (!tracking) return;
        tracking = false;
        const dx = x - sx, dy = y - sy;
        if (Date.now() - st > MAX_MS) return;
        if (Math.abs(dx) < MIN_DX || Math.abs(dx) < Math.abs(dy) * RATIO) return;
        const sel = window.getSelection && window.getSelection();
        if (sel && String(sel).length > 0) return;   // المستخدم بيحدد نص
        handleSwipe(dx > 0 ? 1 : -1);
    }
    document.addEventListener('touchend', function (e) {
        const t = e.changedTouches[0];
        finishSwipe(t ? t.clientX : lx, t ? t.clientY : ly);
    }, { passive: true });
    // بعض المتصفحات بتبعت touchcancel لما تاخد الإيماءة: نحسب بآخر مكان وصله الصباع
    document.addEventListener('touchcancel', function () { finishSwipe(lx, ly); }, { passive: true });

    // sign = +1: القسم اللي بعده (سحب من الشمال لليمين) | -1: اللي قبله
    function handleSwipe(sign) {
        const target = currentSection + sign;
        if (allowedSections().indexOf(target) < 0) return;
        const items = navItems();
        if (items[target]) items[target].click();   // نفس ضغطة الزر
    }
})();
