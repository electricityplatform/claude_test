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
// لون ظهر التليفون (رمادي جرافيت زي الصورة). غيّره براحتك، مثلاً 0x1c2230 أزرق ليلي أو 0x2a2a2e أسود
const PHONE_BACK_COLOR = 0x55575b;
// لون الإطار الجانبي (ألومنيوم داكن)
const PHONE_FRAME_COLOR = 0x2b2c2f;
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
// بيرسم مستطيل بحواف دايرية على Shape أو Path
function p3RRPath(s, w, h, r) {
    r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001);
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x + w, y + h - r);
    s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    s.lineTo(x + r, y + h);
    s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(x, y + r);
    s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
    return s;
}

function p3Extrude(shape, d, bev, mat) {
    bev = Math.min(bev, d * 0.45);
    const depth = Math.max(d - bev * 2, 0.002);
    const g = new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.8, bevelSegments: 4, curveSegments: 14
    });
    g.translate(0, 0, -depth / 2);
    return new THREE.Mesh(g, mat);
}

// لوح بحواف دايرية وسُمك (z). الحجم الكلي w × h × d. bev = نعومة الحواف (اختياري).
function p3Slab(w, h, d, r, mat, bev) {
    return p3Extrude(p3RRPath(new THREE.Shape(), w, h, r), d, bev === undefined ? Math.min(d * 0.22, 0.007) : bev, mat);
}

// حلقة (الإطار المعدني): مستطيل دايري بفتحة في النص
function p3Ring(wo, ho, ro, wi, hi, ri, d, mat, bev) {
    const shape = p3RRPath(new THREE.Shape(), wo, ho, ro);
    shape.holes.push(p3RRPath(new THREE.Path(), wi, hi, ri));
    return p3Extrude(shape, d, bev, mat);
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
    g.addColorStop(0, '#2c3340'); g.addColorStop(0.5, '#0f1218'); g.addColorStop(1, '#1d222c');
    x.fillStyle = g; x.fillRect(0, 0, 256, 540);
    const r = x.createRadialGradient(205, 50, 5, 205, 50, 230);
    r.addColorStop(0, 'rgba(140,170,220,.5)'); r.addColorStop(1, 'rgba(140,170,220,0)');
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
            x.fillStyle = 'rgba(170,190,230,' + a.toFixed(2) + ')';
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

// لمعة زجاج الشاشة (مائلة وشفافة)
function p3SheenTexture() {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 270;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 128, 270);
    g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(0.28, 'rgba(255,255,255,.06)');
    g.addColorStop(0.3, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 270);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

// ---------- بناء المشهد ----------
function p3Build(host) {
    const T = THREE;
    host.innerHTML = '';

    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.touchAction = 'pan-y pinch-zoom';
    host.appendChild(renderer.domElement);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 0.45, 4.1);
    camera.lookAt(0, -0.2, 0);

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

    const group = new T.Group();
    group.position.z = PHONE_Z;
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
        g.add(p3Slab(0.70, 1.46, 0.035, 0.09, new T.MeshPhysicalMaterial({ color: 0x0b0b0d, metalness: 0.4, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 })));
        const plane = new T.Mesh(
            new T.PlaneGeometry(0.64, 1.38),
            new T.MeshBasicMaterial({ map: p3ScreenTexture() })
        );
        plane.position.z = 0.0185;
        g.add(plane);
        const sheen = new T.Mesh(
            new T.PlaneGeometry(0.64, 1.38),
            new T.MeshBasicMaterial({ map: p3SheenTexture(), transparent: true, depthWrite: false })
        );
        sheen.position.z = 0.0192;
        g.add(sheen);
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

    // الغطاء الخلفي: زجاج رمادي لامع + إطار ألومنيوم داكن + زرّين جانبيين زي الصورة
    {
        const g = new T.Group();
        const glass = new T.MeshPhysicalMaterial({ color: PHONE_BACK_COLOR, metalness: 0.2, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 });
        g.add(p3Slab(0.715, 1.475, 0.03, 0.1, glass, 0.012));

        const metal = new T.MeshStandardMaterial({ color: PHONE_FRAME_COLOR, metalness: 1, roughness: 0.3 });
        const frame = p3Ring(0.74, 1.5, 0.115, 0.7, 1.46, 0.095, 0.12, metal, 0.006);
        frame.position.z = 0.035;
        g.add(frame);
        const vol1 = p3Box(0.016, 0.18, 0.03, metal); vol1.position.set(0.376, 0.235, 0.035); g.add(vol1);
        const vol2 = p3Box(0.016, 0.18, 0.03, metal); vol2.position.set(0.376, -0.2, 0.035); g.add(vol2);

        addPart('back', g, new T.Vector3(0, 0, -0.02), new T.Vector3(0, 0, -0.42), 0.24);
    }

    // الكاميرا (ورا الغطاء): مربع بحواف دايرية في الركن العلوي، عدستين قطريتين + فلاش + مايك صغير (زي الصورة)
    {
        const g = new T.Group();
        const island = new T.MeshPhysicalMaterial({ color: 0x3b3d41, metalness: 0.35, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06 });
        g.add(p3Slab(0.34, 0.34, 0.028, 0.095, island, 0.01));
        const ringMat = new T.MeshStandardMaterial({ color: 0xb9bbc0, metalness: 1, roughness: 0.22 });
        const barrel = new T.MeshStandardMaterial({ color: 0x0a0a0c, metalness: 0.9, roughness: 0.3 });
        const lensGlass = new T.MeshPhysicalMaterial({ color: 0x0a0d2a, metalness: 1, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0 });
        const lens = (px, py, r) => {
            const ring = new T.Mesh(new T.CylinderGeometry(r, r, 0.022, 40), ringMat);
            ring.rotation.x = Math.PI / 2; ring.position.set(px, py, -0.02); g.add(ring);
            const bar = new T.Mesh(new T.CylinderGeometry(r * 0.84, r * 0.84, 0.026, 40), barrel);
            bar.rotation.x = Math.PI / 2; bar.position.set(px, py, -0.022); g.add(bar);
            const gl = new T.Mesh(new T.CylinderGeometry(r * 0.62, r * 0.62, 0.03, 40), lensGlass);
            gl.rotation.x = Math.PI / 2; gl.position.set(px, py, -0.024); g.add(gl);
        };
        // (الظهر بيتشاف من ناحية -z فالمحور x معكوس: +x = شمال الشاشة)
        lens(0.078, 0.078, 0.064);      // عدسة فوق شمال
        lens(-0.078, -0.078, 0.064);    // عدسة تحت يمين
        const flash = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.01, 24), new T.MeshStandardMaterial({ color: 0xf1ead2, metalness: 0.3, roughness: 0.4 }));
        flash.rotation.x = Math.PI / 2; flash.position.set(-0.085, 0.09, -0.018); g.add(flash);
        const mic = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 0.008, 12), new T.MeshStandardMaterial({ color: 0x0a0a0c, metalness: 0.5, roughness: 0.5 }));
        mic.rotation.x = Math.PI / 2; mic.position.set(0.09, -0.095, -0.016); g.add(mic);
        addPart('camera', g, new T.Vector3(0.15, 0.525, -0.05), new T.Vector3(0.3, 0.7, -0.8), 0.3);
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
        w: 1, h: 1, down: null, ro: null, shadow
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
    s.group.position.y = 0.25 * e;                            // وقت التفكيك التليفون بيطلع شوية عشان فلاتة الشحن ما تدخلش في الشلف
    if (s.shadow) s.shadow.material.opacity = 1 - 0.6 * e;
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
