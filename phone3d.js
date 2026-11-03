// ================= تليفون ثلاثي الأبعاد في الهيرو: بيلف لوحده، واللمس بيفككه لقطع الغيار =================
// قسم مستقل في الشاشة الرئيسية (بين لوحة العرض وكارت شراء قطع الغيار).
// dashboard.js بينادي phone3dSectionHtml() ثم phone3dMount(). المكتبة (Three.js) بتتحمّل أول ما القسم يظهر.
//
// أسماء القطع اللي بتظهر على الشاشة (غيّرها لو أسماء قطع الغيار عندك في قاعدة البيانات مختلفة):
const PHONE_PARTS = [
    ['screen',  'شاشة'],
    ['board',   'بوردة'],
    ['battery', 'بطارية'],
    ['port',    'فلاتة شحن'],
    ['back',    'غطاء خلفي'],
    ['camera',  'كاميرا']
];
const PHONE_CAP_IDLE = 'المس التليفون لتفكيكه';
const PHONE_CAP_OPEN = 'المس قطعة لتحديدها، ومرة تانية لفتح أسعارها';
const THREE_SRC = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';

let _p3 = null;          // حالة النموذج الحالي
let _p3Pending = null;   // الـ host اللي بنبنيه دلوقتي (عشان ما نبنيش مرتين)
let _threePromise = null;

function phone3dLoadThree() {
    if (window.THREE) return Promise.resolve();
    if (_threePromise) return _threePromise;
    _threePromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = THREE_SRC;
        s.onload = resolve;
        s.onerror = () => { _threePromise = null; reject(new Error('three load failed')); };
        document.head.appendChild(s);
    });
    return _threePromise;
}

// ---------- نقطة الدخول (من dashboard.js) ----------
function phone3dSectionHtml() {
    return `
        <section class="phone-stage" aria-label="تليفون ثلاثي الأبعاد">
            <div class="phone-stage-cap" id="heroPhoneCap">${PHONE_CAP_IDLE}</div>
            <div class="hero-phone" id="heroPhone"></div>
        </section>`;
}

let _p3Io = null;   // بيراقب ظهور القسم على الشاشة (بنوقف الرسم لما يبعد عن النظر)

function phone3dMount() {
    const host = document.getElementById('heroPhone');
    if (!host) return;
    if (_p3 && _p3.host === host) return;
    if (_p3Pending === host) return;
    if (_p3) p3Dispose();
    if (_p3Io) { _p3Io.disconnect(); _p3Io = null; }
    _p3Pending = host;
    phone3dLoadThree().then(() => {
        _p3Pending = null;
        if (!document.body.contains(host)) return;   // الشاشة اتعاد رسمها وإحنا بنحمّل
        _p3 = p3Build(host);
        _p3.active = true;
        p3Start();
        if ('IntersectionObserver' in window) {
            _p3Io = new IntersectionObserver(entries => {
                if (!_p3) return;
                _p3.active = entries[entries.length - 1].isIntersecting;
                if (_p3.active) p3Start();
            }, { threshold: 0.05 });
            _p3Io.observe(host);
        }
    }).catch(() => {
        _p3Pending = null;
        host.innerHTML = '<div class="hp3-fail">تعذّر تشغيل العرض ثلاثي الأبعاد على هذا الجهاز</div>';
    });
}

// ---------- مجسّمات ----------
// لوح بحواف دايرية وسُمك (z). الحجم الكلي w × h × d.
function p3Slab(w, h, d, r, mat) {
    const T = THREE;
    r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001);
    const x = -w / 2, y = -h / 2;
    const s = new T.Shape();
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x + w, y + h - r);
    s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    s.lineTo(x + r, y + h);
    s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(x, y + r);
    s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
    const bev = Math.min(d * 0.22, 0.007);
    const depth = Math.max(d - bev * 2, 0.002);
    const g = new T.ExtrudeGeometry(s, {
        depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.8, bevelSegments: 2, curveSegments: 10
    });
    g.translate(0, 0, -depth / 2);
    return new T.Mesh(g, mat);
}

function p3Box(w, h, d, mat) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}

function p3RoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function p3ScreenTexture() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 540;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 256, 540);
    g.addColorStop(0, '#3a2f1a'); g.addColorStop(0.5, '#15110b'); g.addColorStop(1, '#2a2010');
    x.fillStyle = g; x.fillRect(0, 0, 256, 540);
    const r = x.createRadialGradient(205, 50, 5, 205, 50, 230);
    r.addColorStop(0, 'rgba(232,201,122,.55)'); r.addColorStop(1, 'rgba(232,201,122,0)');
    x.fillStyle = r; x.fillRect(0, 0, 256, 540);
    // الجزيرة العلوية
    x.fillStyle = '#050505'; p3RoundRect(x, 98, 14, 60, 18, 9); x.fill();
    // الساعة
    x.fillStyle = '#f6f1e7'; x.font = '700 58px sans-serif'; x.textAlign = 'center';
    x.fillText('9:41', 128, 130);
    // أيقونات التطبيقات
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const a = 0.28 + ((row * 4 + col) % 3) * 0.18;
            x.fillStyle = 'rgba(232,201,122,' + a.toFixed(2) + ')';
            p3RoundRect(x, 24 + col * 54, 190 + row * 66, 44, 44, 11);
            x.fill();
        }
    }
    // شريط الأسفل
    x.fillStyle = 'rgba(246,241,231,.55)'; p3RoundRect(x, 88, 522, 80, 5, 2.5); x.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
}

// ---------- بناء المشهد ----------
function p3Build(host) {
    const T = THREE;
    host.innerHTML = '';

    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.touchAction = 'pan-y';
    host.appendChild(renderer.domElement);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 4.3);

    scene.add(new T.HemisphereLight(0xfff3d6, 0x2a2318, 1.1));
    const key = new T.DirectionalLight(0xffffff, 2.4); key.position.set(2.5, 3, 4); scene.add(key);
    const rim = new T.DirectionalLight(0xe8c97a, 1.6); rim.position.set(-3, 1.5, -2.5); scene.add(rim);
    const fill = new T.DirectionalLight(0xffffff, 0.8); fill.position.set(-2, -2, 3); scene.add(fill);

    const group = new T.Group();
    scene.add(group);

    const M = (color, metal, rough) => new T.MeshStandardMaterial({ color, metalness: metal, roughness: rough });
    const parts = {};
    const meshList = [];

    function addPart(name, obj, base, exploded, delay) {
        obj.position.copy(base);
        group.add(obj);
        const mats = new Set();
        obj.traverse(o => {
            if (o.isMesh) {
                o.userData.key = name;
                meshList.push(o);
                mats.add(o.material);
            }
        });
        parts[name] = { obj, base: base.clone(), ex: exploded, delay, mats: Array.from(mats) };
    }

    // الشاشة (قدّام)
    {
        const g = new T.Group();
        g.add(p3Slab(0.70, 1.46, 0.035, 0.09, M(0x0b0b0d, 0.5, 0.35)));
        const plane = new T.Mesh(
            new T.PlaneGeometry(0.64, 1.38),
            new T.MeshBasicMaterial({ map: p3ScreenTexture() })
        );
        plane.position.z = 0.0185;
        g.add(plane);
        addPart('screen', g, new T.Vector3(0, 0, 0.0525), new T.Vector3(0, 0, 0.62), 0.0);
    }

    // البوردة (فوق)
    {
        const g = new T.Group();
        g.add(p3Slab(0.56, 0.4, 0.02, 0.03, M(0x1d4a36, 0.2, 0.6)));
        const silver = M(0xb9bcc2, 0.8, 0.3), gold = M(0xc9a24d, 0.9, 0.3), black = M(0x111111, 0.4, 0.5);
        const chip = (w, h, mat, px, py) => { const b = p3Box(w, h, 0.018, mat); b.position.set(px, py, 0.016); g.add(b); };
        chip(0.2, 0.2, black, -0.1, 0.0);
        chip(0.12, 0.09, silver, 0.14, 0.1);
        chip(0.09, 0.09, gold, 0.17, -0.06);
        chip(0.07, 0.05, silver, -0.2, -0.13);
        chip(0.06, 0.06, gold, 0.02, -0.14);
        addPart('board', g, new T.Vector3(0, 0.5, 0.02), new T.Vector3(0, 0.62, 0.26), 0.06);
    }

    // البطارية (وسط تحت)
    {
        const g = new T.Group();
        g.add(p3Slab(0.50, 0.76, 0.03, 0.04, M(0xc9ccd1, 0.6, 0.35)));
        const label = p3Slab(0.38, 0.22, 0.006, 0.02, M(0x2a2318, 0.3, 0.6));
        label.position.z = 0.017; g.add(label);
        const bolt = p3Box(0.1, 0.03, 0.01, M(0xe8c97a, 0.8, 0.3));
        bolt.position.set(0, 0.0, 0.022); g.add(bolt);
        const conn = p3Box(0.14, 0.04, 0.02, M(0xd9a441, 0.8, 0.3));
        conn.position.set(0, 0.4, 0); g.add(conn);
        addPart('battery', g, new T.Vector3(0, -0.22, 0.02), new T.Vector3(0, -0.22, -0.08), 0.12);
    }

    // فلاتة الشحن (تحت)
    {
        const g = new T.Group();
        g.add(p3Slab(0.34, 0.09, 0.012, 0.015, M(0xd9a441, 0.5, 0.45)));
        const pins = M(0xf1e2b0, 0.9, 0.2);
        for (let i = -2; i <= 2; i++) {
            const p = p3Box(0.03, 0.05, 0.016, pins);
            p.position.set(i * 0.05, 0, 0.002); g.add(p);
        }
        addPart('port', g, new T.Vector3(0, -0.66, 0.02), new T.Vector3(0, -0.84, 0.06), 0.18);
    }

    // الغطاء الخلفي
    {
        const g = new T.Group();
        g.add(p3Slab(0.72, 1.48, 0.03, 0.1, M(0x2c2822, 0.75, 0.3)));
        const logo = new T.Mesh(new T.CircleGeometry(0.06, 32), M(0xe8c97a, 0.9, 0.25));
        logo.position.z = -0.0165; logo.rotation.y = Math.PI;
        g.add(logo);
        addPart('back', g, new T.Vector3(0, 0, -0.02), new T.Vector3(0, 0, -0.42), 0.24);
    }

    // الكاميرا (ورا الغطاء)
    {
        const g = new T.Group();
        g.add(p3Slab(0.28, 0.28, 0.03, 0.07, M(0x1a1712, 0.8, 0.25)));
        const ringMat = M(0xc9a962, 0.9, 0.25), glass = M(0x07070f, 1.0, 0.08);
        [[-0.06, 0.06], [0.06, 0.06], [0, -0.06]].forEach(([px, py]) => {
            const ring = new T.Mesh(new T.CylinderGeometry(0.052, 0.052, 0.02, 28), ringMat);
            ring.rotation.x = Math.PI / 2; ring.position.set(px, py, -0.018); g.add(ring);
            const lens = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.024, 28), glass);
            lens.rotation.x = Math.PI / 2; lens.position.set(px, py, -0.022); g.add(lens);
        });
        addPart('camera', g, new T.Vector3(-0.2, 0.55, -0.05), new T.Vector3(-0.3, 0.68, -0.8), 0.3);
    }

    // ---------- طبقة الأسماء والخطوط ----------
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'hp3-lines');
    host.appendChild(svg);

    const chips = {}, lines = {};
    PHONE_PARTS.forEach(([k, label]) => {
        const ln = document.createElementNS(svgNS, 'line');
        ln.style.opacity = '0';
        svg.appendChild(ln);
        lines[k] = ln;

        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'hp3-chip';
        b.textContent = label;
        b.addEventListener('click', e => { e.stopPropagation(); p3Open(k); });
        host.appendChild(b);
        chips[k] = b;
    });

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'hp3-collapse';
    back.textContent = 'تجميع';
    back.addEventListener('click', e => { e.stopPropagation(); p3Collapse(false); });
    host.appendChild(back);

    const s = {
        host, renderer, scene, camera, group, parts, meshList, chips, lines, back,
        raycaster: new T.Raycaster(), vec: new T.Vector3(),
        ex: 0, target: 0, spin: 0.4, last: 0, raf: 0, active: false, selected: null,
        w: 1, h: 1, down: null, ro: null
    };

    function resize() {
        const w = host.clientWidth || 300, h = host.clientHeight || 200;
        s.w = w; s.h = h;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    resize();
    s.ro = new ResizeObserver(resize);
    s.ro.observe(host);

    // لمسة واحدة (مش سحب): نختار القطعة أو نفكك/نجمّع
    const cv = renderer.domElement;
    cv.addEventListener('pointerdown', e => { s.down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    cv.addEventListener('pointerup', e => {
        const d = s.down; s.down = null;
        if (!d) return;
        if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10 || performance.now() - d.t > 600) return;
        p3Tap(e);
    });
    cv.addEventListener('pointercancel', () => { s.down = null; });

    p3Apply(s, 0);
    renderer.render(scene, camera);
    return s;
}

// ---------- التفاعل ----------
function p3Pick(e) {
    const s = _p3;
    const rect = s.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    s.raycaster.setFromCamera(ndc, s.camera);
    const hit = s.raycaster.intersectObjects(s.meshList, false)[0];
    return hit ? hit.object.userData.key : null;
}

function p3Tap(e) {
    const s = _p3; if (!s) return;
    const hit = p3Pick(e);
    if (s.target === 0) {
        if (hit) p3Explode();
        return;
    }
    if (!hit) { p3Collapse(false); return; }
    if (s.selected === hit) p3Open(hit); else p3Select(hit);
}

function p3SetCaption(text) {
    const el = document.getElementById('heroPhoneCap');
    if (el) el.textContent = text;
}

function p3Explode() {
    const s = _p3; if (!s) return;
    s.target = 1;
    p3SetCaption(PHONE_CAP_OPEN);
}

function p3Collapse(instant) {
    const s = _p3; if (!s) return;
    p3Select(null);
    s.target = 0;
    p3SetCaption(PHONE_CAP_IDLE);
    if (instant) { s.ex = 0; p3Apply(s, 0); }
}

function p3Select(key) {
    const s = _p3; if (!s) return;
    s.selected = key;
    Object.keys(s.parts).forEach(k => {
        const on = k === key;
        s.parts[k].mats.forEach(m => {
            if (m.emissive) { m.emissive.set(0xe8c97a); m.emissiveIntensity = on ? 0.55 : 0; }
            else if (m.color) m.color.set(on ? 0xffe3a0 : 0xffffff);   // الشاشة (خامة بدون إضاءة)
        });
        s.chips[k].classList.toggle('active', on);
    });
}

function p3Open(key) {
    const item = PHONE_PARTS.find(p => p[0] === key);
    if (_p3) p3Collapse(true);
    if (item && typeof renderBrandsScreen === 'function') renderBrandsScreen(item[1]);
}

// ---------- الحركة ----------
function p3Smooth(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }

function p3Apply(s, e) {
    Object.keys(s.parts).forEach(k => {
        const p = s.parts[k];
        const t = p3Smooth((e - p.delay) / (1 - p.delay * 0.9));
        p.obj.position.lerpVectors(p.base, p.ex, t);
    });
}

function p3Start() {
    const s = _p3;
    if (!s || s.raf) return;
    s.last = performance.now();
    s.raf = requestAnimationFrame(p3Frame);
}

function p3Frame(now) {
    const s = _p3;
    if (!s) return;
    if (!s.active || !document.body.contains(s.host)) { s.raf = 0; return; }
    s.raf = requestAnimationFrame(p3Frame);

    const dt = Math.min((now - s.last) / 1000 || 0.016, 0.05);
    s.last = now;

    s.ex += (s.target - s.ex) * Math.min(1, dt * 4.5);
    if (Math.abs(s.target - s.ex) < 0.002) s.ex = s.target;
    const e = s.ex;

    s.spin += dt * 0.7 * (1 - e);
    s.spin = ((s.spin + Math.PI) % (Math.PI * 2)) - Math.PI;
    const sway = Math.sin(now / 1600) * 0.18;
    s.group.rotation.y = s.spin * (1 - e) + (0.85 + sway) * e;
    s.group.rotation.x = 0.08 * (1 - e) + 0.2 * e;

    p3Apply(s, e);
    s.renderer.render(s.scene, s.camera);
    p3Labels(s, e);
}

function p3Labels(s, e) {
    const showing = e > 0.85;
    s.back.classList.toggle('show', showing);

    if (e < 0.02) {
        PHONE_PARTS.forEach(([k]) => { s.chips[k].classList.remove('show'); s.lines[k].style.opacity = '0'; });
        return;
    }

    const W = s.w, H = s.h;
    const items = PHONE_PARTS.map(([k]) => {
        s.parts[k].obj.getWorldPosition(s.vec);
        const p = s.vec.clone().project(s.camera);
        return { k, x: (p.x * 0.5 + 0.5) * W, y: (-p.y * 0.5 + 0.5) * H };
    }).sort((a, b) => a.x - b.x);

    // صفّين: فوق وتحت بالتبادل، عشان الأسماء ما تتراكبش
    const rows = [[], []];
    items.forEach((it, i) => rows[i % 2].push(it));

    rows.forEach((row, ri) => {
        let prevEnd = -1e9;
        row.forEach(it => {
            const c = s.chips[it.k];
            const w = c.offsetWidth || 60;
            it.w = w;
            it.cx = Math.max(it.x, prevEnd + w / 2 + 6, w / 2 + 2);
            prevEnd = it.cx + w / 2;
        });
        const last = row[row.length - 1];
        if (last) {
            const over = last.cx + last.w / 2 - (W - 2);
            if (over > 0) row.forEach(it => { it.cx = Math.max(it.cx - over, it.w / 2 + 2); });
        }
        row.forEach(it => {
            const c = s.chips[it.k];
            const ch = c.offsetHeight || 22;
            c.style.left = it.cx + 'px';
            if (ri === 0) { c.style.top = '2px'; c.style.bottom = 'auto'; }
            else { c.style.bottom = '2px'; c.style.top = 'auto'; }
            c.classList.toggle('show', showing);

            const ln = s.lines[it.k];
            ln.setAttribute('x1', it.cx);
            ln.setAttribute('y1', ri === 0 ? 2 + ch : H - 2 - ch);
            ln.setAttribute('x2', it.x);
            ln.setAttribute('y2', it.y);
            ln.style.opacity = showing ? '1' : '0';
        });
    });
}

function p3Dispose() {
    const s = _p3;
    if (!s) return;
    if (s.raf) cancelAnimationFrame(s.raf);
    if (s.ro) s.ro.disconnect();
    try { s.renderer.dispose(); s.renderer.forceContextLoss(); } catch (e) { /* مش مشكلة */ }
    _p3 = null;
}
