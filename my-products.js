// ================= شاشة المنتجات المعروضة للبيع =================
function renderMyProductsScreen() {
    closeSidebar();

    const container = document.getElementById('appContainer');
    container.innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex items-center justify-between mb-4 flex-shrink-0 flex-wrap gap-2">
            <div class="flex items-center gap-2">
                <button type="button" onclick="renderMainDashboard()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    <span>رجوع</span>
                </button>
            </div>
            <h2 class="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2">
                <span class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                المنتجات المعروضة للبيع
            </h2>
        </div>

        <div class="flex-1 flex items-center justify-center p-1">
            <div class="w-full bg-gray-50 border border-gray-200 rounded-3xl shadow-sm px-6 py-14 text-center">
                <h3 class="text-lg sm:text-xl font-bold text-gray-800">أنشئ مركز بيانات منتجاتك</h3>
            </div>
        </div>
    `;

    loadDynamicMenuIntoSidebar();
}
