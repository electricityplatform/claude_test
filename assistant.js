// ================= المساعد الآلي: الشكل بس (زرار عائم + نافذة عايمة) =================
// مفيش ربط بأي API ولا رد ولا صوت ولا صور. أزرار الإرسال والميكروفون والكاميرا شكل بس.
// اللي شغال: سحب الزرار في أي مكان (وبيلزق في أقرب حافة)، وفتح/قفل النافذة.
(function () {
    'use strict';
    if (window.__aiAssistantLoaded) return;
    window.__aiAssistantLoaded = true;

    const POS_KEY = 'ai_fab_pos_v1';
    const FAB = 58;     // حجم الزرار بالبكسل
    const EDGE = 10;    // المسافة من حافة الشاشة

    const ICON = {
        spark: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z',
        close: 'M6 18L18 6M6 6l12 12',
        send: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5',
        mic: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
        camera: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z'
    };
    const svg = (name, cls) => `<svg class="${cls || ''}" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="${ICON[name]}"></path></svg>`;

    // ---------- العناصر ----------
    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'ai-fab';
    fab.setAttribute('aria-label', 'المساعد الآلي');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = svg('spark', 'ai-ico-spark') + svg('close', 'ai-ico-close');

    const panel = document.createElement('section');
    panel.className = 'ai-panel';
    panel.setAttribute('dir', 'rtl');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'المساعد الآلي');
    panel.innerHTML = `
        <div class="ai-head">
            <h2>المساعد الآلي</h2>
            <button type="button" class="ai-icon-btn" data-act="close" aria-label="إغلاق">${svg('close')}</button>
        </div>
        <div class="ai-msgs"></div>
        <div class="ai-bar">
            <button type="button" class="ai-icon-btn" aria-label="إرفاق صورة">${svg('camera')}</button>
            <button type="button" class="ai-icon-btn" aria-label="إدخال صوتي">${svg('mic')}</button>
            <textarea class="ai-input" rows="1" placeholder="اكتب سؤالك..." aria-label="اكتب سؤالك"></textarea>
            <button type="button" class="ai-icon-btn ai-send" aria-label="إرسال">${svg('send')}</button>
        </div>
    `;
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    const msgsEl = panel.querySelector('.ai-msgs');
    const inputEl = panel.querySelector('.ai-input');
    msgsEl.innerHTML = '<div class="ai-msg bot" dir="auto">أهلاً! اسألني عن أي حاجة.</div>';

    let isOpen = false;
    let pos = null;   // { x, y } أعلى يسار الزرار

    // اللمس على العناصر دي ما يوصلش لكود "السحب للتحديث" في utils.js
    ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach((ev) => {
        fab.addEventListener(ev, (e) => e.stopPropagation(), { passive: true });
        panel.addEventListener(ev, (e) => e.stopPropagation(), { passive: true });
    });

    // ---------- المكان ----------
    function viewport() {
        const vv = window.visualViewport;
        return {
            w: document.documentElement.clientWidth,
            h: vv ? vv.height : window.innerHeight,
            top: vv ? vv.offsetTop : 0,
            kb: !!vv && vv.height < window.innerHeight * 0.75   // الكيبورد مفتوح غالباً
        };
    }
    function defaultPos() {
        const nav = document.querySelector('.bottom-nav');
        const navH = nav ? nav.offsetHeight : 64;
        return { x: viewport().w - FAB - EDGE, y: window.innerHeight - navH - FAB - 18 };
    }
    function clampPos(p) {
        const v = viewport();
        return {
            x: Math.min(Math.max(p.x, EDGE), v.w - FAB - EDGE),
            y: Math.min(Math.max(p.y, EDGE), window.innerHeight - FAB - EDGE)
        };
    }
    function loadPos() {
        try {
            const s = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
            if (s && typeof s.xr === 'number' && typeof s.yr === 'number') {
                const v = viewport();
                return clampPos({ x: s.xr * v.w, y: s.yr * window.innerHeight });
            }
        } catch (e) {}
        return clampPos(defaultPos());
    }
    function savePos() {
        try {
            const v = viewport();
            localStorage.setItem(POS_KEY, JSON.stringify({ xr: pos.x / v.w, yr: pos.y / window.innerHeight }));
        } catch (e) {}
    }
    function applyFab() {
        fab.style.left = pos.x + 'px';
        fab.style.top = pos.y + 'px';
    }
    function placePanel() {
        const v = viewport();
        const W = Math.min(384, v.w - 16);
        let H, left, top;
        if (v.kb) {   // الكيبورد مفتوح: النافذة تاخد المساحة الظاهرة فوقه
            H = v.h - 16; top = v.top + 8; left = (v.w - W) / 2;
        } else {
            const maxH = Math.min(540, Math.round(v.h * 0.64));
            const above = pos.y - 16;
            const below = v.top + v.h - (pos.y + FAB) - 16;
            const goUp = above >= below || above >= maxH;
            H = Math.max(240, Math.min(maxH, goUp ? above : below));
            top = goUp ? pos.y - 8 - H : pos.y + FAB + 8;
            const onRight = pos.x + FAB / 2 > v.w / 2;
            left = onRight ? pos.x + FAB - W : pos.x;
        }
        left = Math.min(Math.max(left, 8), v.w - W - 8);
        top = Math.min(Math.max(top, v.top + 8), v.top + v.h - H - 8);
        Object.assign(panel.style, { width: W + 'px', height: H + 'px', left: left + 'px', top: top + 'px' });
    }

    // ---------- فتح / قفل ----------
    function openPanel() {
        isOpen = true;
        placePanel();
        panel.classList.add('open');
        fab.classList.add('open');
        fab.setAttribute('aria-expanded', 'true');
    }
    function closePanel() {
        isOpen = false;
        panel.classList.remove('open');
        fab.classList.remove('open');
        fab.setAttribute('aria-expanded', 'false');
        inputEl.blur();
    }
    function toggle() { isOpen ? closePanel() : openPanel(); }

    // ---------- سحب الزرار ----------
    let drag = null;
    fab.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        drag = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false, id: e.pointerId };
        try { fab.setPointerCapture(e.pointerId); } catch (err) {}
    });
    fab.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
        if (!drag.moved && Math.hypot(dx, dy) < 6) return;
        drag.moved = true;
        fab.classList.add('dragging');
        pos = clampPos({ x: drag.ox + dx, y: drag.oy + dy });
        applyFab();
        if (isOpen) placePanel();
    });
    function endDrag(e) {
        if (!drag || e.pointerId !== drag.id) return;
        const moved = drag.moved;
        drag = null;
        fab.classList.remove('dragging');
        try { fab.releasePointerCapture(e.pointerId); } catch (err) {}
        if (moved) {
            const v = viewport();   // يلزق في أقرب حافة (يمين/شمال)
            pos = clampPos({ x: pos.x + FAB / 2 < v.w / 2 ? EDGE : v.w - FAB - EDGE, y: pos.y });
            applyFab();
            savePos();
            if (isOpen) setTimeout(placePanel, 230);
        } else if (e.type === 'pointerup') {
            toggle();
        }
    }
    fab.addEventListener('pointerup', endDrag);
    fab.addEventListener('pointercancel', endDrag);
    fab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    panel.addEventListener('click', (e) => {
        if (e.target.closest('[data-act="close"]')) closePanel();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) closePanel(); });

    // ---------- الإظهار: مخفي في شاشات الدخول والافتتاح ----------
    function refreshVisibility() {
        const host = document.getElementById('appContainer');
        const onAuth = !host || !!host.querySelector('.auth-screen');
        fab.classList.toggle('show', !onAuth);
        if (onAuth && isOpen) closePanel();
    }
    const host = document.getElementById('appContainer');
    if (host) new MutationObserver(refreshVisibility).observe(host, { childList: true });

    function relayout() {
        pos = clampPos(pos);
        applyFab();
        if (isOpen) placePanel();
    }
    window.addEventListener('resize', relayout);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', relayout);
        window.visualViewport.addEventListener('scroll', () => { if (isOpen) placePanel(); });
    }

    pos = loadPos();
    applyFab();
    refreshVisibility();
    window.addEventListener('load', () => {
        let saved = null;
        try { saved = localStorage.getItem(POS_KEY); } catch (e) {}
        if (!saved) { pos = clampPos(defaultPos()); applyFab(); }
    });
})();
