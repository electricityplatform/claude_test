// ================= انسيابية التنقل (اختفاء الشاشة القديمة ثم ظهور الجديدة) + السحب يمين/شمال =================
// 1) لما تدوس على حاجة بتفتح شاشة تانية (زر، كارت، زر رجوع، الشريط السفلي): المحتوى الحالي بيختفي بنعومة (~0.12 ثانية)
//    وبعدها تتنفّذ الضغطة والشاشة الجديدة بتظهر بنعومة (~0.2 ثانية). الهيدر ثابت ومابيتحركش.
//    لو الضغطة ما فتحتش شاشة جديدة، المحتوى بيرجع يظهر لوحده.
// 2) السحب: سحب الصباع من الشمال لليمين = القسم اللي بعده (الرئيسية > القائمة > الأصدقاء > حسابي)، والعكس للعكس.
//    جوه الأصدقاء: السحب بيبدّل التبويبات الأربعة الأول، ولما توصل لآخر تبويب بيكمّل للقسم اللي بعده.
//    شغّال حتى لو إنت جوه شاشة فرعية (زي شراء قطع الغيار): بيروح للقسم المجاور للقسم اللي فتحت منه.
(function setupNavMotion() {
    const container = document.getElementById('appContainer');
    if (!container) return;

    const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        || !container.animate;
    const OUT_MS = 120;   // اختفاء الشاشة القديمة
    const IN_MS = 200;    // ظهور الشاشة الجديدة

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

    // ---------- الاختفاء ثم الظهور ----------
    function contentKids() {
        return Array.prototype.filter.call(container.children, function (k) { return !k.matches('.app-topbar, header'); });
    }

    let pendingNav = false;    // في فترة الاختفاء، مستنيين ننفّذ الضغطة
    let faded = false;         // المحتوى القديم مخفي ومستنيين الشاشة الجديدة
    let bypass = false;        // الضغطة المعاد تنفيذها ما تتعترضش تاني
    let safetyTimer = null;

    function fadeOut() {
        faded = true;
        contentKids().forEach(function (k) {
            k.animate([{ opacity: 1 }, { opacity: 0 }], { duration: OUT_MS, easing: 'ease-in', fill: 'forwards' });
        });
    }
    function fadeIn(kids) {
        kids.forEach(function (k) {
            k.getAnimations().forEach(function (a) { a.cancel(); });
            k.animate([{ opacity: 0 }, { opacity: 1 }], { duration: IN_MS, easing: 'ease-out' });
        });
    }
    // الضغطة ما غيّرتش الشاشة: نرجّع المحتوى
    function restore() {
        if (!faded) return;
        faded = false;
        clearTimeout(safetyTimer);
        fadeIn(contentKids());
    }

    function isBackText(btn) {
        return /^(رجوع|عودة|السابق)(\s|$)/.test((btn.textContent || '').replace(/\s+/g, ' ').trim());
    }
    // أزرار فتح الشاشات: renderXxx(...) أو openXxx(...) أو startXxxFlow(...) (من غير النوافذ والصور)، وأزرار الرجوع، والشريط السفلي
    const NAV_ONCLICK = /\b(?:(?:render|open)[A-Z]\w*|start\w*Flow|select\w*(?:Part|Brand|Model))\s*\(/;   // + كروت الرئيسية (startBuyFlow...) واختيار القطعة/الماركة/الموديل
    const NOT_NAV = /(Photo|Modal|Dialog|Overlay|Popup|Confirm|Filter|Sort)/;
    function isNavTrigger(el) {
        if (el.closest('.bottom-nav')) return true;
        if (!container.contains(el)) return false;
        if (el.tagName === 'BUTTON' && isBackText(el)) return true;
        const oc = el.getAttribute('onclick') || '';
        return NAV_ONCLICK.test(oc) && !NOT_NAV.test(oc);
    }

    // على مستوى window (capture) عشان نسبق منطق الرجوع في utils.js
    window.addEventListener('click', function (e) {
        if (bypass || reduceMotion) return;
        const el = e.target && e.target.closest && (e.target.closest('[onclick]') || e.target.closest('button'));
        if (!el) return;
        if (el.dataset && el.dataset.navSynthetic) return;   // ضغطة رجوع المحاكاة بتاعة زر رجوع الموبايل: تتنفّذ فوراً
        if (pendingNav) { e.preventDefault(); e.stopImmediatePropagation(); return; }   // ضغطة تانية أثناء الاختفاء: نتجاهلها

        const item = el.closest('.bottom-nav .bottom-nav-item');
        if (item) { const idx = navItems().indexOf(item); if (idx >= 0) currentSection = idx; }

        if (!isNavTrigger(el)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        pendingNav = true;
        fadeOut();
        setTimeout(function () {
            pendingNav = false;
            if (!el.isConnected) { restore(); return; }
            bypass = true;
            try { el.click(); } finally { bypass = false; }
            clearTimeout(safetyTimer);
            safetyTimer = setTimeout(restore, 700);   // لو ما اترسمتش شاشة جديدة
        }, OUT_MS);
    }, true);

    // أول ما الشاشة الجديدة تترسم (قبل ما تتعرض) نظهرها بنعومة
    let lastSig = null;
    function signature() {
        const back = Array.prototype.find.call(container.querySelectorAll('button'), isBackText);
        const title = container.querySelector('h1, h2');
        return (back ? (back.getAttribute('onclick') || '') : '') + '|' + (title ? title.textContent.trim() : '');
    }
    new MutationObserver(function () {
        detectSection();
        const sig = signature();
        const same = sig === lastSig;
        lastSig = sig;
        if (reduceMotion) { faded = false; return; }
        if (faded) {   // جاية بعد اختفاء القديم: دايماً نظهرها
            faded = false;
            clearTimeout(safetyTimer);
            fadeIn(contentKids());
            return;
        }
        if (same) return;   // نفس الشاشة اتعاد رسمها (تحديث): من غير حركة
        fadeIn(contentKids());   // تبديل من غير ضغطة (زي زر رجوع الموبايل): الجديدة بتظهر بنعومة
    }).observe(container, { childList: true });

    // ---------- السحب ----------
    const EDGE = 18;           // نتجاهل السحب اللي بيبدأ من حرف الشاشة (إيماءة رجوع النظام)
    const MIN_DX = 70;
    const MAX_MS = 800;
    let sx = 0, sy = 0, st = 0, tracking = false;

    function isZoomed() {
        return !!(window.visualViewport && window.visualViewport.scale > 1.02);
    }
    function blockedTarget(el) {
        if (!el || !el.closest) return true;
        if (!container.contains(el)) return true;   // اللمسة بدأت برا الشاشة (قوائم/نوافذ فوقها)
        if (el.closest('input, textarea, select, canvas, table, [contenteditable="true"], [data-no-swipe], [id*="assistant"], [class*="assistant"], #photoCropper')) return true;
        // أي عنصر بيتحرك أفقي (جداول، شرائح) بنسيبه يتحرك لوحده
        for (let n = el; n && n !== container; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && n.scrollWidth > n.clientWidth + 2) return true;
        }
        return false;
    }
    function overlayOpen() {
        if (document.querySelector('.modal-open, [role="dialog"], #photoSheet, #photoCropper')) return true;
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
        sx = t.clientX; sy = t.clientY; st = Date.now();
        tracking = true;
    }, { passive: true });

    document.addEventListener('touchcancel', function () { tracking = false; }, { passive: true });

    document.addEventListener('touchend', function (e) {
        if (!tracking) return;
        tracking = false;
        const t = e.changedTouches[0];
        const dx = t.clientX - sx, dy = t.clientY - sy;
        if (Date.now() - st > MAX_MS) return;
        if (Math.abs(dx) < MIN_DX || Math.abs(dx) < Math.abs(dy) * 1.7) return;
        const sel = window.getSelection && window.getSelection();
        if (sel && String(sel).length > 0) return;   // المستخدم بيحدد نص
        handleSwipe(dx > 0 ? 1 : -1);
    }, { passive: true });

    // sign = +1: القسم/التبويب اللي بعده (سحب من الشمال لليمين) | -1: اللي قبله
    function handleSwipe(sign) {
        if (pendingNav) return;
        if (typeof friendsSwipe === 'function' && container.querySelector('#friendsTabs') && friendsSwipe(sign)) return;
        const target = currentSection + sign;
        if (allowedSections().indexOf(target) < 0) return;
        const items = navItems();
        if (items[target]) items[target].click();   // نفس ضغطة الزر: بتشغّل الاختفاء/الظهور والتنقل العادي
    }
})();
