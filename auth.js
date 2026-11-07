// ================= شاشة تسجيل الدخول (DaisyUI: card / tabs / input / btn / divider) =================
function renderLoginScreen() {
    const eye = `<svg id="loginEyeIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>`;
    const html = `
        <div class="auth-screen">
            <div class="auth-hero teal-floral">
                <div class="brand"><span>ELECTRICITY</span><span class="brand-chip">${logoImg()}</span></div>
            </div>
            <div class="auth-card">
                <div class="auth-avatar">${uiIcon('user', 'w-9 h-9')}</div>
                <h1 class="text-center font-bold text-lg text-primary mb-4">تسجيل الدخول</h1>
                <form id="loginFormContainer" onsubmit="handleLoginSubmit(event)" class="flex flex-col gap-2" autocomplete="off">
                    <div class="line-field">
                        <input type="text" id="loginPhone" required inputmode="tel" autocomplete="off" placeholder="رقم الهاتف" oninput="syncRememberedLogin()" dir="ltr">
                        ${uiIcon('device', 'w-5 h-5')}
                    </div>
                    <div class="line-field">
                        <button type="button" onclick="togglePasswordVisibility('loginPassword', 'loginEyeIcon')" aria-label="إظهار أو إخفاء رمز المرور">${eye}</button>
                        <input type="password" id="loginPassword" required autocomplete="new-password" placeholder="رمز المرور" oninput="syncRememberedLogin()" dir="ltr">
                        ${uiIcon('key', 'w-5 h-5')}
                    </div>
                    <label class="label cursor-pointer justify-start gap-2 py-2">
                        <input type="checkbox" id="rememberMe" class="checkbox checkbox-primary checkbox-sm" onchange="syncRememberedLogin()">
                        <span class="label-text text-primary font-semibold text-xs">تذكرني</span>
                    </label>
                    <button type="submit" class="btn btn-primary w-40 mx-auto">دخول</button>
                    <button type="button" onclick="loginAsVisitor()" class="btn btn-ghost btn-sm text-primary mx-auto mt-1">الدخول كزائر</button>
                </form>
                <div class="auth-foot" onclick="alert('شاشة إنشاء حساب')">ليس لديك حساب؟ إنشاء حساب</div>
            </div>
        </div>
    `;
    document.getElementById('appContainer').innerHTML = html;

    // تذكرني: الافتراضي غير معلّمة والخانات فاضية. لو في بيانات محفوظة بترجع هي والعلامة، غير كده كله فاضي.
    const phoneInput = document.getElementById('loginPhone');
    const passInput = document.getElementById('loginPassword');
    const rememberCheckbox = document.getElementById('rememberMe');
    const savedPhone = localStorage.getItem('saved_phone');
    if (savedPhone) {
        phoneInput.value = savedPhone;
        passInput.value = localStorage.getItem('saved_password') || '';
        rememberCheckbox.checked = true;
    } else {
        phoneInput.value = '';
        passInput.value = '';
        rememberCheckbox.checked = false;
    }
}

// بتتنادى مع كل تغيير في الخانات أو العلامة: معلّمة = احفظ، مش معلّمة = امسح المحفوظ فوراً
function syncRememberedLogin() {
    const phone = document.getElementById('loginPhone')?.value.trim() || '';
    const password = document.getElementById('loginPassword')?.value.trim() || '';
    const remember = document.getElementById('rememberMe')?.checked;
    try {
        if (remember) {
            localStorage.setItem('saved_phone', phone);
            localStorage.setItem('saved_password', password);
        } else {
            localStorage.removeItem('saved_phone');
            localStorage.removeItem('saved_password');
        }
    } catch (e) { /* التخزين غير متاح */ }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const phone = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const rememberMe = document.getElementById('rememberMe')?.checked;

    if (rememberMe) {
        localStorage.setItem('saved_phone', phone);
        localStorage.setItem('saved_password', password);
    } else {
        localStorage.removeItem('saved_phone');
        localStorage.removeItem('saved_password');
    }

    const { data, error } = await supabaseClient.rpc('login', {
        p_phone_number: phone,
        p_password: password
    });

    if (error || !data || !data.id) {
        showSystemAlert("خطأ في تسجيل الدخول", phone || "غير متوفر", "فشل التحقق", error?.message || "بيانات غير صحيحة");
        return;
    }

    currentUserId = data.id;

    try {
        const profileRes = await supabaseClient.rpc('get_personal_profile', {
            p_user_id: currentUserId
        });
        if (profileRes.data && profileRes.data.success !== false) {
            currentUserRole = profileRes.data.user_role || '';
            currentUserName = profileRes.data.user_name || '';
            currentUserPhone = profileRes.data.phone_number || '';
        }
    } catch (err) {
        console.error("Error fetching user header profile:", err);
    }

    try {
        await supabaseClient.rpc('update_last_active_at', {
            target_user_id: currentUserId
        });
    } catch (err) {
        console.error("Instant heartbeat error:", err);
    }

    rememberLogin = !!rememberMe;
    saveSession(true);   // الدخول بيفضل محفوظ (لو "تذكرني" متعلّمة) لحد ما تسجّل خروج
    startHeartbeat();
    renderMainDashboard();
    loadDynamicMenuIntoSidebar();
    if (typeof loadProfilePhoto === 'function') loadProfilePhoto();
}

function loginAsVisitor() {
    currentUserId = null;
    currentUserRole = "";
    currentUserName = "";
    currentUserPhone = "";
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    saveSession(false);
    renderMainDashboard();
    loadDynamicMenuIntoSidebar();
}

// ================= تسجيل الخروج =================
function logoutUser() {
    // اقفل القائمة الجانبية لو مفتوحة
    const sb = document.getElementById('sideMenu');
    if (sb && !sb.classList.contains('translate-x-full')) toggleSidebar();

    // نافذة التأكيد: مفيش خروج غير بعد "تأكيد خروج"
    if (document.getElementById('logoutConfirmModal')) return;
    const m = document.createElement('div');
    m.id = 'logoutConfirmModal';
    m.className = 'modal modal-open';
    m.innerHTML = `
        <div class="modal-box max-w-xs text-center">
            <h3 class="font-bold text-lg mb-5">تأكيد الخروج</h3>
            <div class="flex gap-3 justify-center">
                <button type="button" class="btn btn-primary flex-1" onclick="confirmLogout()">تأكيد خروج</button>
                <button type="button" class="btn btn-outline btn-primary flex-1" onclick="closeLogoutConfirm()">إلغاء</button>
            </div>
        </div>
        <div class="modal-backdrop" onclick="closeLogoutConfirm()"></div>
    `;
    document.body.appendChild(m);
}

function closeLogoutConfirm() {
    const m = document.getElementById('logoutConfirmModal');
    if (m) m.remove();
}

function confirmLogout() {
    closeLogoutConfirm();

    // وقف الهيرت بيت وامسح بيانات الجلسة من الذاكرة
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    currentUserId = null;
    currentUserRole = "";
    currentUserName = "";
    currentUserPhone = "";
    clearSession();
    if (typeof resetProfilePhoto === 'function') resetProfilePhoto();

    renderLoginScreen();
}

// ================= حفظ الجلسة =================
// - المستخدم المسجّل: الدخول بيتحفظ في localStorage ويفضل حتى بعد قفل المتصفح، لحد ما يسجّل خروج.
//   والمدة بتتجدد كل ما يفتح التطبيق (لو ما فتحوش 30 يوم يطلب دخول من جديد).
// - الزائر: sessionStorage بس (ريفرش بس).
// مفيش باسورد بيتحفظ هنا، بس id والدور والاسم والتليفون.
const APP_SESSION_KEY = 'app_session';
let rememberLogin = true;   // false لو المستخدم دخل من غير "تذكرني": الجلسة ما بتتحفظش وأي ريفرش بيطلب دخول من جديد
const APP_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function saveSession(persist) {
    const data = currentUserId
        ? { id: currentUserId, role: currentUserRole, name: currentUserName, phone: currentUserPhone, ts: Date.now() }
        : { visitor: true, ts: Date.now() };
    try {
        localStorage.removeItem(APP_SESSION_KEY);
        sessionStorage.removeItem(APP_SESSION_KEY);
        if (currentUserId && !rememberLogin) return;   // من غير "تذكرني": مفيش حفظ خالص
        (persist && currentUserId ? localStorage : sessionStorage).setItem(APP_SESSION_KEY, JSON.stringify(data));
    } catch (e) { /* التخزين غير متاح */ }
}

function clearSession() {
    try {
        localStorage.removeItem(APP_SESSION_KEY);
        sessionStorage.removeItem(APP_SESSION_KEY);
    } catch (e) { /* مش مشكلة */ }
}

function readSession() {
    for (const store of [localStorage, sessionStorage]) {
        try {
            const s = JSON.parse(store.getItem(APP_SESSION_KEY) || 'null');
            if (s && (!s.ts || Date.now() - s.ts < APP_SESSION_MAX_AGE_MS)) return s;
        } catch (e) { /* نكمل */ }
    }
    return null;
}

// بترجّع true لو لقت جلسة ورجّعت المستخدم للرئيسية
function restoreSession() {
    const s = readSession();
    if (!s) return false;

    if (s.visitor) {
        loginAsVisitor();
        return true;
    }
    if (!s.id) return false;

    currentUserId = s.id;
    currentUserRole = s.role || '';
    currentUserName = s.name || '';
    currentUserPhone = s.phone || '';
    rememberLogin = true;       // الجلسة اتحمّلت من التخزين يعني كانت متذكّرة
    saveSession(true);          // تجديد المدة
    startHeartbeat();
    renderMainDashboard();
    loadDynamicMenuIntoSidebar();
    refreshSessionProfile();    // تحديث الاسم والدور في الخلفية
    if (typeof loadProfilePhoto === 'function') loadProfilePhoto();
    return true;
}

// بيجيب بيانات المستخدم من السيرفر بعد فتح التطبيق، عشان لو الاسم أو الدور اتغيّر يتحدّث من غير تسجيل دخول جديد
async function refreshSessionProfile() {
    if (!currentUserId) return;
    try {
        const res = await supabaseClient.rpc('get_personal_profile', { p_user_id: currentUserId });
        if (!res.data || res.data.success === false) return;
        const role = res.data.user_role || '';
        const name = res.data.user_name || '';
        const phone = res.data.phone_number || '';
        if (role === currentUserRole && name === currentUserName && phone === currentUserPhone) return;
        currentUserRole = role;
        currentUserName = name;
        currentUserPhone = phone;
        saveSession(true);
        if (document.getElementById('partitionsContainer')) renderMainDashboard();   // لسه على الرئيسية: نحدّث الهيدر
    } catch (err) {
        console.error('Session profile refresh error:', err);
    }
}
