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

        if (usersList.length > 0) {
            const sampleObj = usersList[0];
            const columns = Object.keys(sampleObj);

            sheetContainer.innerHTML = `
                <table id="editableUsersTable">
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${col}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${usersList.map((user, idx) => `
                            <tr data-id="${user.id}">
                                ${columns.map(col => {
                                    const val = user[col] !== null && user[col] !== undefined ? user[col] : '';
                                    const isId = (col === 'id' || col === 'created_at' || col === 'last_active_at');
                                    if (isId) {
                                        return `<td class="p-2 font-mono text-slate-500 text-xs whitespace-nowrap min-w-[150px]" dir="ltr">${val}</td>`;
                                    }
                                    return `
                                        <td class="min-w-[160px] h-[38px] relative">
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
            document.getElementById('editableUsersTable').addRowFn = addUsersSheetRow;
            enableExcelPasteAndDragFill();

        } else {
            sheetContainer.innerHTML = `<div class="text-center text-gray-500 py-12">لا توجد بيانات مستخدمين متاحة</div>`;
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

    // 1. عناوين الأعمدة
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());

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
    return `<textarea rows="1" wrap="off" data-field="${escapeHtmlValue(col)}" class="excel-input" dir="auto" style="resize:none;overflow:hidden;display:block;white-space:nowrap;font-family:inherit;line-height:1.5;height:38px">${escapeHtmlValue(val)}</textarea>`;
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
            }
        });
    });
}

// ================= ميزات الإكسل (اللصق المتعدد والسحب للتعبئة) =================
function enableExcelPasteAndDragFill() {
    const table = document.getElementById('editableUsersTable');
    if (!table) return;

    const inputs = table.querySelectorAll('.excel-input');

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
const MODELS_SHEET_READONLY_COLS = ['id', 'created_at', 'updated_at'];
let currentUsersSheetColumns = [];
const USERS_SHEET_READONLY_COLS = ['id', 'created_at', 'last_active_at'];

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
                <button type="button" onclick="exportModelsSheetToExcel()" class="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>تصدير إلى إكسل</span>
                </button>
            </div>
            <h2 id="modelsSheetTitle" class="text-sm sm:text-base font-bold text-gray-800">جدول موديلات ${brandLabel}</h2>
        </div>

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

        sheetContainer.innerHTML = `
            <table id="editableUsersTable">
                <thead>
                    <tr>
                        ${columns.map(col => `<th>${escapeHtmlValue(col)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${modelsList.map(row => `
                        <tr data-id="${escapeHtmlValue(row.id)}">
                            ${columns.map(col => {
                                const val = row[col] !== null && row[col] !== undefined ? row[col] : '';
                                if (readOnlyCols.includes(col)) {
                                    return `<td class="p-2 font-mono text-slate-500 text-xs whitespace-nowrap min-w-[150px]" dir="ltr">${escapeHtmlValue(val)}</td>`;
                                }
                                return `
                                    <td class="min-w-[160px] h-[38px] relative">
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

        currentModelsSheetColumns = columns;
        document.getElementById('editableUsersTable').addRowFn = addModelsSheetRow;
        enableExcelPasteAndDragFill();
        if (modelsList.length === 0) addModelsSheetRow(false);
    } catch (err) {
        console.error("Models sheet error:", err);
        sheetContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">حدث خطأ غير متوقع</div>`;
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
function appendBlankSheetRow(columns, readOnlyCols, focus = true) {
    const table = document.getElementById('editableUsersTable');
    if (!table) return null;
    const tbody = table.querySelector('tbody');

    const tr = document.createElement('tr');
    tr.setAttribute('data-new', '1');
    tr.innerHTML = columns.map(col => {
        if (readOnlyCols.includes(col)) {
            return `<td class="p-2 font-mono text-slate-400 text-xs whitespace-nowrap min-w-[150px] text-center" dir="ltr">جديد</td>`;
        }
        return `
            <td class="min-w-[160px] h-[38px] relative">
                ${sheetCellInputHtml(col, '')}
                <div class="drag-handle" title="اسحب للتعبئة التلقائية"></div>
            </td>
        `;
    }).join('');
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
    return appendBlankSheetRow(currentModelsSheetColumns, MODELS_SHEET_READONLY_COLS, focus);
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
            const { data, error } = await supabaseClient.rpc(`update_${currentModelsSheetBrand}_models_for_data_center`, {
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
            messages.push(data.message || "تم حفظ التعديلات");
        }

        if (insertPayload.length > 0) {
            const { data, error } = await supabaseClient.rpc(`insert_${currentModelsSheetBrand}_models_for_data_center`, {
                p_user_id: currentUserId,
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

// ---------- تصدير شيت الموديلات (بالقيم الحالية بعد التعديل) إلى XLSX ----------
function exportModelsSheetToExcel() {
    const table = document.getElementById('editableUsersTable');
    if (!table) {
        alert("لا توجد بيانات للتصدير حالياً");
        return;
    }

    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
    const rowsData = [];
    table.querySelectorAll('tbody tr').forEach(row => {
        if (!row.hasAttribute('data-id') && !Array.from(row.querySelectorAll('.excel-input')).some(i => i.value.trim() !== '')) return;
        rowsData.push(Array.from(row.querySelectorAll('td')).map(td => {
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
