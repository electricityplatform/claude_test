// ================= شاشة مركز البيانات =================
async function renderDataCenterScreen() {
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
                <button type="button" onclick="fetchAndDisplayDataCenterMenu();" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 border border-blue-200 cursor-pointer" title="تحديث البيانات">
                    <svg class="w-4 h-4 transform transition-transform hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>تحديث</span>
                </button>
            </div>
            <h2 class="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2">
                <span class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                مركز البيانات
            </h2>
        </div>

        <div id="dataCenterContainer" class="flex-1 overflow-y-auto space-y-3 p-1">
            <div class="text-center text-gray-400 text-sm py-8">جاري جلب عناصر مركز البيانات...</div>
        </div>
    `;

    loadDynamicMenuIntoSidebar();
    await fetchAndDisplayDataCenterMenu();
}

async function fetchAndDisplayDataCenterMenu() {
    const dataCenterContainer = document.getElementById('dataCenterContainer');
    if (!dataCenterContainer) return;

    dataCenterContainer.innerHTML = `<div class="text-center text-gray-400 text-sm py-8">جاري التحديث...</div>`;

    try {
        const { data, error } = await supabaseClient.rpc('get_data_center_menu', {
            p_user_id: currentUserId
        });

        if (error) {
            dataCenterContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">خطأ في جلب البيانات: ${error.message}</div>`;
            return;
        }

        let itemsList = [];
        if (Array.isArray(data)) {
            itemsList = data;
        } else if (typeof data === 'string') {
            try { itemsList = JSON.parse(data); } catch(e){}
        }

        if (itemsList.length > 0) {
            dataCenterContainer.innerHTML = itemsList.map((item, index) => {
                const style = getRotatingCardStyle(index);
                let clickAction = `alert('تم النقر على قسم: ${item}')`;

                if (item.includes('جدول المستخدمين') || item.includes('بيانات المستخدمين')) {
                    clickAction = "renderUsersDataCenterSheet()";
                } else if (item.includes('مجموعات التوافقات')) {
                    clickAction = "renderCompatGroupsBrandsScreen()";
                } else if (item.includes('جداول التوافقات')) {
                    clickAction = "renderCompatBrandsScreen()";
                } else if (item.includes('جداول الموديلات') || item.includes('الموديلات')) {
                    clickAction = "renderDataCenterBrandsScreen()";
                }

                return `
                    <div onclick="${clickAction}" class="w-full ${style.bg} border ${style.border} p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all text-sm sm:text-base group">
                        <span class="font-bold text-gray-800" dir="auto">${item}</span>
                        <svg class="w-5 h-5 ${style.icon} flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    </div>
                `;
            }).join('');
        } else {
            dataCenterContainer.innerHTML = `<div class="text-center text-gray-500 py-12 bg-gray-50 rounded-2xl border border-gray-200"><p class="font-semibold">لا توجد عناصر متاحة أو ليس لديك صلاحية العرض</p></div>`;
        }

    } catch (err) {
        console.error(err);
        dataCenterContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">حدث خطأ غير متوقع</div>`;
    }
}

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
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.getAttribute('data-col') || th.innerText.trim());

    // 2. بيانات الصفوف من الـ Inputs الحالية
    const rowsData = [];
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        if (!row.hasAttribute('data-id') && !Array.from(row.querySelectorAll('.excel-input')).some(i => i.value.trim() !== '')) return;
        const rowData = [];
        const cells = row.querySelectorAll('td');

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

// ================= خلية الشيت (textarea بشكل سطر واحد) =================
// نستخدم textarea بدل input لأن input يمسح الأسطر الجديدة عند اللصق (خصوصاً من كيبورد الموبايل)،
// وبالتالي كانت كل القيم تتجمع في خلية واحدة. مع textarea نقدر نقسّم النص على الخلايا.
function sheetCellInputHtml(col, val) {
    const v = escapeHtmlValue(val);
    return `<div class="sheet-cell" data-value="${v}"><textarea rows="1" wrap="off" spellcheck="false" data-field="${escapeHtmlValue(col)}" class="excel-input" dir="auto">${v}</textarea></div>`;
}

// تحديث مقاس الخلية بعد أي تغيير في قيمتها (كتابة / لصق / سحب للتعبئة)
function sheetFitCell(input) {
    const wrap = input && input.closest ? input.closest('.sheet-cell') : null;
    if (wrap) wrap.setAttribute('data-value', input.value);
}
function sheetFitAll(root) {
    (root || document).querySelectorAll('.sheet-cell > .excel-input').forEach(sheetFitCell);
}

// خلية القراءة فقط (id / created_at ...) بنفس مقاس المحتوى
function sheetReadonlyCellHtml(val, center = false, muted = false) {
    return `<td class="relative"><span class="block px-2.5 py-2 font-mono ${muted ? 'text-slate-400' : 'text-slate-500'} text-xs whitespace-nowrap ${center ? 'text-center' : ''}" dir="ltr">${escapeHtmlValue(val)}</span></td>`;
}

// عمود id مكرر في آخر الجدول (للموديلات والتوافقات والمجموعات فقط، مش المستخدمين).
// بيتحط عليه كلاس sheet-id-dup عشان ما يتصدّرش لإكسل ولا يتحفظ.
function sheetIdDupThHtml() {
    return '<th class="sheet-id-dup"><div>id</div></th>';
}
function sheetIdDupCellHtml(val, center = false) {
    return `<td class="relative sheet-id-dup"><span class="block px-2.5 py-2 font-mono text-slate-500 text-xs whitespace-nowrap ${center ? 'text-center' : ''}" dir="ltr">${escapeHtmlValue(val)}</span></td>`;
}

// ================= توزيع نص منسوخ (صفوف وأعمدة) على خلايا الشيت =================
// كل سطر = صف جديد، وكل Tab = عمود جديد، بدءاً من الخلية الواقف عليها.
function distributePastedText(table, startInput, pastedData) {
    const rowsData = pastedData.split(/\r\n|\n|\r/);
    // إكسل يضيف سطراً فارغاً في النهاية
    while (rowsData.length > 1 && rowsData[rowsData.length - 1] === '') rowsData.pop();
    if (rowsData.length === 0) return;

    const currentRow = startInput.closest('tr');
    const currentCell = startInput.closest('td');
    const allRows = Array.from(table.querySelectorAll('tbody tr'));
    const startRowIndex = allRows.indexOf(currentRow);
    const startCellIndex = Array.from(currentRow.querySelectorAll('td')).indexOf(currentCell);

    rowsData.forEach((rowText, rIdx) => {
        let targetRow = allRows[startRowIndex + rIdx];
        if (!targetRow && typeof table.addRowFn === 'function') {
            targetRow = table.addRowFn(false);
            allRows.push(targetRow);
        }
        if (!targetRow) return;

        const targetCells = Array.from(targetRow.querySelectorAll('td'));
        rowText.split('\t').forEach((cellText, cIdx) => {
            const targetCell = targetCells[startCellIndex + cIdx];
            if (!targetCell) return;

            const targetInput = targetCell.querySelector('.excel-input');
            if (targetInput) {
                targetInput.value = cellText.trim();
                sheetFitCell(targetInput);
            }
        });
    });
}

// ================= عناوين الأعمدة (إنجليزي فوق وعربي تحت) =================
function sheetThHtml(col, ar, extra = '') {
    return `<th data-col="${escapeHtmlValue(col)}"${extra}>
        <div>${escapeHtmlValue(col)}</div>
        ${ar ? `<div class="text-[11px] font-semibold text-gray-500 mt-0.5">${escapeHtmlValue(ar)}</div>` : ''}
    </th>`;
}

// ================= تثبيت أعمدة على الجنب =================
// أسماء الأعمدة المطلوب تثبيتها في table.dataset.pinCols مفصولة بفاصلة (بالترتيب من الجنب).
// الإزاحة بتتحسب من عرض الأعمدة المثبتة قبلها. الـ style بيتحط inline لأن كلاس relative على الـ td كان هيلغي sticky.
// لون الخلفية بيتجاب من الثيم الحالي (فاتح أو غامق) عشان الأعمدة اللي بتمر تحتها ما تظهرش من ورا.
function sheetResolveBg(el) {
    while (el) {
        const c = getComputedStyle(el).backgroundColor;
        if (c && c !== 'transparent' && !/^rgba\(.*,\s*0\)$/.test(c)) return c;
        el = el.parentElement;
    }
    return '#ffffff';
}

function refreshPinnedColumns(table) {
    const pins = (table.dataset.pinCols || '').split(',').filter(Boolean);
    if (!pins.length) return;

    const ths = Array.from(table.querySelectorAll('thead th'));
    const rows = Array.from(table.querySelectorAll('tbody tr'));

    // نمسح الألوان المثبتة قبل كده عشان نقرا لون الثيم الحقيقي
    pins.forEach(col => {
        const idx = ths.findIndex(th => th.getAttribute('data-col') === col);
        if (idx < 0) return;
        ths[idx].style.background = '';
        rows.forEach(tr => { if (tr.children[idx]) tr.children[idx].style.background = ''; });
    });

    let offset = 0;
    pins.forEach(col => {
        const idx = ths.findIndex(th => th.getAttribute('data-col') === col);
        if (idx < 0) return;

        const apply = (el, z) => {
            el.style.position = 'sticky';
            el.style.right = offset + 'px';
            el.style.zIndex = z;
            el.style.background = sheetResolveBg(el);
        };

        apply(ths[idx], 6);
        rows.forEach(tr => {
            const td = tr.children[idx];
            if (td) apply(td, 5);
        });

        offset += ths[idx].offsetWidth;
    });
}

// إلغاء التثبيت: بنشيل الـ style الـ inline من عناوين وخلايا الأعمدة المثبتة
function clearPinnedColumns(table, colsCsv) {
    const cols = String(colsCsv || '').split(',').filter(Boolean);
    const ths = Array.from(table.querySelectorAll('thead th'));
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const reset = el => {
        el.style.position = '';
        el.style.right = '';
        el.style.zIndex = '';
        el.style.background = '';
    };
    cols.forEach(col => {
        const idx = ths.findIndex(th => th.getAttribute('data-col') === col);
        if (idx < 0) return;
        reset(ths[idx]);
        rows.forEach(tr => { if (tr.children[idx]) reset(tr.children[idx]); });
    });
}

// ================= زرار تثبيت / إلغاء تثبيت العمود المميز =================
// العمود المميز: الرتبة والاسم في المستخدمين، واسم الموديل في الموديلات.
// الوضع الطبيعي: من غير تثبيت، والتثبيت بيتفعّل بالزرار وقت ما تحتاجه.
function applyKeyPinState(table, keyCols) {
    table.dataset.pinKeys = keyCols;
    table.dataset.pinCols = '';
    updateKeyPinButton();
}

function updateKeyPinButton() {
    const table = document.getElementById('editableUsersTable');
    const label = document.getElementById('keyPinLabel');
    const btn = document.getElementById('keyPinBtn');
    if (!table || !label || !btn) return;
    const on = !!table.dataset.pinCols;
    label.textContent = on ? 'إلغاء تثبيت العمود المميز' : 'تثبيت العمود المميز';
    btn.classList.toggle('ring-2', on);
    btn.classList.toggle('ring-purple-400', on);
}

function toggleKeyColumnPin() {
    const table = document.getElementById('editableUsersTable');
    if (!table || !table.dataset.pinKeys) return;

    const keys = table.dataset.pinKeys;
    const wasOn = !!table.dataset.pinCols;

    if (wasOn) {
        clearPinnedColumns(table, keys);
        table.dataset.pinCols = '';
    } else {
        table.dataset.pinCols = keys;
        refreshPinnedColumns(table);
    }

    updateKeyPinButton();
}

// ================= ميزات الإكسل (اللصق المتعدد والسحب للتعبئة) =================
function enableExcelPasteAndDragFill() {
    const table = document.getElementById('editableUsersTable');
    if (!table) return;

    const inputs = table.querySelectorAll('.excel-input');

    // تحديث مقاس الخلية أثناء الكتابة (مرة واحدة لكل جدول)
    if (!table.dataset.fitBound) {
        table.dataset.fitBound = '1';
        table.addEventListener('input', e => {
            if (e.target.classList && e.target.classList.contains('excel-input')) {
                sheetFitCell(e.target);
                requestAnimationFrame(() => refreshPinnedColumns(table));
            }
        });
    }
    sheetFitAll(table);
    refreshPinnedColumns(table);
    requestAnimationFrame(() => refreshPinnedColumns(table));

    inputs.forEach(input => {
        if (input.dataset.bound) return;
        input.dataset.bound = '1';

        // 1. اللصق الجماعي: كل قيمة في خلية لوحدها
        input.addEventListener('paste', function(e) {
            const clipboardData = e.clipboardData || window.clipboardData;
            const pastedData = clipboardData ? clipboardData.getData('Text') : '';
            // نص عادي بدون أسطر أو Tab: نترك اللصق الافتراضي
            if (!pastedData || !/[\r\n\t]/.test(pastedData)) return;
            e.preventDefault();
            distributePastedText(table, this, pastedData);
            requestAnimationFrame(() => refreshPinnedColumns(table));
        });

        // احتياطي: بعض كيبوردات الموبايل تلصق النص بدون حدث paste
        input.addEventListener('input', function() {
            if (/[\r\n\t]/.test(this.value)) {
                distributePastedText(table, this, this.value);
            }
        });

        // Enter ينقل للخلية اللي تحت (زي إكسل) بدل ما يضيف سطر داخل الخلية
        input.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const row = this.closest('tr');
            const idx = Array.from(row.querySelectorAll('td')).indexOf(this.closest('td'));
            const nextRow = row.nextElementSibling;
            const next = nextRow ? nextRow.querySelectorAll('td')[idx]?.querySelector('.excel-input') : null;
            if (next) next.focus();
        });
    });

    // 2. السحب للتعبئة (Drag Fill Handle)
    const handles = table.querySelectorAll('.drag-handle');
    handles.forEach(handle => {
        if (handle.dataset.bound) return;
        handle.dataset.bound = '1';
        handle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            const sourceCell = this.closest('td');
            const sourceInput = sourceCell.querySelector('.excel-input');
            const sourceRow = sourceCell.closest('tr');
            const allRows = Array.from(table.querySelectorAll('tbody tr'));
            const sourceRowIndex = allRows.indexOf(sourceRow);
            const sourceCellIndex = Array.from(sourceRow.querySelectorAll('td')).indexOf(sourceCell);
            const sourceVal = sourceInput ? sourceInput.value : sourceCell.innerText;

            function onMouseMove(moveEvent) {
                const elemBelow = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
                const targetCellBelow = elemBelow?.closest('td');
                if (targetCellBelow) {
                    const targetRow = targetCellBelow.closest('tr');
                    const targetRowIndex = allRows.indexOf(targetRow);
                    const targetCellIndex = Array.from(targetRow.querySelectorAll('td')).indexOf(targetCellBelow);

                    if (targetCellIndex === sourceCellIndex && targetRowIndex >= sourceRowIndex) {
                        for (let i = sourceRowIndex; i <= targetRowIndex; i++) {
                            const rowCells = Array.from(allRows[i].querySelectorAll('td'));
                            const inputToFill = rowCells[sourceCellIndex]?.querySelector('.excel-input');
                            if (inputToFill) {
                                inputToFill.value = sourceVal;
                                sheetFitCell(inputToFill);
                            }
                        }
                    }
                }
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });
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

// ================= جداول الموديلات في مركز البيانات =================
// المفتاح (key) هو اسم الماركة اللي بتتبعت للدالة الواحدة get_models_for_data_center
const DATA_CENTER_BRANDS = [
    { key: 'apple',   label: 'أبل - Apple' },
    { key: 'samsung', label: 'سامسونج - Samsung' },
    { key: 'xiaomi',  label: 'شاومي - Xiaomi' },
    { key: 'redmi',   label: 'ريدمي - Redmi' },
    { key: 'infinix', label: 'انفينكس - Infinix' },
    { key: 'oppo',    label: 'أوبو - Oppo' },
    { key: 'realme',  label: 'ريلمي - Realme' },
    { key: 'huawei',  label: 'هواوي - Huawei' },
    { key: 'vivo',    label: 'فيفو - Vivo' },
    { key: 'honor',   label: 'هونر - Honor' },
    { key: 'htc',     label: 'إتش تي سي - HTC' },
    { key: 'nokia',   label: 'نوكيا - Nokia' },
    { key: 'techno',  label: 'تكنو - Techno' },
    { key: 'itel',    label: 'أيتل - Itel' }
];

let currentModelsSheetData = [];
let currentModelsSheetBrand = '';
let currentModelsSheetLabel = '';
let currentModelsSheetColumns = [];
let currentModelsSheetCanManage = false;
const MODELS_SHEET_READONLY_COLS = ['id', 'created_at', 'updated_at'];
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

// ---------- التسميات العربية لأعمدة الموديلات (أي ماركة) ----------
function modelsColLabel(col) {
    if (col === 'created_at') return 'تاريخ الإنشاء';
    if (/_model_names$/.test(col)) return 'اسم الموديل';
    if (/_model_codes$/.test(col)) return 'كود الموديل';
    if (/_battery_codes$/.test(col)) return 'كود البطارية';
    return '';
}

// الرتب اللي مسموح لها تدرج/تحذف صفوف في جدول الموديلات (نفس الرتب في profile.js)
// الصلاحية الفعلية بتتأكد منها دوال الداتابيز كمان، ده بس لإظهار/إخفاء الأزرار.
const DATA_CENTER_ROW_MANAGER_ROLES = ['أدمن', 'admin', 'مدير', 'head', 'manager'];
function isDataCenterRowManager() {
    return DATA_CENTER_ROW_MANAGER_ROLES.includes(String(currentUserRole || '').trim());
}

function escapeHtmlValue(val) {
    return String(val === null || val === undefined ? '' : val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ---------- شاشة اختيار الماركة ----------
function renderDataCenterBrandsScreen() {
    closeSidebar();

    const container = document.getElementById('appContainer');
    container.innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex items-center justify-between mb-4 flex-shrink-0 flex-wrap gap-2">
            <button type="button" onclick="renderDataCenterScreen()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                <span>رجوع لمركز البيانات</span>
            </button>
            <h2 class="text-sm sm:text-base font-bold text-gray-800">جداول الموديلات - اختر الماركة</h2>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 p-1">
            ${DATA_CENTER_BRANDS.map((brand, index) => {
                const style = getRotatingCardStyle(index);
                return `
                    <div onclick="renderDataCenterModelsSheet('${brand.key}', '${brand.label}')" class="w-full ${style.bg} border ${style.border} p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all text-sm sm:text-base group">
                        <span class="font-bold text-gray-800" dir="auto">${brand.label}</span>
                        <svg class="w-5 h-5 ${style.icon} flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    loadDynamicMenuIntoSidebar();
}

// ---------- أزرار الصف (إدراج قبله / حذف) - للأدمن والمدير فقط ----------
function modelsRowActionsHtml(id) {
    const n = Number(id);
    if (!Number.isFinite(n)) return '<td class="sheet-actions"></td>';
    return `
        <td class="sheet-actions">
            <div class="flex items-center gap-1 px-2 py-1 whitespace-nowrap">
                <button type="button" onclick="insertModelRowAt(${n})" title="إدراج صف جديد في مكان هذا الصف (وهو وما بعده ينزلوا خطوة)" class="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer">+ إدراج</button>
                <button type="button" onclick="deleteModelRow(${n})" title="حذف هذا الصف" class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer">حذف</button>
            </div>
        </td>`;
}

// ---------- شاشة جدول موديلات ماركة معينة (شيت قابل للتعديل) ----------
// ملاحظة: نستخدم نفس id الخاص بشيت المستخدمين (editableUsersTable) للاستفادة
// من نفس التنسيق وميزات اللصق الجماعي والسحب للتعبئة بدون تكرار الكود.
async function renderDataCenterModelsSheet(brandKey, brandLabel) {
    closeSidebar();
    currentModelsSheetBrand = brandKey;
    currentModelsSheetLabel = brandLabel;

    const container = document.getElementById('appContainer');
    container.innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex items-center justify-between mb-3 flex-shrink-0 flex-wrap gap-2">
            <div class="flex items-center gap-2 flex-wrap">
                <button type="button" onclick="renderDataCenterBrandsScreen()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    <span>رجوع للماركات</span>
                </button>
                <button type="button" onclick="renderDataCenterModelsSheet('${brandKey}', '${brandLabel}')" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 border border-blue-200 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>تحديث</span>
                </button>
                <button type="button" onclick="addModelsSheetRow(true)" class="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>إضافة صف</span>
                </button>
                <button type="button" onclick="saveModelsSheetToDB()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                    <span>حفظ التعديلات لقاعدة البيانات</span>
                </button>
                <button type="button" id="keyPinBtn" onclick="toggleKeyColumnPin()" class="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    <span id="keyPinLabel">تثبيت العمود المميز</span>
                </button>
                <button type="button" onclick="exportModelsSheetToExcel()" class="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>تصدير إلى إكسل</span>
                </button>
            </div>
            <h2 id="modelsSheetTitle" class="text-sm sm:text-base font-bold text-gray-800">جدول موديلات ${brandLabel}</h2>
        </div>

        <input id="modelsSearchInput" type="text" oninput="modelsSheetApplyFilter(this.value)" placeholder="ابحث بالاسم أو كود الموديل أو كود البطارية" class="w-full mb-2 flex-shrink-0 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" dir="auto">
        <div id="modelsSearchCount" class="text-xs text-gray-500 mb-1 flex-shrink-0 hidden"></div>

        <div id="modelsSheetContainer" class="flex-1 overflow-y-auto p-1 border border-slate-300 rounded-xl bg-white shadow-inner">
            <div class="text-center text-gray-400 text-sm py-8">جاري جلب الموديلات...</div>
        </div>
    `;

    loadDynamicMenuIntoSidebar();

    const sheetContainer = document.getElementById('modelsSheetContainer');
    const titleElement = document.getElementById('modelsSheetTitle');

    try {
        const { data, error } = await supabaseClient.rpc('get_models_for_data_center', {
            p_user_id: currentUserId,
            p_brand: brandKey
        });

        if (error) {
            sheetContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">خطأ في جلب البيانات: ${escapeHtmlValue(error.message)}</div>`;
            return;
        }

        // الرد الجديد: { columns: [...], rows: [...] } — ويدعم أيضاً الشكل القديم (مصفوفة صفوف)
        let payloadData = data;
        if (typeof payloadData === 'string') {
            try { payloadData = JSON.parse(payloadData); } catch(e){}
        }

        let modelsList = [];
        let serverColumns = [];
        if (Array.isArray(payloadData)) {
            modelsList = payloadData;
        } else if (payloadData && typeof payloadData === 'object') {
            modelsList = Array.isArray(payloadData.rows) ? payloadData.rows : [];
            serverColumns = Array.isArray(payloadData.columns) ? payloadData.columns : [];
        }

        currentModelsSheetData = modelsList;

        if (titleElement) {
            titleElement.innerText = `جدول موديلات ${brandLabel} (${modelsList.length})`;
        }

        let columns = [];
        if (serverColumns.length > 0) {
            columns = serverColumns;
        } else if (modelsList.length > 0) {
            columns = Object.keys(modelsList[0]);
        } else {
            columns = await getModelsTableColumns(brandKey);
        }
        const readOnlyCols = ['id', 'created_at', 'updated_at'];

        // أزرار إدراج/حذف الصف: للأدمن والمدير فقط
        const canManageRows = isDataCenterRowManager();
        currentModelsSheetCanManage = canManageRows;

        sheetContainer.innerHTML = `
            <table id="editableUsersTable">
                <thead>
                    <tr>
                        ${columns.map(col => sheetThHtml(col, modelsColLabel(col))).join('')}
                        ${sheetIdDupThHtml()}
                        ${canManageRows ? '<th class="sheet-actions-th">إجراءات</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${modelsList.map(row => `
                        <tr data-id="${escapeHtmlValue(row.id)}">
                            ${columns.map(col => {
                                const val = row[col] !== null && row[col] !== undefined ? row[col] : '';
                                if (readOnlyCols.includes(col)) {
                                    return sheetReadonlyCellHtml(val);
                                }
                                return `
                                    <td class="relative">
                                        ${sheetCellInputHtml(col, val)}
                                        <div class="drag-handle" title="اسحب للتعبئة التلقائية"></div>
                                    </td>
                                `;
                            }).join('')}
                            ${sheetIdDupCellHtml(row.id)}
                            ${canManageRows ? modelsRowActionsHtml(row.id) : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        currentModelsSheetColumns = columns;
        const modelsTable = document.getElementById('editableUsersTable');
        modelsTable.addRowFn = addModelsSheetRow;
        // تثبيت عمود اسم الموديل على الجنب (أي ماركة)
        applyKeyPinState(modelsTable, `${brandKey}_model_names`);
        enableExcelPasteAndDragFill();
        if (modelsList.length === 0) addModelsSheetRow(false);
    } catch (err) {
        console.error("Models sheet error:", err);
        sheetContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">حدث خطأ غير متوقع</div>`;
    }
}

// ---------- إدراج صف جديد في مكان معين (أدمن / مدير) ----------
// الصف الحالي رقم position وما بعده بينزلوا خطوة، والموديل الجديد ياخد رقم position.
async function insertModelRowAt(position) {
    if (!isDataCenterRowManager()) {
        alert('هذا الإجراء للأدمن والمدير فقط');
        return;
    }

    const keyCol = `${currentModelsSheetBrand}_model_names`;
    const name = prompt(
        `اكتب اسم الموديل الجديد ليتم إدراجه في المكان رقم ${position}.\n` +
        `ملاحظة: الشيت هيتحدّث بعد الإدراج، فاحفظ أي تعديلات أخرى الأول.`
    );
    if (name === null) return;

    const cleanName = name.trim();
    if (!cleanName) {
        alert('اسم الموديل مطلوب');
        return;
    }

    try {
        const { data, error } = await supabaseClient.rpc('insert_model_at_position_for_data_center', {
            p_user_id: currentUserId,
            p_brand: currentModelsSheetBrand,
            p_position: position,
            p_payload: { [keyCol]: cleanName }
        });
        if (error) {
            alert('حدث خطأ أثناء الإدراج: ' + error.message);
            return;
        }
        if (!data || !data.success) {
            alert(data?.message || 'فشل الإدراج');
            return;
        }
        await renderDataCenterModelsSheet(currentModelsSheetBrand, currentModelsSheetLabel);
    } catch (err) {
        console.error('Insert model at position error:', err);
        alert('حدث خطأ غير متوقع أثناء الإدراج');
    }
}

// ---------- حذف صف (أدمن / مدير) ----------
// الصف بيتمسح والأرقام اللي بعده بترجع خطوة لورا.
async function deleteModelRow(id) {
    if (!isDataCenterRowManager()) {
        alert('هذا الإجراء للأدمن والمدير فقط');
        return;
    }

    const keyCol = `${currentModelsSheetBrand}_model_names`;
    const rowData = currentModelsSheetData.find(r => String(r.id) === String(id));
    const label = rowData && rowData[keyCol] ? `"${rowData[keyCol]}" (رقم ${id})` : `رقم ${id}`;

    if (!confirm(
        `هتحذف الموديل ${label} نهائياً.\n` +
        `الأرقام اللي بعده هترجع خطوة لورا، وأسعاره عند التجار هتتمسح.\n` +
        `الشيت هيتحدّث بعد الحذف، فاحفظ أي تعديلات أخرى الأول. متأكد؟`
    )) return;

    try {
        const { data, error } = await supabaseClient.rpc('delete_model_at_position_for_data_center', {
            p_user_id: currentUserId,
            p_brand: currentModelsSheetBrand,
            p_id: Number(id)
        });
        if (error) {
            alert('حدث خطأ أثناء الحذف: ' + error.message);
            return;
        }
        if (!data || !data.success) {
            alert(data?.message || 'فشل الحذف');
            return;
        }
        await renderDataCenterModelsSheet(currentModelsSheetBrand, currentModelsSheetLabel);
    } catch (err) {
        console.error('Delete model row error:', err);
        alert('حدث خطأ غير متوقع أثناء الحذف');
    }
}

// ---------- جلب أعمدة الجدول (للجداول الفارغة) ----------
// يحاول أولاً دالة get_models_columns_for_data_center (أسماء الأعمدة الحقيقية)،
// وإذا لم تكن موجودة يستخدم أسماء الأعمدة المتوقعة حسب نمط التسمية المستخدم في التطبيق.
async function getModelsTableColumns(brandKey) {
    try {
        const { data, error } = await supabaseClient.rpc('get_models_columns_for_data_center', {
            p_user_id: currentUserId,
            p_table: `${brandKey}_models`
        });
        if (!error && Array.isArray(data) && data.length > 0) return data;
    } catch (e) {}

    return [
        'id',
        `${brandKey}_phone_name`,
        `${brandKey}_phone_code`,
        `${brandKey}_screen_compatibility`,
        `${brandKey}_battery_model`
    ];
}

// ---------- إضافة صف جديد فارغ للشيت (مشترك بين شيت الموديلات وشيت المستخدمين) ----------
// extraCellsHtml: خلايا إضافية في آخر الصف (مثلاً خلية الإجراءات في شيت الموديلات)
function appendBlankSheetRow(columns, readOnlyCols, focus = true, extraCellsHtml = '', withIdDup = false) {
    const table = document.getElementById('editableUsersTable');
    if (!table) return null;
    const tbody = table.querySelector('tbody');

    const tr = document.createElement('tr');
    tr.setAttribute('data-new', '1');
    tr.innerHTML = columns.map(col => {
        if (readOnlyCols.includes(col)) {
            return sheetReadonlyCellHtml('جديد', true, true);
        }
        return `
            <td class="relative">
                ${sheetCellInputHtml(col, '')}
                <div class="drag-handle" title="اسحب للتعبئة التلقائية"></div>
            </td>
        `;
    }).join('') + (withIdDup ? sheetIdDupCellHtml('جديد', true) : '') + extraCellsHtml;
    tbody.appendChild(tr);

    enableExcelPasteAndDragFill();

    if (focus) {
        const firstInput = tr.querySelector('.excel-input');
        if (firstInput) {
            firstInput.focus();
            tr.scrollIntoView({ block: 'nearest' });
        }
    }
    return tr;
}

function addModelsSheetRow(focus = true) {
    // الصف الجديد لسه مالوش id، فخلية الإجراءات بتاعته فاضية
    const extra = currentModelsSheetCanManage ? '<td class="sheet-actions"></td>' : '';
    return appendBlankSheetRow(currentModelsSheetColumns, MODELS_SHEET_READONLY_COLS, focus, extra, true);
}

function addUsersSheetRow(focus = true) {
    return appendBlankSheetRow(currentUsersSheetColumns, USERS_SHEET_READONLY_COLS, focus);
}

// ---------- حفظ شيت الموديلات (تعديل الموجود + إضافة الجديد) ----------
async function saveModelsSheetToDB() {
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
            const { data, error } = await supabaseClient.rpc('update_models_for_data_center', {
                p_user_id: currentUserId,
                p_brand: currentModelsSheetBrand,
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
            messages.push(data.message || "تم حفظ التعديلات");
        }

        if (insertPayload.length > 0) {
            const { data, error } = await supabaseClient.rpc('insert_models_for_data_center', {
                p_user_id: currentUserId,
                p_brand: currentModelsSheetBrand,
                p_payload: insertPayload
            });
            if (error) {
                alert((messages.length ? messages.join('\n') + '\n\n' : '') + "حدث خطأ أثناء إضافة الصفوف الجديدة: " + error.message);
                return;
            }
            if (!data || !data.success) {
                alert((messages.length ? messages.join('\n') + '\n\n' : '') + (data?.message || "فشلت إضافة الصفوف الجديدة"));
                return;
            }
            messages.push(data.message || "تمت إضافة الصفوف الجديدة");
        }

        alert(messages.join('\n'));

        // إعادة تحميل الشيت ليظهر الـ id للصفوف الجديدة
        if (insertPayload.length > 0) {
            await renderDataCenterModelsSheet(currentModelsSheetBrand, currentModelsSheetLabel);
        }
    } catch (err) {
        console.error("Save models sheet error:", err);
        alert("حدث خطأ غير متوقع أثناء الحفظ");
    }
}

// ---------- بحث في شيت الموديلات (الاسم / كود الموديل / كود البطارية) ----------
// بنحدد الأعمدة باسمها (مش بترتيبها). الفلترة بإخفاء الصفوف بس (الخلايا فاضلة في الصفحة)،
// فالتعديلات اللي اتكتبت ما بتضيعش، وزرار الحفظ بيحفظ كل الصفوف حتى المخفية.
const MODELS_SEARCH_FIELD_RE = /_model_names$|_model_codes$|_model_battery_codes$/;

function modelsSheetApplyFilter(q) {
    const table = document.getElementById('editableUsersTable');
    if (!table) return;

    const norm = v => String(v ?? '').toLowerCase().replace(/\s+/g, '');
    const needle = norm(q);

    const rows = table.querySelectorAll('tbody tr');
    let visible = 0;
    let total = 0;

    rows.forEach(tr => {
        const inputs = Array.from(tr.querySelectorAll('.excel-input'))
            .filter(i => MODELS_SEARCH_FIELD_RE.test(i.getAttribute('data-field') || ''));

        // صف الرسالة الفاضي (لو مفيش بيانات) مالوش خلايا إدخال، نسيبه زي ما هو
        if (!tr.querySelector('.excel-input')) return;

        total++;
        const match = !needle || inputs.some(i => norm(i.value).includes(needle));
        tr.style.display = match ? '' : 'none';
        if (match) visible++;
    });

    const count = document.getElementById('modelsSearchCount');
    if (count) {
        if (needle) {
            count.textContent = `${visible} من ${total} موديل`;
            count.classList.remove('hidden');
        } else {
            count.classList.add('hidden');
        }
    }
}

// ---------- تصدير شيت الموديلات (بالقيم الحالية بعد التعديل) إلى XLSX ----------
function exportModelsSheetToExcel() {
    const table = document.getElementById('editableUsersTable');
    if (!table) {
        alert("لا توجد بيانات للتصدير حالياً");
        return;
    }

    // عمود/خلايا الإجراءات (إدراج/حذف) مش بتتصدّر، والعناوين بأسماء الأعمدة الحقيقية
    const headers = Array.from(table.querySelectorAll('thead th[data-col]')).map(th => th.getAttribute('data-col'));
    const rowsData = [];
    table.querySelectorAll('tbody tr').forEach(row => {
        if (!row.hasAttribute('data-id') && !Array.from(row.querySelectorAll('.excel-input')).some(i => i.value.trim() !== '')) return;
        rowsData.push(Array.from(row.querySelectorAll('td:not(.sheet-actions):not(.sheet-id-dup)')).map(td => {
            const input = td.querySelector('.excel-input');
            return input ? input.value : td.innerText.trim();
        }));
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rowsData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, currentModelsSheetBrand || 'models');

    const fileName = `${currentModelsSheetBrand}_models_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}


// =====================================================================
// ================= جداول مجموعات التوافقات في مركز البيانات =================
// الجداول: {brand}_model_spare_part_compatibility_groups
// أعمدة كل جدول: id + 13 عمود توافق (كلها بتنتهي بـ _compatibility_groups) + created_at
// الدوال في الداتابيز: get / update / insert / insert_at_position / delete_at_position
// =====================================================================
const CG_READONLY_COLS = ['id', 'created_at', 'updated_at'];

// أي عمود اسمه بينتهي بـ _compatibility_groups = عمود توافق (البحث بيدوّر في كلهم)
const CG_SEARCH_FIELD_RE = /_compatibility_groups$/;

// الاسم العربي لكل قطعة (بعد شيل {brand}_model_ من الأول و _compatibility_groups من الآخر)
const CG_PART_LABELS = {
    screen: 'شاشة',
    battery: 'بطارية',
    back_cover: 'ضهرية',
    charging_flex_cable: 'فلاتة شحن',
    charging_linking_flex_cable: 'فلاتة ربط شحن',
    screen_linking_flex_cable: 'فلاتة ربط شاشة',
    power_flex_cable: 'فلاتة باور',
    frame: 'فريم',
    middle_frame: 'ميدل',
    internal_speaker: 'سماعة داخلية',
    external_speaker: 'سماعة خارجية',
    loud_speaker: 'علبة جرس',
    socket: 'سوكيت'
};

let currentCgBrand = '';
let currentCgLabel = '';
let currentCgColumns = [];
let currentCgData = [];

function cgColLabel(col) {
    if (col === 'created_at') return 'تاريخ الانشاء';
    const key = String(col)
        .replace(`${currentCgBrand}_model_`, '')
        .replace(/_compatibility_groups$/, '');
    const base = CG_PART_LABELS[key];
    return base ? `مجموعات توافق ${base}` : '';
}

// ---------- شاشة اختيار الماركة ----------
function renderCompatGroupsBrandsScreen() {
    closeSidebar();

    const container = document.getElementById('appContainer');
    container.innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex items-center justify-between mb-4 flex-shrink-0 flex-wrap gap-2">
            <button type="button" onclick="renderDataCenterScreen()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                <span>رجوع لمركز البيانات</span>
            </button>
            <h2 class="text-sm sm:text-base font-bold text-gray-800">جداول مجموعات التوافقات - اختر الماركة</h2>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 p-1">
            ${DATA_CENTER_BRANDS.map((brand, index) => {
                const style = getRotatingCardStyle(index);
                return `
                    <div onclick="renderCompatGroupsSheet('${brand.key}', '${brand.label}')" class="w-full ${style.bg} border ${style.border} p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all text-sm sm:text-base group">
                        <span class="font-bold text-gray-800" dir="auto">${brand.label}</span>
                        <svg class="w-5 h-5 ${style.icon} flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    loadDynamicMenuIntoSidebar();
}

// ---------- أزرار الصف (إدراج قبله / حذف) ----------
function cgRowActionsHtml(id) {
    const n = Number(id);
    if (!Number.isFinite(n)) return '<td class="sheet-actions"></td>';
    return `
        <td class="sheet-actions">
            <div class="flex items-center gap-1 px-2 py-1 whitespace-nowrap">
                <button type="button" onclick="insertCgRowAt(${n})" title="إدراج صف جديد في مكان هذا الصف (وهو وما بعده ينزلوا خطوة)" class="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer">+ إدراج</button>
                <button type="button" onclick="deleteCgRow(${n})" title="حذف هذا الصف" class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer">حذف</button>
            </div>
        </td>`;
}

// ---------- شيت مجموعات التوافقات لماركة معينة ----------
// بنستخدم نفس id الشيت (editableUsersTable) عشان نفس التنسيق واللصق الجماعي والسحب للتعبئة
async function renderCompatGroupsSheet(brandKey, brandLabel) {
    closeSidebar();
    currentCgBrand = brandKey;
    currentCgLabel = brandLabel;

    const container = document.getElementById('appContainer');
    container.innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex items-center justify-between mb-3 flex-shrink-0 flex-wrap gap-2">
            <div class="flex items-center gap-2 flex-wrap">
                <button type="button" onclick="renderCompatGroupsBrandsScreen()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    <span>رجوع للماركات</span>
                </button>
                <button type="button" onclick="renderCompatGroupsSheet('${brandKey}', '${brandLabel}')" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 border border-blue-200 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>تحديث</span>
                </button>
                <button type="button" onclick="addCgSheetRow(true)" class="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>إضافة صف</span>
                </button>
                <button type="button" onclick="saveCgSheetToDB()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                    <span>حفظ التعديلات لقاعدة البيانات</span>
                </button>
                <button type="button" onclick="exportCgSheetToExcel()" class="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>تصدير إلى إكسل</span>
                </button>
            </div>
            <h2 id="cgSheetTitle" class="text-sm sm:text-base font-bold text-gray-800">مجموعات توافقات ${brandLabel}</h2>
        </div>

        <input id="cgSearchInput" type="text" oninput="cgSheetApplyFilter(this.value)" placeholder="ابحث في أي عمود توافق" class="w-full mb-2 flex-shrink-0 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" dir="auto">
        <div id="cgSearchCount" class="text-xs text-gray-500 mb-1 flex-shrink-0 hidden"></div>

        <div id="cgSheetContainer" class="flex-1 overflow-y-auto p-1 border border-slate-300 rounded-xl bg-white shadow-inner">
            <div class="text-center text-gray-400 text-sm py-8">جاري جلب مجموعات التوافقات...</div>
        </div>
    `;

    loadDynamicMenuIntoSidebar();

    const sheetContainer = document.getElementById('cgSheetContainer');
    const titleElement = document.getElementById('cgSheetTitle');

    try {
        const { data, error } = await supabaseClient.rpc('get_model_spare_part_compatibility_groups_for_data_center', {
            p_user_id: currentUserId,
            p_brand: brandKey
        });

        if (error) {
            sheetContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">خطأ في جلب البيانات: ${escapeHtmlValue(error.message)}</div>`;
            return;
        }

        let payloadData = data;
        if (typeof payloadData === 'string') {
            try { payloadData = JSON.parse(payloadData); } catch (e) {}
        }

        const rows = payloadData && Array.isArray(payloadData.rows) ? payloadData.rows : [];
        const columns = payloadData && Array.isArray(payloadData.columns) ? payloadData.columns : [];

        if (!columns.length) {
            sheetContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">جدول مجموعات التوافقات غير موجود لهذه الماركة</div>`;
            return;
        }

        currentCgData = rows;
        currentCgColumns = columns;

        if (titleElement) {
            titleElement.innerText = `مجموعات توافقات ${brandLabel} (${rows.length})`;
        }

        sheetContainer.innerHTML = `
            <table id="editableUsersTable">
                <thead>
                    <tr>
                        ${columns.map(col => sheetThHtml(col, cgColLabel(col))).join('')}
                        ${sheetIdDupThHtml()}
                        <th class="sheet-actions-th">إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr data-id="${escapeHtmlValue(row.id)}">
                            ${columns.map(col => {
                                const val = row[col] !== null && row[col] !== undefined ? row[col] : '';
                                if (CG_READONLY_COLS.includes(col)) {
                                    return sheetReadonlyCellHtml(val);
                                }
                                return `
                                    <td class="relative">
                                        ${sheetCellInputHtml(col, val)}
                                        <div class="drag-handle" title="اسحب للتعبئة التلقائية"></div>
                                    </td>
                                `;
                            }).join('')}
                            ${sheetIdDupCellHtml(row.id)}
                            ${cgRowActionsHtml(row.id)}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('editableUsersTable').addRowFn = addCgSheetRow;
        enableExcelPasteAndDragFill();
        if (rows.length === 0) addCgSheetRow(false);
    } catch (err) {
        console.error('Compat groups sheet error:', err);
        sheetContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">حدث خطأ غير متوقع</div>`;
    }
}

function addCgSheetRow(focus = true) {
    // الصف الجديد لسه مالوش id، فخلية الإجراءات بتاعته فاضية
    return appendBlankSheetRow(currentCgColumns, CG_READONLY_COLS, focus, '<td class="sheet-actions"></td>', true);
}

// ---------- البحث في أي عمود توافق ----------
// الفلترة بإخفاء الصفوف بس (الخلايا فاضلة في الصفحة)، فالتعديلات ما بتضيعش،
// وزرار الحفظ بيحفظ كل الصفوف حتى المخفية.
function cgSheetApplyFilter(q) {
    const table = document.getElementById('editableUsersTable');
    if (!table) return;

    const norm = v => String(v ?? '').toLowerCase().replace(/\s+/g, '');
    const needle = norm(q);

    let visible = 0;
    let total = 0;

    table.querySelectorAll('tbody tr').forEach(tr => {
        if (!tr.querySelector('.excel-input')) return;

        const inputs = Array.from(tr.querySelectorAll('.excel-input'))
            .filter(i => CG_SEARCH_FIELD_RE.test(i.getAttribute('data-field') || ''));

        total++;
        const match = !needle || inputs.some(i => norm(i.value).includes(needle));
        tr.style.display = match ? '' : 'none';
        if (match) visible++;
    });

    const count = document.getElementById('cgSearchCount');
    if (count) {
        if (needle) {
            count.textContent = `${visible} من ${total} صف`;
            count.classList.remove('hidden');
        } else {
            count.classList.add('hidden');
        }
    }
}

// ---------- نافذة الإدراج (اختيار العمود + اسم المجموعة) ----------
function closeCgDialog() {
    const old = document.getElementById('cgDialog');
    if (old) old.remove();
}

function insertCgRowAt(position) {
    const cols = currentCgColumns.filter(c => CG_SEARCH_FIELD_RE.test(c));
    if (!cols.length) return;

    closeCgDialog();

    const overlay = document.createElement('div');
    overlay.id = 'cgDialog';
    overlay.className = 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4';
    overlay.innerHTML = `
        <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-3 border border-gray-200">
            <h3 class="font-bold text-gray-800 text-sm">إدراج صف جديد في المكان رقم ${position}</h3>
            <p class="text-xs text-gray-500 leading-relaxed">الصف الحالي رقم ${position} وما بعده هينزلوا خطوة. احفظ أي تعديلات أخرى الأول لأن الشيت هيتحدّث بعد الإدراج.</p>
            <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600">العمود</label>
                <select id="cgInsertCol" class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    ${cols.map(c => {
                        const ar = cgColLabel(c);
                        return `<option value="${escapeHtmlValue(c)}">${ar ? ar + ' — ' : ''}${escapeHtmlValue(c)}</option>`;
                    }).join('')}
                </select>
            </div>
            <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600">اسم المجموعة</label>
                <input id="cgInsertVal" type="text" dir="auto" onkeydown="if(event.key==='Enter'){event.preventDefault();submitCgInsert(${position});}" class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="flex items-center gap-2 pt-1">
                <button type="button" onclick="submitCgInsert(${position})" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-sm cursor-pointer">إدراج</button>
                <button type="button" onclick="closeCgDialog()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm cursor-pointer">إلغاء</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('cgInsertVal');
    if (input) input.focus();
}

async function submitCgInsert(position) {
    const col = document.getElementById('cgInsertCol')?.value;
    const val = (document.getElementById('cgInsertVal')?.value || '').trim();

    if (!col) return;
    if (!val) {
        alert('اسم المجموعة مطلوب');
        return;
    }

    try {
        const { data, error } = await supabaseClient.rpc('insert_model_spare_part_compatibility_group_at_position_for_data_center', {
            p_user_id: currentUserId,
            p_brand: currentCgBrand,
            p_position: position,
            p_payload: { [col]: val }
        });
        if (error) {
            alert('حدث خطأ أثناء الإدراج: ' + error.message);
            return;
        }
        if (!data || !data.success) {
            alert(data?.message || 'فشل الإدراج');
            return;
        }
        closeCgDialog();
        await renderCompatGroupsSheet(currentCgBrand, currentCgLabel);
    } catch (err) {
        console.error('Insert compat group at position error:', err);
        alert('حدث خطأ غير متوقع أثناء الإدراج');
    }
}

// ---------- حذف صف ----------
async function deleteCgRow(id) {
    const rowData = currentCgData.find(r => String(r.id) === String(id));
    const firstVal = rowData
        ? currentCgColumns.filter(c => CG_SEARCH_FIELD_RE.test(c)).map(c => rowData[c]).find(v => v)
        : '';
    const label = firstVal ? `"${firstVal}" (رقم ${id})` : `رقم ${id}`;

    if (!confirm(
        `هتحذف الصف ${label} نهائياً بكل المجموعات اللي فيه.\n` +
        `الأرقام اللي بعده هترجع خطوة لورا.\n` +
        `الشيت هيتحدّث بعد الحذف، فاحفظ أي تعديلات أخرى الأول. متأكد؟`
    )) return;

    try {
        const { data, error } = await supabaseClient.rpc('delete_model_spare_part_compatibility_group_at_position_for_data_center', {
            p_user_id: currentUserId,
            p_brand: currentCgBrand,
            p_id: Number(id)
        });
        if (error) {
            alert('حدث خطأ أثناء الحذف: ' + error.message);
            return;
        }
        if (!data || !data.success) {
            alert(data?.message || 'فشل الحذف');
            return;
        }
        await renderCompatGroupsSheet(currentCgBrand, currentCgLabel);
    } catch (err) {
        console.error('Delete compat group row error:', err);
        alert('حدث خطأ غير متوقع أثناء الحذف');
    }
}

// ---------- حفظ الشيت (تعديل الموجود + إضافة الجديد) ----------
async function saveCgSheetToDB() {
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
            const { data, error } = await supabaseClient.rpc('update_model_spare_part_compatibility_groups_for_data_center', {
                p_user_id: currentUserId,
                p_brand: currentCgBrand,
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
            messages.push(data.message || "تم حفظ التعديلات");
        }

        if (insertPayload.length > 0) {
            const { data, error } = await supabaseClient.rpc('insert_model_spare_part_compatibility_groups_for_data_center', {
                p_user_id: currentUserId,
                p_brand: currentCgBrand,
                p_payload: insertPayload
            });
            if (error) {
                alert((messages.length ? messages.join('\n') + '\n\n' : '') + "حدث خطأ أثناء إضافة الصفوف الجديدة: " + error.message);
                return;
            }
            if (!data || !data.success) {
                alert((messages.length ? messages.join('\n') + '\n\n' : '') + (data?.message || "فشلت إضافة الصفوف الجديدة"));
                return;
            }
            messages.push(data.message || "تمت إضافة الصفوف الجديدة");
        }

        alert(messages.join('\n'));

        // إعادة تحميل الشيت ليظهر الـ id للصفوف الجديدة
        if (insertPayload.length > 0) {
            await renderCompatGroupsSheet(currentCgBrand, currentCgLabel);
        }
    } catch (err) {
        console.error("Save compat groups sheet error:", err);
        alert("حدث خطأ غير متوقع أثناء الحفظ");
    }
}

// ---------- تصدير الشيت (بالقيم الحالية بعد التعديل) إلى XLSX ----------
function exportCgSheetToExcel() {
    const table = document.getElementById('editableUsersTable');
    if (!table) {
        alert("لا توجد بيانات للتصدير حالياً");
        return;
    }

    // عمود/خلايا الإجراءات مش بتتصدّر، والعناوين بأسماء الأعمدة الحقيقية
    const headers = Array.from(table.querySelectorAll('thead th[data-col]')).map(th => th.getAttribute('data-col'));
    const rowsData = [];
    table.querySelectorAll('tbody tr').forEach(row => {
        if (!row.hasAttribute('data-id') && !Array.from(row.querySelectorAll('.excel-input')).some(i => i.value.trim() !== '')) return;
        rowsData.push(Array.from(row.querySelectorAll('td:not(.sheet-actions):not(.sheet-id-dup)')).map(td => {
            const input = td.querySelector('.excel-input');
            return input ? input.value : td.innerText.trim();
        }));
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rowsData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, currentCgBrand || 'compat_groups');

    const fileName = `${currentCgBrand}_compatibility_groups_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}


// =====================================================================
// ================= جداول التوافقات في مركز البيانات =================
// الجداول: {brand}_compatibility
// أعمدة كل جدول: id + {brand}_model_names + 13 قطعة × (عمود _compatibility
// وعمود _compatibility_selected_groups) + created_at
// الدوال في الداتابيز: get / update / insert / insert_at_position / delete_at_position
// (اسم الموديل بيتحدد وقت الإضافة بس، وبعدها للقراءة فقط: بيتغير من جدول الموديلات)
// =====================================================================
const CP_READONLY_COLS = ['id', 'created_at', 'updated_at'];

// البحث بيدوّر في أي عمود توافق (_compatibility و _compatibility_selected_groups) واسم الموديل
const CP_SEARCH_FIELD_RE = /_model_names$|_compatibility$|_compatibility_selected_groups$/;

let currentCpBrand = '';
let currentCpLabel = '';
let currentCpColumns = [];
let currentCpData = [];

function cpNameCol() {
    return `${currentCpBrand}_model_names`;
}

function cpColLabel(col) {
    if (col === cpNameCol()) return 'اسم الموديل';
    if (col === 'created_at') return 'تاريخ الانشاء';
    const isGroups = /_compatibility_selected_groups$/.test(col);
    const key = String(col)
        .replace(`${currentCpBrand}_model_`, '')
        .replace(/_compatibility(_selected_groups)?$/, '');
    const base = CG_PART_LABELS[key];
    if (!base) return '';
    return isGroups ? `مجموعات توافق ${base} المختارة` : `توافق ${base}`;
}

// ---------- شاشة اختيار الماركة ----------
function renderCompatBrandsScreen() {
    closeSidebar();

    const container = document.getElementById('appContainer');
    container.innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex items-center justify-between mb-4 flex-shrink-0 flex-wrap gap-2">
            <button type="button" onclick="renderDataCenterScreen()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                <span>رجوع لمركز البيانات</span>
            </button>
            <h2 class="text-sm sm:text-base font-bold text-gray-800">جداول التوافقات - اختر الماركة</h2>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 p-1">
            ${DATA_CENTER_BRANDS.map((brand, index) => {
                const style = getRotatingCardStyle(index);
                return `
                    <div onclick="renderCompatSheet('${brand.key}', '${brand.label}')" class="w-full ${style.bg} border ${style.border} p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all text-sm sm:text-base group">
                        <span class="font-bold text-gray-800" dir="auto">${brand.label}</span>
                        <svg class="w-5 h-5 ${style.icon} flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    loadDynamicMenuIntoSidebar();
}

// ---------- أزرار الصف (إدراج قبله / حذف) ----------
function cpRowActionsHtml(id) {
    const n = Number(id);
    if (!Number.isFinite(n)) return '<td class="sheet-actions"></td>';
    return `
        <td class="sheet-actions">
            <div class="flex items-center gap-1 px-2 py-1 whitespace-nowrap">
                <button type="button" onclick="insertCpRowAt(${n})" title="إدراج صف جديد في مكان هذا الصف (وهو وما بعده ينزلوا خطوة)" class="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer">+ إدراج</button>
                <button type="button" onclick="deleteCpRow(${n})" title="حذف هذا الصف" class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer">حذف</button>
            </div>
        </td>`;
}

// خلية اسم الموديل (للقراءة فقط). التثبيت بيتم بزرار تثبيت العمود المميز
function cpNameCellHtml(val) {
    return `<td class="relative"><span class="block px-2.5 py-2 text-[13px] font-semibold text-gray-800 whitespace-nowrap" dir="auto">${escapeHtmlValue(val)}</span></td>`;
}

// ---------- شيت التوافقات لماركة معينة ----------
// بنستخدم نفس id الشيت (editableUsersTable) عشان نفس التنسيق واللصق الجماعي والسحب للتعبئة
async function renderCompatSheet(brandKey, brandLabel) {
    closeSidebar();
    currentCpBrand = brandKey;
    currentCpLabel = brandLabel;

    const container = document.getElementById('appContainer');
    container.innerHTML = `
        ${getHeaderTemplate()}
        <div class="flex items-center justify-between mb-3 flex-shrink-0 flex-wrap gap-2">
            <div class="flex items-center gap-2 flex-wrap">
                <button type="button" onclick="renderCompatBrandsScreen()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    <span>رجوع للماركات</span>
                </button>
                <button type="button" onclick="renderCompatSheet('${brandKey}', '${brandLabel}')" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 border border-blue-200 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>تحديث</span>
                </button>
                <button type="button" onclick="addCpSheetRow(true)" class="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>إضافة صف</span>
                </button>
                <button type="button" onclick="saveCpSheetToDB()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                    <span>حفظ التعديلات لقاعدة البيانات</span>
                </button>
                <button type="button" id="keyPinBtn" onclick="toggleKeyColumnPin()" class="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    <span id="keyPinLabel">تثبيت العمود المميز</span>
                </button>
                <button type="button" onclick="exportCpSheetToExcel()" class="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>تصدير إلى إكسل</span>
                </button>
            </div>
            <h2 id="cpSheetTitle" class="text-sm sm:text-base font-bold text-gray-800">توافقات ${brandLabel}</h2>
        </div>

        <input id="cpSearchInput" type="text" oninput="cpSheetApplyFilter(this.value)" placeholder="ابحث في اسم الموديل أو أي عمود توافق" class="w-full mb-2 flex-shrink-0 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" dir="auto">
        <div id="cpSearchCount" class="text-xs text-gray-500 mb-1 flex-shrink-0 hidden"></div>

        <div id="cpSheetContainer" class="flex-1 overflow-y-auto p-1 border border-slate-300 rounded-xl bg-white shadow-inner">
            <div class="text-center text-gray-400 text-sm py-8">جاري جلب التوافقات...</div>
        </div>
    `;

    loadDynamicMenuIntoSidebar();

    const sheetContainer = document.getElementById('cpSheetContainer');
    const titleElement = document.getElementById('cpSheetTitle');

    try {
        const { data, error } = await supabaseClient.rpc('get_model_spare_part_compatibility_for_data_center', {
            p_user_id: currentUserId,
            p_brand: brandKey
        });

        if (error) {
            sheetContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">خطأ في جلب البيانات: ${escapeHtmlValue(error.message)}</div>`;
            return;
        }

        let payloadData = data;
        if (typeof payloadData === 'string') {
            try { payloadData = JSON.parse(payloadData); } catch (e) {}
        }

        const rows = payloadData && Array.isArray(payloadData.rows) ? payloadData.rows : [];
        const columns = payloadData && Array.isArray(payloadData.columns) ? payloadData.columns : [];

        if (!columns.length) {
            sheetContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">جدول التوافقات غير موجود لهذه الماركة</div>`;
            return;
        }

        currentCpData = rows;
        currentCpColumns = columns;
        const nameCol = cpNameCol();

        if (titleElement) {
            titleElement.innerText = `توافقات ${brandLabel} (${rows.length})`;
        }

        sheetContainer.innerHTML = `
            <table id="editableUsersTable">
                <thead>
                    <tr>
                        ${columns.map(col => {
                            return sheetThHtml(col, cpColLabel(col));
                        }).join('')}
                        ${sheetIdDupThHtml()}
                        <th class="sheet-actions-th">إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr data-id="${escapeHtmlValue(row.id)}" data-name="${escapeHtmlValue(row[nameCol])}">
                            ${columns.map(col => {
                                const val = row[col] !== null && row[col] !== undefined ? row[col] : '';
                                if (col === nameCol) return cpNameCellHtml(val);
                                if (CP_READONLY_COLS.includes(col)) return sheetReadonlyCellHtml(val);
                                return `
                                    <td class="relative">
                                        ${sheetCellInputHtml(col, val)}
                                        <div class="drag-handle" title="اسحب للتعبئة التلقائية"></div>
                                    </td>
                                `;
                            }).join('')}
                            ${sheetIdDupCellHtml(row.id)}
                            ${cpRowActionsHtml(row.id)}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        const cpTable = document.getElementById('editableUsersTable');
        cpTable.addRowFn = addCpSheetRow;
        applyKeyPinState(cpTable, nameCol);
        enableExcelPasteAndDragFill();
        if (rows.length === 0) addCpSheetRow(false);
    } catch (err) {
        console.error('Compat sheet error:', err);
        sheetContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">حدث خطأ غير متوقع</div>`;
    }
}

function addCpSheetRow(focus = true) {
    // الصف الجديد لسه مالوش id، فخلية الإجراءات بتاعته فاضية. اسم الموديل فيه خانة إدخال عشان يتكتب مرة واحدة
    return appendBlankSheetRow(currentCpColumns, CP_READONLY_COLS, focus, '<td class="sheet-actions"></td>', true);
}

// ---------- البحث في اسم الموديل وأي عمود توافق ----------
// الفلترة بإخفاء الصفوف بس (الخلايا فاضلة في الصفحة)، فالتعديلات ما بتضيعش،
// وزرار الحفظ بيحفظ كل الصفوف حتى المخفية.
function cpSheetApplyFilter(q) {
    const table = document.getElementById('editableUsersTable');
    if (!table) return;

    const norm = v => String(v ?? '').toLowerCase().replace(/\s+/g, '');
    const needle = norm(q);

    let visible = 0;
    let total = 0;

    table.querySelectorAll('tbody tr').forEach(tr => {
        if (!tr.querySelector('.excel-input')) return;

        const haystack = Array.from(tr.querySelectorAll('.excel-input'))
            .filter(i => CP_SEARCH_FIELD_RE.test(i.getAttribute('data-field') || ''))
            .map(i => i.value);
        // اسم الموديل في الصفوف الموجودة مش خانة إدخال، فبناخده من data-name
        haystack.push(tr.getAttribute('data-name') || '');

        total++;
        const match = !needle || haystack.some(v => norm(v).includes(needle));
        tr.style.display = match ? '' : 'none';
        if (match) visible++;
    });

    const count = document.getElementById('cpSearchCount');
    if (count) {
        if (needle) {
            count.textContent = `${visible} من ${total} صف`;
            count.classList.remove('hidden');
        } else {
            count.classList.add('hidden');
        }
    }
}

// ---------- نافذة الإدراج (اسم الموديل) ----------
function closeCpDialog() {
    const old = document.getElementById('cpDialog');
    if (old) old.remove();
}

function insertCpRowAt(position) {
    closeCpDialog();

    const overlay = document.createElement('div');
    overlay.id = 'cpDialog';
    overlay.className = 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4';
    overlay.innerHTML = `
        <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-3 border border-gray-200">
            <h3 class="font-bold text-gray-800 text-sm">إدراج صف جديد في المكان رقم ${position}</h3>
            <p class="text-xs text-gray-500 leading-relaxed">الصف الحالي رقم ${position} وما بعده هينزلوا خطوة. اسم الموديل لازم يكون موجود في جدول موديلات ${escapeHtmlValue(currentCpLabel)}. احفظ أي تعديلات أخرى الأول لأن الشيت هيتحدّث بعد الإدراج.</p>
            <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600">اسم الموديل</label>
                <input id="cpInsertName" type="text" dir="auto" onkeydown="if(event.key==='Enter'){event.preventDefault();submitCpInsert(${position});}" class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="flex items-center gap-2 pt-1">
                <button type="button" onclick="submitCpInsert(${position})" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-sm cursor-pointer">إدراج</button>
                <button type="button" onclick="closeCpDialog()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm cursor-pointer">إلغاء</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('cpInsertName');
    if (input) input.focus();
}

async function submitCpInsert(position) {
    const name = (document.getElementById('cpInsertName')?.value || '').trim();
    if (!name) {
        alert('اسم الموديل مطلوب');
        return;
    }

    try {
        const { data, error } = await supabaseClient.rpc('insert_model_spare_part_compatibility_at_position_for_data_center', {
            p_user_id: currentUserId,
            p_brand: currentCpBrand,
            p_position: position,
            p_payload: { [cpNameCol()]: name }
        });
        if (error) {
            alert('حدث خطأ أثناء الإدراج: ' + error.message);
            return;
        }
        if (!data || !data.success) {
            alert(data?.message || 'فشل الإدراج');
            return;
        }
        closeCpDialog();
        await renderCompatSheet(currentCpBrand, currentCpLabel);
    } catch (err) {
        console.error('Insert compat at position error:', err);
        alert('حدث خطأ غير متوقع أثناء الإدراج');
    }
}

// ---------- حذف صف ----------
async function deleteCpRow(id) {
    const rowData = currentCpData.find(r => String(r.id) === String(id));
    const name = rowData ? rowData[cpNameCol()] : '';
    const label = name ? `"${name}" (رقم ${id})` : `رقم ${id}`;

    if (!confirm(
        `هتحذف توافقات الموديل ${label} نهائياً.\n` +
        `الموديل نفسه في جدول الموديلات مش هيتأثر، والأرقام اللي بعده هترجع خطوة لورا.\n` +
        `الشيت هيتحدّث بعد الحذف، فاحفظ أي تعديلات أخرى الأول. متأكد؟`
    )) return;

    try {
        const { data, error } = await supabaseClient.rpc('delete_model_spare_part_compatibility_at_position_for_data_center', {
            p_user_id: currentUserId,
            p_brand: currentCpBrand,
            p_id: Number(id)
        });
        if (error) {
            alert('حدث خطأ أثناء الحذف: ' + error.message);
            return;
        }
        if (!data || !data.success) {
            alert(data?.message || 'فشل الحذف');
            return;
        }
        await renderCompatSheet(currentCpBrand, currentCpLabel);
    } catch (err) {
        console.error('Delete compat row error:', err);
        alert('حدث خطأ غير متوقع أثناء الحذف');
    }
}

// ---------- حفظ الشيت (تعديل الموجود + إضافة الجديد) ----------
async function saveCpSheetToDB() {
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
            const { data, error } = await supabaseClient.rpc('update_model_spare_part_compatibility_for_data_center', {
                p_user_id: currentUserId,
                p_brand: currentCpBrand,
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
            messages.push(data.message || "تم حفظ التعديلات");
        }

        if (insertPayload.length > 0) {
            const { data, error } = await supabaseClient.rpc('insert_model_spare_part_compatibility_for_data_center', {
                p_user_id: currentUserId,
                p_brand: currentCpBrand,
                p_payload: insertPayload
            });
            if (error) {
                alert((messages.length ? messages.join('\n') + '\n\n' : '') + "حدث خطأ أثناء إضافة الصفوف الجديدة: " + error.message);
                return;
            }
            if (!data || !data.success) {
                alert((messages.length ? messages.join('\n') + '\n\n' : '') + (data?.message || "فشلت إضافة الصفوف الجديدة"));
                return;
            }
            messages.push(data.message || "تمت إضافة الصفوف الجديدة");
        }

        alert(messages.join('\n'));

        // إعادة تحميل الشيت ليظهر الـ id للصفوف الجديدة
        if (insertPayload.length > 0) {
            await renderCompatSheet(currentCpBrand, currentCpLabel);
        }
    } catch (err) {
        console.error("Save compat sheet error:", err);
        alert("حدث خطأ غير متوقع أثناء الحفظ");
    }
}

// ---------- تصدير الشيت (بالقيم الحالية بعد التعديل) إلى XLSX ----------
function exportCpSheetToExcel() {
    const table = document.getElementById('editableUsersTable');
    if (!table) {
        alert("لا توجد بيانات للتصدير حالياً");
        return;
    }

    // عمود/خلايا الإجراءات مش بتتصدّر، والعناوين بأسماء الأعمدة الحقيقية
    const headers = Array.from(table.querySelectorAll('thead th[data-col]')).map(th => th.getAttribute('data-col'));
    const rowsData = [];
    table.querySelectorAll('tbody tr').forEach(row => {
        if (!row.hasAttribute('data-id') && !Array.from(row.querySelectorAll('.excel-input')).some(i => i.value.trim() !== '')) return;
        rowsData.push(Array.from(row.querySelectorAll('td:not(.sheet-actions):not(.sheet-id-dup)')).map(td => {
            const input = td.querySelector('.excel-input');
            return input ? input.value : td.innerText.trim();
        }));
    });

    const worksheet =
