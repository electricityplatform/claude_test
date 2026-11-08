// ================= إعدادات الحساب (الصورة الشخصية) =================
// - لو المستخدم دخل بـ "تذكرني" وبعدين خرج: صورته بتفضل ظاهرة مكان أيقونة الدخول (الشريط السفلي + شاشة الدخول).
//   من غير "تذكرني": مفيش أي صورة بتتحفظ، لا بعد الخروج ولا بعد الريفرش.
// - الأفاتار في الهيدر بيظهر الصورة (أو أول حرف من الاسم لو مفيش صورة)، والضغط عليه بيفتح نافذة التعديل.
// - تقدر تختار صورة بأي نوع بيقرأه المتصفح (JPG / PNG / WebP / GIF / BMP / AVIF ...). الموقع بيقصها مربعة ويصغّرها 256x256،
//   وبيحوّلها لأنسب صيغة: JPEG للصور العادية، وWebP أو PNG لو الصورة فيها شفافية (زي اللوجوهات).
// - بتتبعت للـ RPC "set_profile_photo" اللي بتخزنها في جدول users (عمود profile_photo_url) وتكتب فوق القديمة. الجلب والحذف كمان بالـ RPC.

const PROFILE_PHOTO_SIZE = 256;
const PROFILE_PHOTO_MAX_BYTES = 120 * 1024;   // حد أمان تحت حد السيرفر (150KB)
const PROFILE_PHOTO_QUALITIES = [0.85, 0.7, 0.55, 0.4];
const PROFILE_PHOTO_MAX_INPUT_BYTES = 15 * 1024 * 1024;

let currentUserPhotoUrl = '';
let _photoLoadFailed = false;
let _photoBusy = false;
let _photoDeleteArmed = false;
let _photoDeleteTimer = null;

// ---------- صورة "تذكرني" (بتتحفظ في المتصفح بس لو "تذكرني" متعلّمة) ----------
const REMEMBERED_PHOTO_KEY = 'saved_photo';

// الصورة المتذكّرة: بتظهر بس لو مفيش حد داخل، و"تذكرني" لسه شغّالة
function rememberedPhotoUrl() {
    if (currentUserId || _photoLoadFailed) return '';
    try {
        if (!localStorage.getItem('saved_phone')) return '';
        return localStorage.getItem(REMEMBERED_PHOTO_KEY) || '';
    } catch (e) { return ''; }
}

// بتحفظ صورة المستخدم الحالي لو دخل بـ "تذكرني"، وغير كده بتمسح أي صورة محفوظة
function cacheRememberedPhoto() {
    try {
        if (rememberLogin && currentUserId && currentUserPhotoUrl && localStorage.getItem('saved_phone')) {
            localStorage.setItem(REMEMBERED_PHOTO_KEY, currentUserPhotoUrl);
        } else {
            localStorage.removeItem(REMEMBERED_PHOTO_KEY);
        }
    } catch (e) { /* التخزين غير متاح أو ممتلئ */ }
}

// أفاتار الشريط السفلي لما مفيش حد داخل (فاضي لو مفيش صورة متذكّرة)
function rememberedAvatarHtml(sizeClass) {
    const url = rememberedPhotoUrl();
    if (!url) return '';
    return '<div class="avatar"><div class="' + (sizeClass || 'w-9') + ' rounded-full"><img src="' + escapeHtmlValue(url) +
        '" alt="" onerror="handleProfilePhotoError()"></div></div>';
}

// محتوى دايرة الأفاتار في شاشة الدخول: الصورة المتذكّرة أو أيقونة المستخدم العادية
function loginAvatarHtml() {
    const url = rememberedPhotoUrl();
    if (!url) return uiIcon('user', 'w-9 h-9');
    return '<img class="remembered-photo" src="' + escapeHtmlValue(url) + '" alt="" onerror="handleProfilePhotoError()">';
}

function refreshLoginAvatar() {
    const el = document.getElementById('loginAvatar');
    if (el) el.innerHTML = loginAvatarHtml();
}

function profileInitial() {
    return currentUserName ? String(currentUserName).trim().charAt(0) : '';
}

// شكل الأفاتار: صورة لو موجودة، وإلا أول حرف من الاسم
function profileAvatarHtml(sizeClass) {
    const size = sizeClass || 'w-9';
    if (currentUserPhotoUrl && !_photoLoadFailed) {
        return '<div class="avatar"><div class="' + size + ' rounded-full"><img src="' + escapeHtmlValue(currentUserPhotoUrl) +
            '" alt="" onerror="handleProfilePhotoError()"></div></div>';
    }
    return '<div class="avatar placeholder"><div class="bg-neutral text-neutral-content ' + size + ' rounded-full"><span class="text-sm font-bold">' +
        escapeHtmlValue(profileInitial()) + '</span></div></div>';
}

function handleProfilePhotoError() {
    if (_photoLoadFailed) return;
    _photoLoadFailed = true;
    updateProfileAvatars();
    setPhotoStatus('تعذّر عرض الصورة، جرّب صورة تانية.', 'error');
}

function updateProfileAvatars() {
    if (!currentUserId) {
        // مفيش حد داخل: نحدّث الشريط السفلي وشاشة الدخول (مثلاً لو الصورة المتذكّرة ماتحمّلتش نرجّع الأيقونة)
        if (typeof renderBottomNav === 'function') renderBottomNav();
        refreshLoginAvatar();
        return;
    }
    document.querySelectorAll('.user-avatar-btn').forEach(function (el) {
        el.innerHTML = profileAvatarHtml();
    });
    const preview = document.getElementById('photoPreview');
    if (preview) preview.innerHTML = photoPreviewInner();
    const delBtn = document.getElementById('photoDeleteBtn');
    if (delBtn) delBtn.classList.toggle('photo-edit-hidden', !currentUserPhotoUrl);
}

// بيجيب رابط الصورة من السيرفر (بعد الدخول أو استرجاع الجلسة)
async function loadProfilePhoto() {
    if (!currentUserId) return;
    try {
        const res = await supabaseClient.rpc('get_profile_photo', { p_user_id: currentUserId });
        if (res.error) throw res.error;
        currentUserPhotoUrl = res.data || '';
        _photoLoadFailed = false;
        cacheRememberedPhoto();
        updateProfileAvatars();
    } catch (err) {
        console.error('Profile photo load error:', err);
    }
}

function resetProfilePhoto() {
    currentUserPhotoUrl = '';
    _photoLoadFailed = false;
    closeProfilePhotoSheet(true);
}

// ---------- العارض (ملء الشاشة) + قائمة التعديل ----------
const PHOTO_ICON_PATHS = {
    back:    'M14 5l7 7m0 0l-7 7m7-7H3',
    close:   'M6 18L18 6M6 6l12 12',
    pencil:  'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    camera:  'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z',
    gallery: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
};

function photoSvg(name) {
    return '<svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="' +
        PHOTO_ICON_PATHS[name] + '"></path></svg>';
}

function photoPreviewInner() {
    if (currentUserPhotoUrl && !_photoLoadFailed) {
        return '<img src="' + escapeHtmlValue(currentUserPhotoUrl) + '" alt="">';
    }
    return '<span>' + escapeHtmlValue(profileInitial()) + '</span>';
}

function setPhotoStatus(text, kind) {
    const el = document.getElementById('photoStatus');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'photo-status' + (kind ? ' ' + kind : '');
}

function setPhotoBusy(busy) {
    _photoBusy = busy;
    ['photoCameraBtn', 'photoGalleryBtn', 'photoDeleteBtn', 'photoEditCloseBtn'].forEach(function (id) {
        const b = document.getElementById(id);
        if (b) b.disabled = busy;
    });
}

// الضغط على الصورة الشخصية: يفتح العارض بملء الشاشة (خلفية سودا + سهم رجوع + العنوان + زر القلم)
function openProfilePhotoSheet() {
    if (!currentUserId || document.getElementById('photoSheet')) return;
    const v = document.createElement('div');
    v.id = 'photoSheet';
    v.className = 'photo-viewer';
    v.setAttribute('dir', 'rtl');
    v.setAttribute('role', 'dialog');
    v.setAttribute('aria-label', 'صورة الملف الشخصي');
    v.innerHTML =
        '<div class="photo-viewer-bar">' +
            '<button type="button" class="photo-viewer-btn" onclick="closeProfilePhotoSheet()" aria-label="إغلاق">' + photoSvg('back') + '</button>' +
            '<div class="photo-viewer-title">صورة الملف الشخصي</div>' +
            '<button type="button" class="photo-viewer-btn" onclick="openPhotoEditSheet()" aria-label="تعديل الصورة">' + photoSvg('pencil') + '</button>' +
        '</div>' +
        '<div class="photo-viewer-stage"><div id="photoPreview" class="photo-viewer-img">' + photoPreviewInner() + '</div></div>';
    document.body.appendChild(v);
}

// زر القلم: قائمة من تحت فيها الكاميرا والمعرض (وسلة المهملات لو في صورة)
function openPhotoEditSheet() {
    const v = document.getElementById('photoSheet');
    if (!v || document.getElementById('photoEditSheet')) return;
    const s = document.createElement('div');
    s.id = 'photoEditSheet';
    s.className = 'photo-edit-backdrop';
    s.setAttribute('onclick', 'if (event.target === this) closePhotoEditSheet()');
    s.innerHTML =
        '<div class="photo-edit-card" role="dialog" aria-label="صورة الملف الشخصي">' +
            '<div class="photo-edit-handle"></div>' +
            '<div class="photo-edit-head">' +
                '<button type="button" id="photoEditCloseBtn" class="photo-edit-iconbtn" onclick="closePhotoEditSheet()" aria-label="إغلاق">' + photoSvg('close') + '</button>' +
                '<h3>صورة الملف الشخصي</h3>' +
                '<button type="button" id="photoDeleteBtn" class="photo-edit-iconbtn' + (currentUserPhotoUrl ? '' : ' photo-edit-hidden') + '" onclick="deleteProfilePhoto()" aria-label="حذف الصورة">' + photoSvg('trash') + '</button>' +
            '</div>' +
            '<div id="photoStatus" class="photo-status"></div>' +
            '<input type="file" id="photoCameraInput" accept="image/*" capture="user" class="hidden" onchange="handleProfilePhotoFile(this)">' +
            '<input type="file" id="photoFileInput" accept="image/*" class="hidden" onchange="handleProfilePhotoFile(this)">' +
            '<button type="button" id="photoCameraBtn" class="photo-edit-row" onclick="document.getElementById(\'photoCameraInput\').click()">' + photoSvg('camera') + '<span>الكاميرا</span></button>' +
            '<button type="button" id="photoGalleryBtn" class="photo-edit-row" onclick="document.getElementById(\'photoFileInput\').click()">' + photoSvg('gallery') + '<span>المعرض</span></button>' +
        '</div>';
    v.appendChild(s);
}

function closePhotoEditSheet() {
    clearTimeout(_photoDeleteTimer);
    _photoDeleteArmed = false;
    const s = document.getElementById('photoEditSheet');
    if (s) s.remove();
}

// بيقفل أعلى حاجة مفتوحة: قائمة التعديل الأول، وبعدها العارض (زر رجوع الموبايل بيعدّي من هنا). all=true بيقفل الاتنين (عند الخروج).
function closeProfilePhotoSheet(all) {
    if (document.getElementById('photoCropper')) { cancelPhotoCrop(); closePhotoEditSheet(); return; }   // شاشة القص مفتوحة: الرجوع بيقفلها بس
    if (!all && document.getElementById('photoEditSheet')) { closePhotoEditSheet(); return; }
    closePhotoEditSheet();
    const v = document.getElementById('photoSheet');
    if (v) v.remove();
}

// ---------- معالجة الصورة ----------
function loadImageFromFile(file) {
    return new Promise(function (resolve, reject) {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('decode')); };
        img.src = url;
    });
}

function canvasHasTransparency(ctx, size) {
    const d = ctx.getImageData(0, 0, size, size).data;
    for (let i = 3; i < d.length; i += 4) {
        if (d[i] < 250) return true;
    }
    return false;
}

// بتقص الصورة مربعة من النص وتصغّرها، وبترجّع { mime, b64 } (الـ base64 من غير البادئة)
async function fileToSquareBase64(file) {
    const img = await loadImageFromFile(file);
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    const size = PROFILE_PHOTO_SIZE;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

    // صورة فيها شفافية: نحافظ عليها (WebP لو المتصفح بيدعمه، وإلا PNG) بشرط إن الحجم يكون مناسب
    if (canvasHasTransparency(ctx, size)) {
        for (const mime of ['image/webp', 'image/png']) {
            const url = canvas.toDataURL(mime, 0.85);
            if (url.indexOf('data:' + mime) !== 0) continue;   // المتصفح مش بيدعم الترميز ده
            const b64 = url.split(',')[1];
            if (b64.length * 0.75 <= PROFILE_PHOTO_MAX_BYTES) return { mime: mime, b64: b64 };
        }
        // كبيرة أو مش مدعومة: نكمل JPEG بخلفية بيضاء ورا الأجزاء الشفافة
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
    }

    // JPEG: نبدأ بجودة عالية وننزّلها لحد ما الحجم يبقى مناسب
    let b64 = '';
    for (const q of PROFILE_PHOTO_QUALITIES) {
        b64 = canvas.toDataURL('image/jpeg', q).split(',')[1];
        if (b64.length * 0.75 <= PROFILE_PHOTO_MAX_BYTES) break;
    }
    return { mime: 'image/jpeg', b64: b64 };
}

// رسالة الخطأ: لو جاية من السيرفر بالعربي نعرضها، وإلا رسالة عامة
function photoErrorMessage(error) {
    const msg = error && error.message ? String(error.message) : '';
    if (/[\u0600-\u06FF]/.test(msg)) return msg;
    return 'تعذّر الاتصال بالخادم، تأكد من الإنترنت وحاول تاني';
}

async function rpcPhoto(name, args) {
    const res = await supabaseClient.rpc(name, args);
    if (res.error) throw new Error(photoErrorMessage(res.error));
    if (res.data && res.data.success === false) throw new Error(res.data.message || 'حدث خطأ غير متوقع');
    return res.data;
}

// ---------- قص الصورة (شاشة كاملة: إطار مربع بشبكة، إلغاء / تدوير / تم) ----------
// بترجّع File مربع بعد القص، أو null لو المستخدم داس إلغاء. لو الصورة ما اتفتحتش بترجّع الأصلية وتكمل عادي.
let _photoCropCancel = null;
function cancelPhotoCrop() { if (_photoCropCancel) _photoCropCancel(); }

// بنرسم الصورة على كانفاس بحد أقصى 2400px (يحافظ على الذاكرة في الموبايل)
function toCanvas(img) {
    const max = 2400;
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c;
}
function rotateCanvas(c) {
    const r = document.createElement('canvas');
    r.width = c.height; r.height = c.width;
    const x = r.getContext('2d');
    x.translate(r.width, 0);
    x.rotate(Math.PI / 2);
    x.drawImage(c, 0, 0);
    return r;
}

function cropProfilePhoto(file) {
    return new Promise(function (resolve) {
        if (!file || !/^image\//.test(file.type || 'image/jpeg')) { resolve(file || null); return; }
        loadImageFromFile(file).then(function (img) {
            let src = toCanvas(img);
            const root = document.createElement('div');
            root.id = 'photoCropper';
            root.innerHTML =
                '<div class="pc-stage"></div>' +
                '<div class="pc-bar">' +
                '<button type="button" class="pc-cancel">إلغاء</button>' +
                '<button type="button" class="pc-rot" aria-label="تدوير"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg></button>' +
                '<button type="button" class="pc-ok">تم</button>' +
                '</div>';
            document.body.appendChild(root);
            const stage = root.querySelector('.pc-stage');
            const view = document.createElement('canvas');
            stage.appendChild(view);
            const shades = [0, 1, 2, 3].map(function () { const d = document.createElement('div'); d.className = 'pc-shade'; stage.appendChild(d); return d; });
            const box = document.createElement('div');
            box.className = 'pc-box';
            ['n', 's', 'e', 'w'].forEach(function (c) { const h = document.createElement('div'); h.className = 'pc-e'; h.dataset.c = c; box.appendChild(h); });
            ['nw', 'ne', 'sw', 'se'].forEach(function (c) { const h = document.createElement('div'); h.className = 'pc-h'; h.dataset.c = c; box.appendChild(h); });
            stage.appendChild(box);

            let dx = 0, dy = 0, dw = 0, dh = 0;      // مكان الصورة المعروضة جوه المسرح
            let bx = 0, by = 0, bs = 0;               // الإطار (x, y, المقاس)
            const MIN = 96;

            function layout() {
                const W = stage.clientWidth, H = stage.clientHeight;
                const k = Math.min(W / src.width, H / src.height);
                dw = src.width * k; dh = src.height * k;
                dx = (W - dw) / 2; dy = (H - dh) / 2;
                view.width = Math.round(dw * (window.devicePixelRatio || 1));
                view.height = Math.round(dh * (window.devicePixelRatio || 1));
                view.style.cssText = 'left:' + dx + 'px;top:' + dy + 'px;width:' + dw + 'px;height:' + dh + 'px;';
                view.getContext('2d').drawImage(src, 0, 0, view.width, view.height);
                bs = Math.min(dw, dh); bx = dx + (dw - bs) / 2; by = dy + (dh - bs) / 2;
                draw();
            }
            function draw() {
                box.style.cssText = 'left:' + bx + 'px;top:' + by + 'px;width:' + bs + 'px;height:' + bs + 'px;';
                const r = dx + dw, b = dy + dh;
                const set = function (el, l, t, w, h) { el.style.cssText = 'left:' + l + 'px;top:' + t + 'px;width:' + Math.max(0, w) + 'px;height:' + Math.max(0, h) + 'px;'; };
                set(shades[0], dx, dy, dw, by - dy);                       // فوق
                set(shades[1], dx, by + bs, dw, b - (by + bs));            // تحت
                set(shades[2], dx, by, bx - dx, bs);                       // شمال
                set(shades[3], bx + bs, by, r - (bx + bs), bs);            // يمين
            }

            let drag = null;
            function pt(e) { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
            box.addEventListener('pointerdown', function (e) {
                const c = e.target.dataset && e.target.dataset.c;
                const p = pt(e);
                if (!c) {
                    drag = { mode: 'move', ox: p.x - bx, oy: p.y - by };
                } else if (c.length === 2) {
                    drag = { mode: 'corner', c: c, ax: (c === 'nw' || c === 'sw') ? bx + bs : bx, ay: (c === 'nw' || c === 'ne') ? by + bs : by };
                } else {
                    drag = { mode: 'edge', c: c, ar: bx + bs, ab: by + bs, l: bx, t: by, cx: bx + bs / 2, cy: by + bs / 2 };
                }
                try { box.setPointerCapture(e.pointerId); } catch (x) { /* مش مشكلة */ }
                e.preventDefault();
            });
            box.addEventListener('pointermove', function (e) {
                if (!drag) return;
                const p = pt(e);
                if (drag.mode === 'move') {
                    bx = Math.min(dx + dw - bs, Math.max(dx, p.x - drag.ox));
                    by = Math.min(dy + dh - bs, Math.max(dy, p.y - drag.oy));
                } else if (drag.mode === 'corner') {
                    const goLeft = drag.c === 'nw' || drag.c === 'sw';
                    const goUp = drag.c === 'nw' || drag.c === 'ne';
                    const maxW = goLeft ? drag.ax - dx : dx + dw - drag.ax;
                    const maxH = goUp ? drag.ay - dy : dy + dh - drag.ay;
                    const want = Math.max(Math.abs(p.x - drag.ax), Math.abs(p.y - drag.ay));
                    bs = Math.max(MIN, Math.min(want, maxW, maxH));
                    bx = goLeft ? drag.ax - bs : drag.ax;
                    by = goUp ? drag.ay - bs : drag.ay;
                } else {
                    // ضلع: المربع بيكبر/يصغر والضلع المقابل ثابت، والاتجاه التاني بيفضل متوسّط
                    const horiz = drag.c === 'e' || drag.c === 'w';
                    let want, along;
                    if (drag.c === 'e') { want = p.x - drag.l; along = dx + dw - drag.l; }
                    else if (drag.c === 'w') { want = drag.ar - p.x; along = drag.ar - dx; }
                    else if (drag.c === 's') { want = p.y - drag.t; along = dy + dh - drag.t; }
                    else { want = drag.ab - p.y; along = drag.ab - dy; }
                    const mid = horiz ? drag.cy : drag.cx;
                    const lo = horiz ? dy : dx, hi = horiz ? dy + dh : dx + dw;
                    const across = 2 * Math.min(mid - lo, hi - mid);
                    bs = Math.max(MIN, Math.min(want, along, across));
                    if (drag.c === 'e') { bx = drag.l; by = drag.cy - bs / 2; }
                    else if (drag.c === 'w') { bx = drag.ar - bs; by = drag.cy - bs / 2; }
                    else if (drag.c === 's') { by = drag.t; bx = drag.cx - bs / 2; }
                    else { by = drag.ab - bs; bx = drag.cx - bs / 2; }
                }
                draw();
            });
            const end = function () { drag = null; };
            box.addEventListener('pointerup', end);
            box.addEventListener('pointercancel', end);

            function close(result) {
                window.removeEventListener('resize', layout);
                _photoCropCancel = null;
                root.remove();
                resolve(result);
            }
            _photoCropCancel = function () { close(null); };

            root.querySelector('.pc-cancel').addEventListener('click', function () { close(null); });
            root.querySelector('.pc-rot').addEventListener('click', function () { src = rotateCanvas(src); layout(); });
            root.querySelector('.pc-ok').addEventListener('click', function () {
                const k = src.width / dw;
                const sx = (bx - dx) * k, sy = (by - dy) * k, ss = bs * k;
                const out = document.createElement('canvas');
                out.width = out.height = Math.min(1024, Math.round(ss));
                out.getContext('2d').drawImage(src, sx, sy, ss, ss, 0, 0, out.width, out.height);
                const keepAlpha = /^image\/(png|webp|gif|avif)$/.test(file.type || '');
                const mime = keepAlpha ? 'image/png' : 'image/jpeg';
                out.toBlob(function (blob) {
                    if (!blob) { close(file); return; }
                    close(new File([blob], keepAlpha ? 'profile.png' : 'profile.jpg', { type: mime }));
                }, mime, 0.9);
            });

            window.addEventListener('resize', layout);
            layout();
        }).catch(function () { resolve(file); });   // لو الصورة ما اتفتحتش نكمل بالأصلية
    });
}

// ---------- رفع / تغيير ----------
async function handleProfilePhotoFile(input) {
    const file = input && input.files && input.files[0];
    if (input) input.value = '';           // عشان اختيار نفس الصورة تاني يشتغل
    if (!file || _photoBusy) return;
    const looksLikeImage = (file.type && file.type.indexOf('image/') === 0) ||
        (!file.type && /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(file.name || ''));
    if (!looksLikeImage) { setPhotoStatus('اختر ملف صورة', 'error'); return; }
    if (file.size > PROFILE_PHOTO_MAX_INPUT_BYTES) { setPhotoStatus('الصورة كبيرة جدًا', 'error'); return; }

    const cropped = await cropProfilePhoto(file);   // شاشة القص
    if (!cropped) { closePhotoEditSheet(); return; }   // إلغاء: نرجع للصورة من غير قائمة الكاميرا/المعرض

    setPhotoBusy(true);
    setPhotoStatus('جارٍ رفع الصورة...', '');
    try {
        let out;
        try {
            out = await fileToSquareBase64(cropped);
        } catch (e) {
            throw new Error('المتصفح مش قادر يقرا نوع الصورة دي، جرّب JPG أو PNG أو WebP');
        }
        await rpcPhoto('set_profile_photo', { p_user_id: currentUserId, p_image_base64: out.b64 });
        currentUserPhotoUrl = 'data:' + out.mime + ';base64,' + out.b64;
        _photoLoadFailed = false;
        cacheRememberedPhoto();
        updateProfileAvatars();
        setPhotoStatus('تم حفظ الصورة', 'ok');
        setTimeout(closePhotoEditSheet, 700);
    } catch (err) {
        setPhotoStatus(err.message || 'حدث خطأ', 'error');
    } finally {
        setPhotoBusy(false);
    }
}

// ---------- حذف (بيطلب ضغطتين للتأكيد على سلة المهملات) ----------
async function deleteProfilePhoto() {
    if (_photoBusy) return;
    const btn = document.getElementById('photoDeleteBtn');
    if (!_photoDeleteArmed) {
        _photoDeleteArmed = true;
        if (btn) btn.classList.add('armed');
        setPhotoStatus('اضغط على سلة المهملات مرة تانية لتأكيد الحذف', 'error');
        clearTimeout(_photoDeleteTimer);
        _photoDeleteTimer = setTimeout(function () {
            _photoDeleteArmed = false;
            const b = document.getElementById('photoDeleteBtn');
            if (b) b.classList.remove('armed');
            setPhotoStatus('', '');
        }, 4000);
        return;
    }
    clearTimeout(_photoDeleteTimer);
    _photoDeleteArmed = false;
    setPhotoBusy(true);
    setPhotoStatus('جارٍ حذف الصورة...', '');
    try {
        await rpcPhoto('delete_profile_photo', { p_user_id: currentUserId });
        currentUserPhotoUrl = '';
        _photoLoadFailed = false;
        cacheRememberedPhoto();
        updateProfileAvatars();
        setPhotoStatus('تم حذف الصورة', 'ok');
        setTimeout(closePhotoEditSheet, 700);
    } catch (err) {
        if (btn) btn.classList.remove('armed');
        setPhotoStatus(err.message || 'حدث خطأ', 'error');
    } finally {
        setPhotoBusy(false);
    }
}
