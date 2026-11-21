// ================= شاشة الأصدقاء (من الشريط السفلي) =================
// فوق: تقسيمة الدردشات | التحديثات | المكالمات | طلبات الصداقة. تبديل التبويب بيغيّر المحتوى بس من غير ما يعيد رسم الشاشة.

const FRIENDS_TABS = [
    { key: 'chats',    label: 'الدردشات',        empty: 'لا توجد دردشات بعد' },
    { key: 'updates',  label: 'التحديثات',       empty: 'لا توجد تحديثات جديدة' },
    { key: 'calls',    label: 'المكالمات',       empty: 'لا توجد مكالمات' },
    { key: 'requests', label: 'طلبات الصداقة',   empty: 'لا توجد طلبات صداقة' }
];

let friendsActiveTab = 'chats';

function openFriendsScreen() {
    if (!currentUserId) { renderLoginScreen(); return; }   // الزائر: يروح لشاشة الدخول
    renderFriendsScreen();
}

function renderFriendsScreen() {
    document.getElementById('appContainer').innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex items-center mb-3 flex-shrink-0">
            <h2 class="text-sm sm:text-base font-bold text-base-content">الأصدقاء</h2>
        </div>
        <div id="friendsTabs" class="friends-tabs flex-shrink-0" role="tablist"></div>
        <div id="friendsTabContent" class="flex-1 overflow-y-auto p-1 pt-3"></div>
    `;
    renderFriendsTabs();
    renderFriendsTabContent();
}

function setFriendsTab(key) {
    if (key === friendsActiveTab) return;
    friendsActiveTab = key;
    renderFriendsTabs();         // التبويب المختار بيتلوّن فوراً
    renderFriendsTabContent();   // المحتوى بيتبدّل فوراً من غير تدرّج
}

// السحب جوه الأصدقاء (بيناديه nav-motion.js): +1 = التبويب اللي بعده، -1 = اللي قبله.
// بيرجّع false لو وصلنا لأول/آخر تبويب، فالسحب يكمّل للقسم المجاور في الشريط السفلي.
function friendsSwipe(sign) {
    const i = FRIENDS_TABS.findIndex(t => t.key === friendsActiveTab);
    const j = i + sign;
    if (j < 0 || j >= FRIENDS_TABS.length) return false;
    setFriendsTab(FRIENDS_TABS[j].key);
    return true;
}

function renderFriendsTabs() {
    const box = document.getElementById('friendsTabs');
    if (!box) return;
    box.innerHTML = FRIENDS_TABS.map(t => `
        <button type="button" role="tab" aria-selected="${t.key === friendsActiveTab}"
                class="friends-tab${t.key === friendsActiveTab ? ' active' : ''}"
                onclick="setFriendsTab(${jsArg(t.key)})">${escapeHtmlValue(t.label)}</button>
    `).join('');
}

function renderFriendsTabContent() {
    const box = document.getElementById('friendsTabContent');
    if (!box) return;
    const tab = FRIENDS_TABS.find(t => t.key === friendsActiveTab) || FRIENDS_TABS[0];
    // لسه مفيش بيانات حقيقية للتبويبات دي: حالة فاضية لحد ما نربطها بالسيرفر
    box.innerHTML = `<div class="text-center text-base-content/50 text-sm py-12">${escapeHtmlValue(tab.empty)}</div>`;
}
