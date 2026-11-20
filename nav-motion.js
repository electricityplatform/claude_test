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

        // الجديدة: تظهر تدريجياً
        kids.forEach(function (k) {
            k.getAnimations().forEach(function (a) { a.cancel(); });
            k.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: EASE });
        });

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
        return (back ? (back.getAttribute('onclick') || '') : '') + '|' + (title ? title.textContent.trim() : '');
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

    // ---------- السحب ----------
    const EDGE = 12;           // نتجاهل السحب اللي بيبدأ من حرف الشاشة (إيماءة رجوع النظام)
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
