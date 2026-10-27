// مركز البيانات (3/6) - شيت جدول المستخدمين

// ================= شيت جدول المستخدمين (النمط الشبكي لإكسل) =================
async function renderUsersDataCenterSheet() {
    closeSidebar();

    const container = document.getElementById('appContainer');
    container.innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex items-center justify-between mb-3 flex-shrink-0 flex-wrap gap-2">
            <div class="flex items-center gap-2 flex-wrap">
                <button type="button" onclick="renderDataCenterScreen()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    <span>رجوع لمركز البيانات</span>
                </button>
                <button type="button" onclick="renderUsersDataCenterSheet()" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 border border-blue-200 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>تحديث</span>
                </button>
                <button type="button" onclick="addUsersSheetRow(true)" class="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>إضافة صف</span>
                </button>
                <button type="button" onclick="saveUsersDataCenterSheetToDB()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                    <span>حفظ التعديلات لقاعدة البيانات</span>
                </button>
                <button type="button" id="keyPinBtn" onclick="toggleKeyColumnPin()" class="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    <span id="keyPinLabel">تثبيت العمود المميز</span>
                </button>
                <button type="button" onclick="exportUsersSheetToExcel()" class="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>تصدير إلى إكسل</span>
                </button>
            </div>
            <h2 class="text-sm sm:text-base font-bold text-gray-800">شيت جدول المستخدمين (النمط الشبكي لإكسل)</h2>
        </div>

        <div id="usersSheetContainer" class="flex-1 overflow-y-auto p-1 border border-slate-300 rounded-xl bg-white shadow-inner">
            <div class="text-center text-gray-400 text-sm py-8">جاري جلب بيانات المستخدمين كشيت...</div>
        </div>
    `;

    loadDynamicMenuIntoSidebar();
    await loadUsersDataIntoSheetGrid();
}

async function loadUsersDataIntoSheetGrid() {
    const sheetContainer = document.getElementById('usersSheetContainer');
    if (!sheetContainer) return;

    try {
        const { data, error } = await supabaseClient.rpc('get_users_for_data_center', {
            p_user_id: currentUserId
        });

        if (error) {
            sheetContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">خطأ في جلب البيانات: ${error.message}</div>`;
            return;
        }

        let usersList = [];
        if (Array.isArray(data)) {
            usersList = data;
        } else if (typeof data === 'string') {
            try { usersList = JSON.parse(data); } catch(e){}
        }

        {
            // لو الجدول فاضي مفيش صف نستخرج منه الأعمدة، فنستخدم الأعمدة الافتراضية
            const columns = usersList.length > 0 ? Object.keys(usersList[0]) : USERS_SHEET_DEFAULT_COLUMNS.slice();

            sheetContainer.innerHTML = `
                <table id="editableUsersTable">
                    <thead>
                        <tr>
                            ${columns.map(col => sheetThHtml(col, usersColLabel(col))).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${usersList.map((user, idx) => `
                            <tr data-id="${user.id}">
                                ${columns.map(col => {
                                    const val = user[col] !== null && user[col] !== undefined ? user[col] : '';
                                    const isId = USERS_SHEET_READONLY_COLS.includes(col);
                                    if (isId) {
                                        return sheetReadonlyCellHtml(val);
                                    }
                                    return `
                                        <td class="relative">
                                            ${sheetCellInputHtml(col, val)}
                                            <div class="drag-handle" title="اسحب للتعبئة التلقائية"></div>
                                        </td>
                                    `;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            currentUsersSheetColumns = columns;
            const usersTable = document.getElementById('editableUsersTable');
            usersTable.addRowFn = addUsersSheetRow;
            // تثبيت عمودي الرتبة والاسم على الجنب
            applyKeyPinState(usersTable, 'user_role,user_name');
            usersTable.dataset.showNum = '1'; // عمود الترقيم (num) لجدول المستخدمين بس
            enableExcelPasteAndDragFill();
            if (usersList.length === 0) addUsersSheetRow(false);
        }
    } catch (err) {
        console.error(err);
        sheetContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">حدث خطأ غير متوقع</div>`;
    }
}

// ================= تصدير الشيت إلى XLSX =================
function exportUsersSheetToExcel() {
    const table = document.getElementById('editableUsersTable');
    if (!table) {
        alert("لا توجد بيانات للتصدير حالياً");
        return;
    }

    // 1. عناوين الأعمدة (بأسماء الأعمدة الحقيقية بدون الترجمة العربية)
    const headers = Array.from(table.querySelectorAll('thead th:not(.sheet-num)')).map(th => th.getAttribute('data-col') || th.innerText.trim());

    // 2. بيانات الصفوف من الـ Inputs الحالية
    const rowsData = [];
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        if (!row.hasAttribute('data-id') && !Array.from(row.querySelectorAll('.excel-input')).some(i => i.value.trim() !== '')) return;
        const rowData = [];
        const cells = row.querySelectorAll('td:not(.sheet-num)');

        cells.forEach(td => {
            const input = td.querySelector('.excel-input');
            const val = input ? input.value : td.innerText.trim();
            rowData.push(val);
        });

        rowsData.push(rowData);
    });

    // 3. تجميع البيانات
    const excelData = [headers, ...rowsData];

    // 4. إنشاء الملف
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "جدول المستخدمين");

    // 5. التحميل
    const fileName = `Users_Sheet_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

// ================= حفظ الشيت في قاعدة البيانات =================
async function saveUsersDataCenterSheetToDB() {
    const table = document.getElementById('editableUsersTable');
    if (!table) return;

    const updatePayload = [];
    const insertPayload = [];

    table.querySelectorAll('tbody tr').forEach(row => {
        const inputs = row.querySelectorAll('[data-field]');

        if (row.hasAttribute('data-id')) {
            const rowData = { id: row.getAttribute('data-id') };
            inputs.forEach(input => {
                const rawVal = input.value.trim();
                rowData[input.getAttribute('data-field')] = rawVal !== '' ? rawVal : null;
            });
            updatePayload.push(rowData);
        } else {
            const rowData = {};
            let hasValue = false;
            inputs.forEach(input => {
                const rawVal = input.value.trim();
                if (rawVal !== '') {
                    rowData[input.getAttribute('data-field')] = rawVal;
                    hasValue = true;
                }
            });
            if (hasValue) insertPayload.push(rowData);
        }
    });

    if (updatePayload.length === 0 && insertPayload.length === 0) {
        alert("لا توجد بيانات للحفظ");
        return;
    }

    const messages = [];

    try {
        if (updatePayload.length > 0) {
            const { data, error } = await supabaseClient.rpc('update_users_for_data_center', {
                p_user_id: currentUserId,
                p_payload: updatePayload
            });
            if (error) {
                alert("حدث خطأ أثناء حفظ التعديلات: " + error.message);
                return;
            }
            if (!data || !data.success) {
                alert(data?.message || "فشل حفظ التعديلات");
                return;
            }
            messages.push(data.message || "تم حفظ التعديلات بنجاح!");
        }

        if (insertPayload.length > 0) {
            const { data, error } = await supabaseClient.rpc('insert_users_for_data_center', {
                p_user_id: currentUserId,
                p_payload: insertPayload
            });
            if (error) {
                alert((messages.length ? messages.join('\n') + '\n\n' : '') + "حدث خطأ أثناء إضافة المستخدمين الجدد: " + error.message);
                return;
            }
            if (!data || !data.success) {
                alert((messages.length ? messages.join('\n') + '\n\n' : '') + (data?.message || "فشلت إضافة المستخدمين الجدد"));
                return;
            }
            messages.push(data.message || "تمت إضافة المستخدمين الجدد");
        }

        alert(messages.join('\n'));
        await loadUsersDataIntoSheetGrid();
    } catch (err) {
        console.error("Save users sheet error:", err);
        alert("حدث خطأ غير متوقع أثناء الحفظ");
    }
}
let currentUsersSheetColumns = [];
const USERS_SHEET_READONLY_COLS = ['id', 'created_at', 'last_active_at', 'seller_data_center_created'];
// أعمدة افتراضية لشيت المستخدمين لما الجدول يكون فاضي (راجعها وعدّلها لو أعمدة جدول users عندك مختلفة)
const USERS_SHEET_DEFAULT_COLUMNS = [
    'id', 'created_at', 'last_active_at', 'user_role', 'user_name',
    'store_name', 'store_city', 'store_region', 'store_area', 'store_address',
    'shop_name', 'shop_city', 'shop_region', 'shop_area', 'shop_address',
    'delivery_city', 'delivery_region', 'delivery_area',
    'phone_number', 'whatsapp_number', 'gmail', 'password'
];

// ---------- التسميات العربية لأعمدة المستخدمين ----------
const USERS_COL_LABELS = {
    user_role: 'الرتبة',
    user_name: 'الاسم',
    store_name: 'اسم المتجر',
    store_city: 'محافظة المتجر',
    store_region: 'منطقة المتجر',
    store_area: 'نطاق المتجر',
    store_address: 'عنوان المتجر',
    shop_name: 'اسم المحل',
    shop_city: 'محافظة المحل',
    shop_region: 'منطقة المحل',
    shop_area: 'نطاق المحل',
    shop_address: 'عنوان المحل',
    delivery_city: 'محافظة التوصيل',
    delivery_region: 'منطقة التوصيل',
    delivery_area: 'نطاق التوصيل',
    phone_number: 'رقم الهاتف',
    whatsapp_number: 'رقم الواتساب',
    gmail: 'البريد الإلكترونى',
    password: 'رمز المرور',
    last_active_at: 'آخر ظهور',
    created_at: 'تاريخ الإنشاء',
    seller_data_center_created: 'حالة إنشاء مركز بيانات التاجر'
};
function usersColLabel(col) { return USERS_COL_LABELS[col] || ''; }

function addUsersSheetRow(focus = true) {
    return appendBlankSheetRow(currentUsersSheetColumns, USERS_SHEET_READONLY_COLS, focus);
}

// ================= جدول المستخدمين النشطين (مركز البيانات) =================
async function renderActiveUsersScreen() {
    closeSidebar();

    const container = document.getElementById('appContainer');
    container.innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex items-center justify-between mb-4 flex-shrink-0">
            <div class="flex items-center gap-2">
                <button type="button" onclick="renderDataCenterScreen()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    <span>رجوع</span>
                </button>
                <button type="button" onclick="fetchAndDisplayActiveUsers();" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 border border-blue-200 cursor-pointer" title="تحديث البيانات">
                    <svg class="w-4 h-4 transform transition-transform hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>تحديث</span>
                </button>
            </div>
            <h2 id="activeUsersTitle" class="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2">
                <span class="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                المستخدمون النشطون
            </h2>
        </div>
        <div id="activeUsersTableContainer" class="flex-1 overflow-y-auto p-1">
            <div class="text-center text-gray-400 text-sm py-8">جاري جلب المستخدمين النشطين...</div>
        </div>
    `;

    loadDynamicMenuIntoSidebar();
    await fetchAndDisplayActiveUsers();
}

async function fetchAndDisplayActiveUsers() {
    const tableContainer = document.getElementById('activeUsersTableContainer');
    const titleElement = document.getElementById('activeUsersTitle');

    if (tableContainer) {
        tableContainer.innerHTML = `<div class="text-center text-gray-400 text-sm py-8">جاري تحديث البيانات...</div>`;
    }

    try {
        const { data, error } = await supabaseClient.rpc('get_active_users', {
            p_user_id: currentUserId
        });

        if (error) {
            showSystemAlert("خطأ في جلب النشطين", currentUserId || "غير معروف", "get_active_users", error.message);
            if (tableContainer) tableContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">تعذر جلب البيانات</div>`;
            return;
        }

        let activeUsers = [];
        if (Array.isArray(data)) {
            activeUsers = data;
        } else if (typeof data === 'string') {
            try { activeUsers = JSON.parse(data); } catch(e){}
        }

        if (titleElement) {
            titleElement.innerHTML = `
                <span class="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                المستخدمون النشطون (${activeUsers.length})
            `;
        }

        let contentHtml = "";
        {
            contentHtml = `
                <div class="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                    <table class="w-full text-right text-xs sm:text-sm whitespace-nowrap">
                        <thead class="bg-gray-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th class="p-3.5 font-bold">الرتبة</th>
                                <th class="p-3.5 font-bold">الاسم</th>
                                <th class="p-3.5 font-bold">اسم المتجر</th>
                                <th class="p-3.5 font-bold">محافظة المتجر</th>
                                <th class="p-3.5 font-bold">منطقة المتجر</th>
                                <th class="p-3.5 font-bold">نطاق المتجر</th>
                                <th class="p-3.5 font-bold">عنوان المتجر</th>
                                <th class="p-3.5 font-bold">اسم المحل</th>
                                <th class="p-3.5 font-bold">محافظة المحل</th>
                                <th class="p-3.5 font-bold">منطقة المحل</th>
                                <th class="p-3.5 font-bold">نطاق المحل</th>
                                <th class="p-3.5 font-bold">عنوان المحل</th>
                                <th class="p-3.5 font-bold">محافظة التوصيل</th>
                                <th class="p-3.5 font-bold">منطقة التوصيل</th>
                                <th class="p-3.5 font-bold">نطاق التوصيل</th>
                                <th class="p-3.5 font-bold">رقم الهاتف</th>
                                <th class="p-3.5 font-bold">رقم الواتساب</th>
                                <th class="p-3.5 font-bold">البريد الإلكترونى</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 bg-white">
                            ${activeUsers.length === 0 ? emptyTableRowHtml(18, 'لا يوجد مستخدمون نشطون في آخر 21 ثانية') : activeUsers.map(user => `
                                <tr class="hover:bg-blue-50/50 transition-all">
                                    <td class="p-3.5 font-bold text-blue-600" dir="auto">${escapeHtmlValue(user.user_role || '---')}</td>
                                    <td class="p-3.5 font-semibold text-gray-800" dir="auto">${escapeHtmlValue(user.user_name || '---')}</td>
                                    <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.store_name || '---')}</td>
                                    <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.store_city || '---')}</td>
                                    <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.store_region || '---')}</td>
                                    <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.store_area || '---')}</td>
                                    <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.store_address || '---')}</td>
                                    <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.shop_name || '---')}</td>
                                    <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.shop_city || '---')}</td>
                                    <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.shop_region || '---')}</td>
                                    <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.shop_area || '---')}</td>
                                    <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.shop_address || '---')}</td>
                                    <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.delivery_city || '---')}</td>
                                    <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.delivery_region || '---')}</td>
                                    <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.delivery_area || '---')}</td>
                                    <td class="p-3.5 font-mono text-gray-600" dir="ltr">${escapeHtmlValue(user.phone_number || '---')}</td>
                                    <td class="p-3.5 font-mono text-gray-600" dir="ltr">${escapeHtmlValue(user.whatsapp_number || '---')}</td>
                                    <td class="p-3.5 font-mono text-gray-600" dir="ltr">${escapeHtmlValue(user.gmail || '---')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        if (tableContainer) {
            tableContainer.innerHTML = contentHtml;
        }
    } catch (err) {
        console.error("Error fetching active users:", err);
    }
}

// ================= جدول سجل دخول المستخدمين (مركز البيانات) =================
async function renderLoginHistoryScreen() {
    closeSidebar();

    const container = document.getElementById('appContainer');
    container.innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex items-center justify-between mb-4 flex-shrink-0 flex-wrap gap-2">
            <div class="flex items-center gap-2">
                <button type="button" onclick="renderDataCenterScreen()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1 cursor-pointer">
                    <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    <span>رجوع</span>
                </button>
                <button type="button" onclick="fetchAndDisplayLoginHistory();" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1 border border-blue-200 cursor-pointer" title="تحديث البيانات">
                    <svg class="w-4 h-4 transform transition-transform hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>تحديث</span>
                </button>
                <button type="button" onclick="handleDeleteLoginHistory();" class="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1 border border-red-200 cursor-pointer" title="حذف السجل">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    <span>حذف السجل</span>
                </button>
            </div>
            <h2 id="loginHistoryTitle" class="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2">
                <span class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                سجل دخول المستخدمين
            </h2>
        </div>
        <div id="loginHistoryTableContainer" class="flex-1 overflow-y-auto p-1">
            <div class="text-center text-gray-400 text-sm py-8">جاري جلب سجل الدخول...</div>
        </div>
    `;

    loadDynamicMenuIntoSidebar();
    await fetchAndDisplayLoginHistory();
}

async function handleDeleteLoginHistory() {
    if (!confirm("هل أنت متأكد من رغبتك في تفريغ سجل دخول المستخدمين بالكامل؟")) {
        return;
    }

    try {
        const { data, error } = await supabaseClient.rpc('delete_login_history', {
            p_user_id: currentUserId
        });

        if (error) {
            alert("حدث خطأ أثناء الاتصال بقاعدة البيانات: " + error.message);
            return;
        }

        if (data && data.success) {
            alert(data.message || "تم تفريغ السجل بنجاح");
            await fetchAndDisplayLoginHistory();
        } else {
            alert(data?.message || "عفواً، لا يمكنك تنفيذ هذا الإجراء");
        }
    } catch (err) {
        console.error("Delete login history error:", err);
        alert("حدث خطأ غير متوقع أثناء الحذف");
    }
}

async function fetchAndDisplayLoginHistory() {
    const tableContainer = document.getElementById('loginHistoryTableContainer');
    const titleElement = document.getElementById('loginHistoryTitle');

    if (tableContainer) {
        tableContainer.innerHTML = `<div class="text-center text-gray-400 text-sm py-8">جاري تحديث البيانات...</div>`;
    }

    try {
        const { data, error } = await supabaseClient.rpc('get_login_history', {
            p_user_id: currentUserId
        });

        if (error) {
            showSystemAlert("خطأ في جلب سجل الدخول", currentUserId || "غير معروف", "get_login_history", error.message);
            if (tableContainer) tableContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">تعذر جلب البيانات</div>`;
            return;
        }

        let historyList = [];
        if (Array.isArray(data)) {
            historyList = data;
        } else if (typeof data === 'string') {
            try { historyList = JSON.parse(data); } catch(e){}
        }

        if (titleElement) {
            titleElement.innerHTML = `
                <span class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                سجل دخول المستخدمين (${historyList.length})
            `;
        }

        let contentHtml = "";
        {
            contentHtml = `
                <div class="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                    <table class="w-full text-right text-xs sm:text-sm whitespace-nowrap">
                        <thead class="bg-gray-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th class="p-3.5 font-bold whitespace-nowrap min-w-[130px]">آخر دخول</th>
                                <th class="p-3.5 font-bold">الرتبة</th>
                                <th class="p-3.5 font-bold">الاسم</th>
                                <th class="p-3.5 font-bold">اسم المتجر</th>
                                <th class="p-3.5 font-bold">محافظة المتجر</th>
                                <th class="p-3.5 font-bold">منطقة المتجر</th>
                                <th class="p-3.5 font-bold">نطاق المتجر</th>
                                <th class="p-3.5 font-bold">عنوان المتجر</th>
                                <th class="p-3.5 font-bold">اسم المحل</th>
                                <th class="p-3.5 font-bold">محافظة المحل</th>
                                <th class="p-3.5 font-bold">منطقة المحل</th>
                                <th class="p-3.5 font-bold">نطاق المحل</th>
                                <th class="p-3.5 font-bold">عنوان المحل</th>
                                <th class="p-3.5 font-bold">محافظة التوصيل</th>
                                <th class="p-3.5 font-bold">منطقة التوصيل</th>
                                <th class="p-3.5 font-bold">نطاق التوصيل</th>
                                <th class="p-3.5 font-bold">رقم الهاتف</th>
                                <th class="p-3.5 font-bold">رقم الواتساب</th>
                                <th class="p-3.5 font-bold">البريد الإلكترونى</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 bg-white">
                            ${historyList.length === 0 ? emptyTableRowHtml(19, 'لا توجد سجلات دخول متاحة حالياً') : historyList.map(item => {
                                let rawTime = item.login_times || '';
                                let datePart = '---';
                                let timePart = '';

                                if (rawTime && rawTime.includes('T')) {
                                    const parts = rawTime.split('T');
                                    datePart = parts[0];
                                    timePart = parts[1] ? parts[1].split('.')[0] : '';
                                } else if (rawTime && rawTime.includes(' ')) {
                                    const parts = rawTime.split(' ');
                                    datePart = parts[0];
                                    timePart = parts[1] || '';
                                } else {
                                    datePart = rawTime || '---';
                                }

                                return `
                                    <tr class="hover:bg-blue-50/50 transition-all">
                                        <td class="p-3.5 font-mono text-gray-700 leading-tight min-w-[130px]" dir="ltr">
                                            <div class="font-bold text-gray-800">${escapeHtmlValue(datePart)}</div>${timePart ? `<div class="text-[11px] text-gray-500 mt-0.5">${escapeHtmlValue(timePart)}</div>` : ''}
                                        </td>
                                        <td class="p-3.5">
                                            <span class="px-2.5 py-1 rounded-full text-xs font-bold ${
                                                (item.user_role === 'admin' || item.user_role === 'أدمن') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                            }" dir="auto">
                                                ${escapeHtmlValue(item.user_role || 'مستخدم')}
                                            </span>
                                        </td>
                                        <td class="p-3.5 font-semibold text-gray-800" dir="auto">${escapeHtmlValue(item.user_name || '---')}</td>
                                        <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(item.store_name || '---')}</td>
                                        <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(item.store_city || '---')}</td>
                                        <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(item.store_region || '---')}</td>
                                        <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(item.store_area || '---')}</td>
                                        <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(item.store_address || '---')}</td>
                                        <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(item.shop_name || '---')}</td>
                                        <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(item.shop_city || '---')}</td>
                                        <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(item.shop_region || '---')}</td>
                                        <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(item.shop_area || '---')}</td>
                                        <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(item.shop_address || '---')}</td>
                                        <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(item.delivery_city || '---')}</td>
                                        <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(item.delivery_region || '---')}</td>
                                        <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(item.delivery_area || '---')}</td>
                                        <td class="p-3.5 font-mono text-gray-600" dir="ltr">${escapeHtmlValue(item.phone_number || '---')}</td>
                                        <td class="p-3.5 font-mono text-gray-600" dir="ltr">${escapeHtmlValue(item.whatsapp_number || '---')}</td>
                                        <td class="p-3.5 font-mono text-gray-600" dir="ltr">${escapeHtmlValue(item.gmail || '---')}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        if (tableContainer) {
            tableContainer.innerHTML = contentHtml;
        }
    } catch (err) {
        console.error("Error fetching login history:", err);
    }
}

// ================= جدول المستخدمين الجدد (مركز البيانات - آخر 24 ساعة) =================
async function renderNewUsersScreen() {
    closeSidebar();

    const container = document.getElementById('appContainer');
    container.innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex items-center justify-between mb-4 flex-shrink-0 flex-wrap gap-2">
            <div class="flex items-center gap-2">
                <button type="button" onclick="renderDataCenterScreen()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    <span>رجوع</span>
                </button>
                <button type="button" onclick="fetchAndDisplayNewUsers();" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 border border-blue-200 cursor-pointer" title="تحديث البيانات">
                    <svg class="w-4 h-4 transform transition-transform hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>تحديث</span>
                </button>
            </div>
            <h2 id="newUsersTitle" class="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2">
                <span class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                المستخدمون الجدد (آخر ٢٤ ساعة)
            </h2>
        </div>

        <div id="newUsersTableContainer" class="flex-1 overflow-y-auto p-1">
            <div class="text-center text-gray-400 text-sm py-8">جاري جلب المستخدمين الجدد...</div>
        </div>
    `;

    loadDynamicMenuIntoSidebar();
    await fetchAndDisplayNewUsers();
}

async function fetchAndDisplayNewUsers() {
    const tableContainer = document.getElementById('newUsersTableContainer');
    const titleElement = document.getElementById('newUsersTitle');

    if (tableContainer) {
        tableContainer.innerHTML = `<div class="text-center text-gray-400 text-sm py-8">جاري تحديث البيانات...</div>`;
    }

    try {
        const { data, error } = await supabaseClient.rpc('get_new_users_last_24h', {
            p_user_id: currentUserId
        });

        if (error) {
            if (tableContainer) tableContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">خطأ في جلب البيانات: ${error.message}</div>`;
            return;
        }

        if (data && data.success === false) {
            if (tableContainer) tableContainer.innerHTML = `<div class="text-center text-red-500 text-sm py-8 font-semibold">${data.message || 'عفواً، لا تملك الصلاحية'}</div>`;
            return;
        }

        let newUsersList = [];
        if (Array.isArray(data)) {
            newUsersList = data;
        } else if (typeof data === 'string') {
            try { newUsersList = JSON.parse(data); } catch(e){}
        }

        if (titleElement) {
            titleElement.innerHTML = `
                <span class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                المستخدمون الجدد (آخر ٢٤ ساعة) (${newUsersList.length})
            `;
        }

        {
            if (tableContainer) {
                tableContainer.innerHTML = `
                    <div class="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                        <table class="w-full text-right text-xs sm:text-sm whitespace-nowrap">
                            <thead class="bg-gray-50 text-gray-700 border-b border-gray-200">
                                <tr>
                                    <th class="p-3.5 font-bold whitespace-nowrap min-w-[130px]">تاريخ الإنشاء</th>
                                    <th class="p-3.5 font-bold">الرتبة</th>
                                    <th class="p-3.5 font-bold">الاسم</th>
                                    <th class="p-3.5 font-bold">اسم المتجر</th>
                                    <th class="p-3.5 font-bold">محافظة المتجر</th>
                                    <th class="p-3.5 font-bold">منطقة المتجر</th>
                                    <th class="p-3.5 font-bold">نطاق المتجر</th>
                                    <th class="p-3.5 font-bold">عنوان المتجر</th>
                                    <th class="p-3.5 font-bold">اسم المحل</th>
                                    <th class="p-3.5 font-bold">محافظة المحل</th>
                                    <th class="p-3.5 font-bold">منطقة المحل</th>
                                    <th class="p-3.5 font-bold">نطاق المحل</th>
                                    <th class="p-3.5 font-bold">عنوان المحل</th>
                                    <th class="p-3.5 font-bold">محافظة التوصيل</th>
                                    <th class="p-3.5 font-bold">منطقة التوصيل</th>
                                    <th class="p-3.5 font-bold">نطاق التوصيل</th>
                                    <th class="p-3.5 font-bold">رقم الهاتف</th>
                                    <th class="p-3.5 font-bold">رقم الواتساب</th>
                                    <th class="p-3.5 font-bold">البريد الإلكترونى</th>
                                    <th class="p-3.5 font-bold">رمز المرور</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 bg-white">
                                ${newUsersList.length === 0 ? emptyTableRowHtml(20, 'لا توجد حسابات مسجلة في آخر ٢٤ ساعة') : newUsersList.map(user => {
                                    let rawTime = user.created_at || '';
                                    let datePart = '---';
                                    let timePart = '';

                                    if (rawTime && rawTime.includes('T')) {
                                        const parts = rawTime.split('T');
                                        datePart = parts[0];
                                        timePart = parts[1] ? parts[1].split('.')[0] : '';
                                    } else if (rawTime && rawTime.includes(' ')) {
                                        const parts = rawTime.split(' ');
                                        datePart = parts[0];
                                        timePart = parts[1] || '';
                                    } else {
                                        datePart = rawTime || '---';
                                    }

                                    return `
                                        <tr class="hover:bg-blue-50/50 transition-all">
                                            <td class="p-3.5 font-mono text-gray-700 leading-tight min-w-[130px]" dir="ltr">
                                                <div class="font-bold text-gray-800">${escapeHtmlValue(datePart)}</div>${timePart ? `<div class="text-[11px] text-gray-500 mt-0.5">${escapeHtmlValue(timePart)}</div>` : ''}
                                            </td>
                                            <td class="p-3.5 font-bold text-blue-600" dir="auto">${escapeHtmlValue(user.user_role || '---')}</td>
                                            <td class="p-3.5 font-semibold text-gray-800" dir="auto">${escapeHtmlValue(user.user_name || '---')}</td>
                                            <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.store_name || '---')}</td>
                                            <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.store_city || '---')}</td>
                                            <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.store_region || '---')}</td>
                                            <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.store_area || '---')}</td>
                                            <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.store_address || '---')}</td>
                                            <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.shop_name || '---')}</td>
                                            <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.shop_city || '---')}</td>
                                            <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.shop_region || '---')}</td>
                                            <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.shop_area || '---')}</td>
                                            <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.shop_address || '---')}</td>
                                            <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.delivery_city || '---')}</td>
                                            <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.delivery_region || '---')}</td>
                                            <td class="p-3.5 text-gray-700" dir="auto">${escapeHtmlValue(user.delivery_area || '---')}</td>
                                            <td class="p-3.5 font-mono text-gray-600" dir="ltr">${escapeHtmlValue(user.phone_number || '---')}</td>
                                            <td class="p-3.5 font-mono text-gray-600" dir="ltr">${escapeHtmlValue(user.whatsapp_number || '---')}</td>
                                            <td class="p-3.5 font-mono text-gray-600" dir="ltr">${escapeHtmlValue(user.gmail || '---')}</td>
                                            <td class="p-3.5 font-mono text-gray-600" dir="ltr">${escapeHtmlValue(user.password || '---')}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }

    } catch (err) {
        console.error(err);
        if (tableContainer) tableContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">حدث خطأ غير متوقع</div>`;
    }
}
