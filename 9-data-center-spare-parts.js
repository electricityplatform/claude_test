// مركز البيانات (9) - جدول قطع الغيار

// =====================================================================
// ================= جدول قطع الغيار في مركز البيانات =================
// الجدول: spare_parts (id + spare_part_items + created_at)
// الدوال في الداتابيز (مشتركة): get / update / insert / insert_at_position / delete_at_position
// بنبعت p_table = 'spare_parts'
// =====================================================================
const SPARE_PARTS_TABLE = 'spare_parts';
const SPARE_PARTS_NAME_COL = 'spare_part_items';
const SPARE_PARTS_READONLY_COLS = ['id', 'created_at', 'updated_at'];

let currentSparePartsColumns = [];
let currentSparePartsData = [];

function sparePartsColLabel(col) {
    if (col === 'created_at') return 'تاريخ الانشاء';
    if (col === SPARE_PARTS_NAME_COL) return 'اسم قطعة الغيار';
    return '';
}

// ---------- أزرار الصف (إدراج قبله / حذف) ----------
function sparePartsRowActionsHtml(id) {
    const n = Number(id);
    if (!Number.isFinite(n)) return '<td class="sheet-actions"></td>';
    return `
        <td class="sheet-actions">
            <div class="flex items-center gap-1 px-2 py-1 whitespace-nowrap">
                <button type="button" onclick="insertSparePartsRowAt(${n})" title="إدراج صف جديد في مكان هذا الصف (وهو وما بعده ينزلوا خطوة)" class="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer">+ إدراج</button>
                <button type="button" onclick="deleteSparePartsRow(${n})" title="حذف هذا الصف" class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer">حذف</button>
            </div>
        </td>`;
}

// ---------- شيت جدول قطع الغيار ----------
// بنستخدم نفس id الشيت (editableUsersTable) عشان نفس التنسيق واللصق الجماعي والسحب للتعبئة
async function renderSparePartsSheet() {
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
                <button type="button" onclick="renderSparePartsSheet()" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 border border-blue-200 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>تحديث</span>
                </button>
                <button type="button" onclick="addSparePartsSheetRow(true)" class="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>إضافة صف</span>
                </button>
                <button type="button" onclick="saveSparePartsSheetToDB()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                    <span>حفظ التعديلات لقاعدة البيانات</span>
                </button>
                <button type="button" onclick="exportSparePartsSheetToExcel()" class="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>تصدير إلى إكسل</span>
                </button>
            </div>
            <h2 id="sparePartsSheetTitle" class="text-sm sm:text-base font-bold text-gray-800">جدول قطع الغيار</h2>
        </div>

        <input id="sparePartsSearchInput" type="text" oninput="sparePartsSheetApplyFilter(this.value)" placeholder="ابحث في اسم قطعة الغيار" class="w-full mb-2 flex-shrink-0 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" dir="auto">
        <div id="sparePartsSearchCount" class="text-xs text-gray-500 mb-1 flex-shrink-0 hidden"></div>

        <div id="sparePartsSheetContainer" class="flex-1 overflow-y-auto p-1 border border-slate-300 rounded-xl bg-white shadow-inner">
            <div class="text-center text-gray-400 text-sm py-8">جاري جلب البيانات...</div>
        </div>
    `;

    loadDynamicMenuIntoSidebar();

    const sheetContainer = document.getElementById('sparePartsSheetContainer');
    const titleElement = document.getElementById('sparePartsSheetTitle');

    try {
        const { data, error } = await supabaseClient.rpc('get_lookup_table_for_data_center', {
            p_user_id: currentUserId,
            p_table: SPARE_PARTS_TABLE
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
            sheetContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">الجدول غير موجود</div>`;
            return;
        }

        currentSparePartsData = rows;
        currentSparePartsColumns = columns;

        if (titleElement) {
            titleElement.innerText = `جدول قطع الغيار (${rows.length})`;
        }

        sheetContainer.innerHTML = `
            <table id="editableUsersTable">
                <thead>
                    <tr>
                        ${columns.map(col => sheetThHtml(col, sparePartsColLabel(col))).join('')}
                        <th class="sheet-actions-th">إجراءات</th>
                        ${sheetIdDupThHtml()}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr data-id="${escapeHtmlValue(row.id)}">
                            ${columns.map(col => {
                                const val = row[col] !== null && row[col] !== undefined ? row[col] : '';
                                if (SPARE_PARTS_READONLY_COLS.includes(col)) {
                                    return sheetReadonlyCellHtml(val);
                                }
                                return `
                                    <td class="relative">
                                        ${sheetCellInputHtml(col, val)}
                                        <div class="drag-handle" title="اسحب للتعبئة التلقائية"></div>
                                    </td>
                                `;
                            }).join('')}
                            ${sparePartsRowActionsHtml(row.id)}
                            ${sheetIdDupCellHtml(row.id)}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('editableUsersTable').addRowFn = addSparePartsSheetRow;
        enableExcelPasteAndDragFill();
        if (rows.length === 0) addSparePartsSheetRow(false);
    } catch (err) {
        console.error('spare_parts sheet error:', err);
        sheetContainer.innerHTML = `<div class="text-center text-red-400 text-sm py-8">حدث خطأ غير متوقع</div>`;
    }
}

function addSparePartsSheetRow(focus = true) {
    // الصف الجديد لسه مالوش id، فخلية الإجراءات بتاعته فاضية
    return appendBlankSheetRow(currentSparePartsColumns, SPARE_PARTS_READONLY_COLS, focus, '<td class="sheet-actions"></td>', true);
}

// ---------- البحث في اسم قطعة الغيار ----------
// الفلترة بإخفاء الصفوف بس (الخلايا فاضلة في الصفحة)، فالتعديلات ما بتضيعش،
// وزرار الحفظ بيحفظ كل الصفوف حتى المخفية.
function sparePartsSheetApplyFilter(q) {
    const table = document.getElementById('editableUsersTable');
    if (!table) return;

    const norm = v => String(v ?? '').toLowerCase().replace(/\s+/g, '');
    const needle = norm(q);

    let visible = 0;
    let total = 0;

    table.querySelectorAll('tbody tr').forEach(tr => {
        if (!tr.querySelector('.excel-input')) return;

        const inputs = Array.from(tr.querySelectorAll('.excel-input'))
            .filter(i => (i.getAttribute('data-field') || '') === SPARE_PARTS_NAME_COL);

        total++;
        const match = !needle || inputs.some(i => norm(i.value).includes(needle));
        tr.style.display = match ? '' : 'none';
        if (match) visible++;
    });

    const count = document.getElementById('sparePartsSearchCount');
    if (count) {
        if (needle) {
            count.textContent = `${visible} من ${total} صف`;
            count.classList.remove('hidden');
        } else {
            count.classList.add('hidden');
        }
    }
}

// ---------- نافذة الإدراج (اسم العنصر الجديد) ----------
function closeSparePartsDialog() {
    const old = document.getElementById('sparePartsDialog');
    if (old) old.remove();
}

function insertSparePartsRowAt(position) {
    closeSparePartsDialog();

    const overlay = document.createElement('div');
    overlay.id = 'sparePartsDialog';
    overlay.className = 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4';
    overlay.innerHTML = `
        <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-3 border border-gray-200">
            <h3 class="font-bold text-gray-800 text-sm">إدراج صف جديد في المكان رقم ${position}</h3>
            <p class="text-xs text-gray-500 leading-relaxed">الصف الحالي رقم ${position} وما بعده هينزلوا خطوة. احفظ أي تعديلات أخرى الأول لأن الشيت هيتحدّث بعد الإدراج.</p>
            <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600">اسم قطعة الغيار</label>
                <input id="sparePartsInsertVal" type="text" dir="auto" onkeydown="if(event.key==='Enter'){event.preventDefault();submitSparePartsInsert(${position});}" class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="flex items-center gap-2 pt-1">
                <button type="button" onclick="submitSparePartsInsert(${position})" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-sm cursor-pointer">إدراج</button>
                <button type="button" onclick="closeSparePartsDialog()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm cursor-pointer">إلغاء</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('sparePartsInsertVal');
    if (input) input.focus();
}

async function submitSparePartsInsert(position) {
    const val = (document.getElementById('sparePartsInsertVal')?.value || '').trim();

    if (!val) {
        alert('اسم قطعة الغيار مطلوب');
        return;
    }

    try {
        const { data, error } = await supabaseClient.rpc('insert_lookup_table_at_position_for_data_center', {
            p_user_id: currentUserId,
            p_table: SPARE_PARTS_TABLE,
            p_position: position,
            p_payload: { [SPARE_PARTS_NAME_COL]: val }
        });
        if (error) {
            alert('حدث خطأ أثناء الإدراج: ' + error.message);
            return;
        }
        if (!data || !data.success) {
            alert(data?.message || 'فشل الإدراج');
            return;
        }
        closeSparePartsDialog();
        await renderSparePartsSheet();
    } catch (err) {
        console.error('Insert spare_parts at position error:', err);
        alert('حدث خطأ غير متوقع أثناء الإدراج');
    }
}

// ---------- حذف صف ----------
async function deleteSparePartsRow(id) {
    const rowData = currentSparePartsData.find(r => String(r.id) === String(id));
    const firstVal = rowData ? rowData[SPARE_PARTS_NAME_COL] : '';
    const label = firstVal ? `"${firstVal}" (رقم ${id})` : `رقم ${id}`;

    if (!confirm(
        `هتحذف الصف ${label} نهائياً.\n` +
        `الأرقام اللي بعده هترجع خطوة لورا.\n` +
        `الشيت هيتحدّث بعد الحذف، فاحفظ أي تعديلات أخرى الأول. متأكد؟`
    )) return;

    try {
        const { data, error } = await supabaseClient.rpc('delete_lookup_table_at_position_for_data_center', {
            p_user_id: currentUserId,
            p_table: SPARE_PARTS_TABLE,
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
        await renderSparePartsSheet();
    } catch (err) {
        console.error('Delete spare_parts row error:', err);
        alert('حدث خطأ غير متوقع أثناء الحذف');
    }
}

// ---------- حفظ الشيت (تعديل الموجود + إضافة الجديد) ----------
async function saveSparePartsSheetToDB() {
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
            const { data, error } = await supabaseClient.rpc('update_lookup_table_for_data_center', {
                p_user_id: currentUserId,
                p_table: SPARE_PARTS_TABLE,
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
            const { data, error } = await supabaseClient.rpc('insert_lookup_table_for_data_center', {
                p_user_id: currentUserId,
                p_table: SPARE_PARTS_TABLE,
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
            await renderSparePartsSheet();
        }
    } catch (err) {
        console.error("Save spare_parts sheet error:", err);
        alert("حدث خطأ غير متوقع أثناء الحفظ");
    }
}

// ---------- تصدير الشيت (بالقيم الحالية بعد التعديل) إلى XLSX ----------
function exportSparePartsSheetToExcel() {
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
    XLSX.utils.book_append_sheet(workbook, worksheet, SPARE_PARTS_TABLE);

    const fileName = `${SPARE_PARTS_TABLE}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}
