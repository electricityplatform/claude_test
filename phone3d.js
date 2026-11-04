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
// الصور: التليفون وقطعه صور حقيقية مقصوصة (PNG شفاف) في نفس فولدر index.html.
// كل سطر: [اسم الملف، القطعة اللي بتتحدد (null = ديكور من غير اسم)، مركز X، مركز Y، العرض، الطول (بكسل من الصورة الأصلية)، عمق، تأخير]
const PHONE_WHOLE_IMG = 'phone-whole.png';
const PHONE_LAYOUT = [
    ['screen',  'screen',  110.5,  591.5, 189,  963, 0.00, 0.00],
    ['digit',   'screen',  245.0,  592.0, 100,  942, 0.01, 0.00],
    ['frame',   null,      371.5,  593.5, 187,  983, 0.02, 0.05],
    ['board',   'board',   606.5,  279.0, 283,  368, 0.03, 0.06],
    ['battery', 'battery', 600.0,  699.0, 282,  540, 0.03, 0.12],
    ['lspk',    null,      587.5, 1037.0, 243,  142, 0.03, 0.14],
    ['port',    'port',    723.5, 1057.5, 233,  107, 0.04, 0.18],
    ['spk',     null,      806.5,  986.5, 105,   99, 0.04, 0.20],
    ['strip',   null,      789.5,  667.5,  89,  569, 0.04, 0.16],
    ['camera',  'camera',  786.0,  240.0, 114,  296, 0.04, 0.30],
    ['flash',   'camera',  689.0,  121.0,  38,   48, 0.05, 0.30],
    ['cam1',    'camera',  706.0,  182.5,  74,   55, 0.05, 0.30],
    ['cam2',    'camera',  706.5,  269.0,  71,   54, 0.05, 0.30],
    ['inner',   'back',    924.5,  593.0, 193, 1016, 0.05, 0.24],
    ['back',    'back',   1137.0,  606.5, 258, 1077, 0.06, 0.24]
];
const PHONE_SRC_CX = 641, PHONE_SRC_CY = 606;   // مركز التركيبة في الصورة الأصلية
const PHONE_K = 1.7 / 1077;                      // وحدة العالم لكل بكسل (التركيبة طولها 1.7)
const PHONE_H = 1.65;                            // طول التليفون الكامل واقف على الشلف
// الشلف: حيطة كريمي نازلة من لوحة الترحيب وبتلف في النص بقوس ناعم لبرا (مش زاوية 90)، وحافة ذهبي.
// الكريمي هنا لازم يطابق --shop-cream في theme.css
const PHONE_SHELF_CREAM = 0xfbf8f1;
const PHONE_SHELF_GOLD = 0xe4d09c;
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
            <div class="hero-phone" id="heroPhone"></div>
            <div class="phone-stage-cap" id="heroPhoneCap">${PHONE_CAP_IDLE}</div>
        </section>`;
}

function phone3dLoadImages() {
    const names = PHONE_LAYOUT.map(r => r[0]);
    const load = (src) => new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = () => rej(new Error('img ' + src));
        im.src = src;
    });
    return Promise.all([load(PHONE_WHOLE_IMG), ...names.map(n => load('phone-' + n + '.png'))]).then(list => {
        const map = { whole: list[0] };
        names.forEach((n, i) => { map[n] = list[i + 1]; });
        return map;
    });
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
    Promise.all([phone3dLoadThree(), phone3dLoadImages()]).then(([, imgs]) => {
        _p3Pending = null;
        if (!document.body.contains(host)) return;   // الشاشة اتعاد رسمها وإحنا بنحمّل
        _p3 = p3Build(host, imgs);
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

// ---------- أدوات صغيرة ----------
function p3RoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// خريطة انعكاسات بسيطة (سقف فاتح وسوفت بوكسات)، من غيرها المعدن بيطلع أسود ومطفي
function p3Environment(renderer) {
    const T = THREE;
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#f4efe4'); g.addColorStop(0.45, '#8a8070'); g.addColorStop(0.55, '#2b261e'); g.addColorStop(1, '#0b0906');
    x.fillStyle = g; x.fillRect(0, 0, 512, 256);
    x.fillStyle = 'rgba(255,255,255,.95)';
    [[60, 40, 110, 34], [250, 28, 140, 26], [400, 70, 90, 40]].forEach(([a, b, w, h]) => { p3RoundRect(x, a, b, w, h, 6); x.fill(); });
    x.fillStyle = 'rgba(232,201,122,.85)'; p3RoundRect(x, 170, 118, 160, 10, 4); x.fill();
    const tex = new T.CanvasTexture(c);
    tex.mapping = T.EquirectangularReflectionMapping;
    tex.colorSpace = T.SRGBColorSpace;
    const pm = new T.PMREMGenerator(renderer);
    const env = pm.fromEquirectangular(tex).texture;
    tex.dispose(); pm.dispose();
    return env;
}

// ---------- بناء المشهد ----------
function p3Build(host, imgs) {
    const T = THREE;
    host.innerHTML = '';

    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.touchAction = 'pan-y pinch-zoom';
    host.appendChild(renderer.domElement);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 0.3, 4.8);
    camera.lookAt(0, 0.12, 0);

    scene.environment = p3Environment(renderer);
    scene.add(new T.HemisphereLight(0xfff3d6, 0x2a2318, 0.5));
    const key = new T.DirectionalLight(0xffffff, 1.8); key.position.set(2.5, 3, 4); scene.add(key);
    const rim = new T.DirectionalLight(0xdfe6ff, 1.4); rim.position.set(-3, 1.5, -2.5); scene.add(rim);

    // ---------- الشلف: حيطة كريمي نازلة من فوق، بتلف عند النص بقوس (نصف قطر R) وتبقى سطح أفقي قدّام ----------
    // المقطع (z,y) بيتبني مرة واحدة وبيتسحب على عرض الشاشة كله (scale.x بيتظبط في resize).
    const SHELF_TOP = -0.755;      // سطح الشلف (تحت التليفون مباشرة)
    const SHELF_WALL_Z = -0.95;    // مكان الحيطة
    const SHELF_R = 0.55;          // قوس اللفّة
    const SHELF_FRONT_Z = 0.95;    // حافة الشلف الأمامية
    const SHELF_T = 0.05;          // السُمك
    const SHELF_TOP_Y = 2.4;       // أعلى الحيطة (برا الكادر عشان تلزق في اللوحة)
    const PHONE_Z = 0.15;          // التليفون واقف على الجزء المسطّح
    const shelfFit = [];
    let shadow = null;
    {
        const cream = new T.MeshStandardMaterial({ color: PHONE_SHELF_CREAM, metalness: 0, roughness: 0.5 });
        const gold = new T.MeshStandardMaterial({ color: PHONE_SHELF_GOLD, metalness: 0.6, roughness: 0.32 });

        const zc = SHELF_WALL_Z + SHELF_R, yc = SHELF_TOP + SHELF_R, N = 28;
        const pts = [];
        pts.push([SHELF_WALL_Z, SHELF_TOP_Y]);
        for (let i = 0; i <= N; i++) {                       // السطح الأمامي: القوس من الحيطة للأرضية
            const f = Math.PI + (Math.PI / 2) * (i / N);
            pts.push([zc + SHELF_R * Math.cos(f), yc + SHELF_R * Math.sin(f)]);
        }
        pts.push([SHELF_FRONT_Z, SHELF_TOP]);
        pts.push([SHELF_FRONT_Z, SHELF_TOP - SHELF_T]);
        for (let i = N; i >= 0; i--) {                       // الوش الخلفي: قوس أكبر بسُمك الشلف
            const f = Math.PI + (Math.PI / 2) * (i / N);
            const r = SHELF_R + SHELF_T;
            pts.push([zc + r * Math.cos(f), yc + r * Math.sin(f)]);
        }
        pts.push([SHELF_WALL_Z - SHELF_T, SHELF_TOP_Y]);
        const shape = new T.Shape();
        pts.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
        shape.closePath();
        const geo = new T.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, curveSegments: 1 });
        geo.translate(0, 0, -0.5);
        geo.rotateY(-Math.PI / 2);                           // الشكل (z,y) والسحب على محور x
        const wall = new T.Mesh(geo, cream);
        scene.add(wall);
        shelfFit.push(wall);

        // حافة ذهبي على الطرف الأمامي
        const lipGeo = new T.CylinderGeometry(0.03, 0.03, 1, 20);
        lipGeo.rotateZ(Math.PI / 2);
        const lip = new T.Mesh(lipGeo, gold);
        lip.position.set(0, SHELF_TOP - SHELF_T / 2, SHELF_FRONT_Z);
        scene.add(lip);
        shelfFit.push(lip);

        // ضل ناعم تحت التليفون
        const sc = document.createElement('canvas');
        sc.width = sc.height = 128;
        const sx = sc.getContext('2d');
        const sg = sx.createRadialGradient(64, 64, 8, 64, 64, 64);
        sg.addColorStop(0, 'rgba(60,48,30,0.35)'); sg.addColorStop(1, 'rgba(60,48,30,0)');
        sx.fillStyle = sg; sx.fillRect(0, 0, 128, 128);
        const st = new T.CanvasTexture(sc);
        st.colorSpace = T.SRGBColorSpace;
        shadow = new T.Mesh(new T.PlaneGeometry(1.2, 1.2), new T.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false }));
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(0, SHELF_TOP + 0.002, PHONE_Z);
        scene.add(shadow);
    }

    // ---------- صور حقيقية على مستويات (planes) ----------
    const parts = {};        // القطع اللي ليها اسم وبتتحدد
    const decos = [];        // قطع ديكور من غير اسم
    const meshList = [];     // اللي بيتلمس: التليفون كامل + القطع المسمّاة
    const exWrap = new T.Group();   // التركيبة المفكوكة (بتتكبّر/تتصغّر حسب عرض الشاشة)
    exWrap.position.z = PHONE_Z;
    scene.add(exWrap);

    function planeFor(img, w, h) {
        const tex = new T.Texture(img);
        tex.colorSpace = T.SRGBColorSpace;
        tex.anisotropy = 4;
        tex.needsUpdate = true;
        const mat = new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
        const m = new T.Mesh(new T.PlaneGeometry(w, h), mat);
        // قناع الشفافية (عشان اللمس يتحسب على شكل القطعة مش على المستطيل)
        try {
            const sc = Math.min(1, 96 / Math.max(img.naturalWidth, img.naturalHeight));
            const cw = Math.max(1, Math.round(img.naturalWidth * sc)), ch = Math.max(1, Math.round(img.naturalHeight * sc));
            const c = document.createElement('canvas'); c.width = cw; c.height = ch;
            const cx = c.getContext('2d'); cx.drawImage(img, 0, 0, cw, ch);
            m.userData.alpha = { w: cw, h: ch, d: cx.getImageData(0, 0, cw, ch).data };
        } catch (e) { /* لو الصورة اتحجبت من المتصفح نعتمد على المستطيل */ }
        return m;
    }

    // التليفون كامل (صورة حقيقية واقفة على الشلف)
    const wholeW = PHONE_H * imgs.whole.naturalWidth / imgs.whole.naturalHeight;
    const whole = planeFor(imgs.whole, wholeW, PHONE_H);
    whole.position.set(0, SHELF_TOP + PHONE_H / 2, PHONE_Z);
    whole.userData.key = 'phone';
    scene.add(whole);
    meshList.push(whole);

    // القطع: بنجمّع كل مجموعة في Group مركزه مركز القطع اللي فيه
    const groups = {};
    PHONE_LAYOUT.forEach(([file, key, cx, cy, w, h, z, delay]) => {
        const gk = key || ('deco-' + file);
        (groups[gk] = groups[gk] || { key, delay, z, items: [] }).items.push({ file, cx, cy, w, h, z });
    });
    Object.keys(groups).forEach(gk => {
        const g = groups[gk];
        const x0 = Math.min(...g.items.map(i => i.cx - i.w / 2)), x1 = Math.max(...g.items.map(i => i.cx + i.w / 2));
        const y0 = Math.min(...g.items.map(i => i.cy - i.h / 2)), y1 = Math.max(...g.items.map(i => i.cy + i.h / 2));
        const gcx = (x0 + x1) / 2, gcy = (y0 + y1) / 2;
        const obj = new T.Group();
        const mats = [];
        g.items.forEach(it => {
            const m = planeFor(imgs[it.file], it.w * PHONE_K, it.h * PHONE_K);
            m.position.set((it.cx - gcx) * PHONE_K, -(it.cy - gcy) * PHONE_K, (it.z - g.z) + 0.0001);
            if (g.key) { m.userData.key = g.key; meshList.push(m); }
            obj.add(m); mats.push(m.material);
        });
        const ex = new T.Vector3((gcx - PHONE_SRC_CX) * PHONE_K, -(gcy - PHONE_SRC_CY) * PHONE_K, g.z);
        exWrap.add(obj);
        const rec = { obj, ex, delay: g.delay, mats, base: new T.Vector3() };
        if (g.key) parts[g.key] = rec; else decos.push(rec);
    });

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
        host, renderer, scene, camera, exWrap, whole, parts, decos, meshList, chips, lines, back,
        raycaster: new T.Raycaster(), vec: new T.Vector3(),
        ex: 0, target: 0, last: 0, raf: 0, active: false, selected: null,
        w: 1, h: 1, down: null, ro: null, shadow, baseVec: new T.Vector3(), fit: 1
    };

    function resize() {
        const w = host.clientWidth || 300, h = host.clientHeight || 200;
        s.w = w; s.h = h;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        // الحيطة والشلف يملّوا عرض الكادر كله (من حافة لحافة) مهما كان حجم الشاشة
        const d = camera.position.z - SHELF_WALL_Z;
        const fullW = 2 * d * Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
        shelfFit.forEach(m => { m.scale.x = fullW * 1.25; });
        // التركيبة المفكوكة تتظبط على عرض الكادر وتفضل فوق الشلف
        const dl = camera.position.z - PHONE_Z;
        const visW = 2 * dl * Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
        const fit = Math.min(1.12, (visW * 0.94) / (1250 * PHONE_K));
        s.fit = fit;
        exWrap.scale.setScalar(fit);
        exWrap.position.y = SHELF_TOP + 0.1 + (1077 * PHONE_K * fit) / 2;
        s.baseVec.set(0, (whole.position.y - exWrap.position.y) / fit, -0.05);
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
    const hits = s.raycaster.intersectObjects(s.meshList, false);
    for (const h of hits) {
        const o = h.object;
        if (o.material.opacity < 0.5) continue;           // القطعة مش ظاهرة دلوقتي
        const al = o.userData.alpha;
        if (al && h.uv) {                                  // بنتجاهل المناطق الشفافة حوالين القطعة
            const px = Math.min(al.w - 1, Math.max(0, Math.floor(h.uv.x * al.w)));
            const py = Math.min(al.h - 1, Math.max(0, Math.floor((1 - h.uv.y) * al.h)));
            if (al.d[(py * al.w + px) * 4 + 3] < 90) continue;
        }
        return o.userData.key;
    }
    return null;
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
    const place = (p) => {
        const t = p3Smooth((e - p.delay) / (1 - p.delay * 0.9));
        p.obj.position.lerpVectors(s.baseVec, p.ex, t);
        p.obj.scale.setScalar(0.5 + 0.5 * t);
        p.mats.forEach(m => { m.opacity = t; });
        p.obj.visible = t > 0.01;
    };
    Object.keys(s.parts).forEach(k => place(s.parts[k]));
    s.decos.forEach(place);
    // التليفون الكامل بيختفي بسرعة أول ما التفكيك يبدأ
    const w = 1 - p3Smooth(e * 2.5);
    s.whole.material.opacity = w;
    s.whole.visible = w > 0.01;
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

    // ميل خفيف للتركيبة المفكوكة عشان يبان العمق بين الطبقات
    s.exWrap.rotation.y = Math.sin(now / 1600) * 0.1 * e;

    p3Apply(s, e);
    if (s.shadow) {
        s.shadow.material.opacity = 1 - 0.35 * e;
        s.shadow.scale.set(1 + 1.8 * e, 1, 1 + 0.2 * e);
    }
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
