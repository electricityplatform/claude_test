// ================= نقطة بداية التطبيق =================
window.onload = function() {
    // لو فيه جلسة محفوظة (بعد ريفرش مثلاً) نرجع للرئيسية مباشرة، وإلا نفتح شاشة الدخول
    if (typeof restoreSession === 'function' && restoreSession()) return;
    renderLoginScreen();
};
