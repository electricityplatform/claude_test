// مسار الرحلة الحالية: 'buy' (شراء قطع الغيار) أو 'alerts' (تنبيهات الصيانة)
let currentFlow = 'buy';

// بداية رحلة تنبيهات الصيانة: الماركات ← الموديلات ← قطع الغيار ← التنبيه
function startMaintenanceAlertsFlow() {
    currentFlow = 'alerts';
    selectedPart = '';
    renderBrandsScreen('تنبيهات الصيانة');
}

// ================= الشاشة الرئيسية =================
async function renderMainDashboard() {
    currentFlow = 'buy';
    const html = `
        ${getHeaderTemplate()}
        <div class="flex-1 overflow-y-auto space-y-4 px-1">
            <div class="mb-4">
                <img src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80" alt="Banner" class="w-full h-36 sm:h-48 object-cover rounded-2xl shadow-md">
            </div>
            <div id="partitionsContainer" class="space-y-3.5 pb-4">
                <div class="text-center text-gray-400 text-sm py-4">جاري تحميل الأقسام...</div>
            </div>
        </div>
    `;
    document.getElementById('appContainer').innerHTML = html;
    loadDynamicMenuIntoSidebar();

    try {
        const { data, error } = await supabaseClient.rpc('get_partitions');

        if (error) {
            showSystemAlert("فشل جلب الأقسام", currentUserId || "غير معروف", "قاعدة البيانات", error.message);
            document.getElementById('partitionsContainer').innerHTML = `<div class="text-center text-red-400 text-sm py-4">تعذر تحميل الأقسام</div>`;
            return;
        }

        let partitionsList = [];
        if (Array.isArray(data)) {
            partitionsList = data;
        } else if (typeof data === 'string') {
            try { partitionsList = JSON.parse(data); } catch(e){}
        }

        const container = document.getElementById('partitionsContainer');
        if (container && partitionsList && partitionsList.length > 0) {
            let partitionsHtml = partitionsList.map(name => {
                let clickAction = "";
                if (name.includes('تنبيهات الصيانة')) {
                    clickAction = "startMaintenanceAlertsFlow()";
                } else if (name.includes('شراء قطع الغيار')) {
                    clickAction = "renderBrandsScreen()";
                } else if (name.includes('قطع الغيار')) {
                    clickAction = "renderPartsScreen()";
                } else if (name.includes('الماركات')) {
                    clickAction = "renderBrandsScreen()";
                } else if (name.includes('الموديلات')) {
                    clickAction = "renderModelsScreen('Samsung')";
                } else {
                    clickAction = `alert(${jsArg('قسم ' + name)})`;
                }

                return `
                    <div onclick="${clickAction}" class="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 sm:p-6 rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-between">
                        <span class="font-bold text-lg sm:text-xl" dir="auto">${escapeHtmlValue(name)}</span>
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    </div>
                `;
            }).join('');

            container.innerHTML = partitionsHtml;
        } else {
            container.innerHTML = `<div class="text-center text-gray-400 text-sm py-4">لا توجد أقسام متاحة</div>`;
        }
    } catch (err) {
        showSystemAlert("استثناء غير متوقع", currentUserId || "غير معروف", "تنفيذ JavaScript", err.message);
    }
}

// ================= شاشة الماركات =================
async function renderBrandsScreen(partName = '') {
    if (partName) selectedPart = partName;

    document.getElementById('appContainer').innerHTML = `
        ${getHeaderTemplate(true)}
        <div class="flex items-center justify-between mb-4 flex-shrink-0">
            <button onclick="renderMainDashboard()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                <span>رجوع</span>
            </button>
            <h2 class="text-sm sm:text-base font-bold text-gray-800">اختر الماركة (${escapeHtmlValue(selectedPart || 'شراء قطع الغيار')})</h2>
        </div>
        <div id="brandsListContainer" class="flex-1 overflow-y-auto space-y-3 p-1">
            <div class="text-center text-gray-400 text-sm py-8">جاري جلب الماركات...</div>
        </div>
    `;

    loadDynamicMenuIntoSidebar();

    let brands = [];
    try {
        const { data, error } = await supabaseClient.rpc('get_brands');

        if (error) {
            showSystemAlert("فشل جلب الماركات", currentUserId || "غير معروف", "دالة get_brands", error.message);
        } else if (data) {
            brands = data;
        }
    } catch (err) {
        showSystemAlert("استثناء في جلب الماركات", currentUserId || "غير معروف", "تنفيذ RPC", err.message);
    }

    const container = document.getElementById('brandsListContainer');
    if (!container) return;

    if (brands.length > 0) {
        container.innerHTML = brands.map((brand, index) => {
            const style = getRotatingCardStyle(index);
            return `
                <div onclick="renderModelsScreen(${jsArg(brand)})" class="w-full ${style.bg} border ${style.border} p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all text-sm sm:text-base group">
                    <span class="font-bold text-gray-800" dir="auto">${escapeHtmlValue(brand)}</span>
                    <svg class="w-5 h-5 ${style.icon} flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </div>
            `;
        }).join('');
    } else {
        container.innerHTML = `<div class="text-center text-gray-500 py-6">لا توجد ماركات متاحة حالياً</div>`;
    }
}

// ================= شاشة الموديلات =================
async function renderModelsScreen(brand) {
    selectedBrand = brand;

    // الموديلات بتتجاب من قاعدة البيانات بس (نفس دالة جداول الموديلات في مركز البيانات)
    const brandSlug = (typeof sdcBrandSlug === 'function') ? sdcBrandSlug(brand) : '';
    let models = [];
    let modelsError = '';

    if (!brandSlug) {
        modelsError = 'الماركة غير معروفة: ' + brand;
    } else {
        try {
            const { data, error } = await supabaseClient.rpc('get_models_for_data_center', {
                p_user_id: currentUserId,
                p_brand: brandSlug
            });
            if (error) {
                modelsError = error.message;
            } else {
                let payload = data;
                if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) {} }
                const rows = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.rows) ? payload.rows : []);
                const cols = (payload && Array.isArray(payload.columns) && payload.columns.length)
                    ? payload.columns
                    : (rows[0] ? Object.keys(rows[0]) : []);
                const nameCol = cols.find(c => /_model_names$/.test(c));
                const codeCol = cols.find(c => /_model_codes$/.test(c));
                const batCol = cols.find(c => /_battery_codes$/.test(c));
                if (nameCol) {
                    models = rows
                        .filter(r => r[nameCol] !== null && r[nameCol] !== undefined && String(r[nameCol]).trim() !== '')
                        .map(r => ({
                            device_name: r[nameCol],
                            model_code: codeCol ? r[codeCol] : null,
                            screen_compatibility: null,
                            battery_model: batCol ? r[batCol] : null
                        }));
                } else {
                    modelsError = 'عمود اسم الموديل غير موجود في الرد';
                }
            }
        } catch (err) {
            modelsError = err.message;
        }
    }

    let modelsHtml = "";
    if (models.length > 0) {
        modelsHtml = models.map((m, index) => {
            const style = getRotatingCardStyle(index);
            const escapedCompat = m.screen_compatibility ? encodeURIComponent(m.screen_compatibility) : '';
            const escapedBattery = m.battery_model ? encodeURIComponent(m.battery_model) : '';
            const escapedCode = m.model_code ? encodeURIComponent(m.model_code) : '';
            return `
                <div onclick="renderPartsScreenAfterModel(${jsArg(m.device_name)}, ${jsArg(escapedCode)}, ${jsArg(escapedCompat)}, ${jsArg(escapedBattery)})" class="w-full ${style.bg} border ${style.border} p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all text-sm sm:text-base group">
                    <div class="text-right">
                        <span class="font-bold text-gray-800 block" dir="auto">${escapeHtmlValue(m.device_name)}</span>
                        ${m.model_code ? `<span class="text-xs text-gray-500 block mt-0.5" dir="auto">الكود: ${escapeHtmlValue(m.model_code)}</span>` : ''}
                    </div>
                    <svg class="w-5 h-5 ${style.icon} flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </div>
            `;
        }).join('');
    } else {
        modelsHtml = `<div class="text-center text-gray-500 py-6">لا توجد موديلات متاحة${modelsError ? `<div class="text-red-400 text-xs mt-2" dir="ltr">${escapeHtmlValue(modelsError)}</div>` : ''}</div>`;
    }

    const html = `
        ${getHeaderTemplate(true)}
        <div class="flex items-center justify-between mb-4 flex-shrink-0">
            <button onclick="renderBrandsScreen()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                <span>رجوع</span>
            </button>
            <h2 class="text-sm sm:text-base font-bold text-gray-800">اختر موديل (${escapeHtmlValue(brand)})</h2>
        </div>
        <div class="flex-1 overflow-y-auto space-y-3 p-1">
            ${modelsHtml}
        </div>
    `;
    document.getElementById('appContainer').innerHTML = html;
    loadDynamicMenuIntoSidebar();
}

// ================= شاشة قطع الغيار بعد اختيار الموديل =================
async function renderPartsScreenAfterModel(modelName = '', modelCode = '', screenCompat = '', batteryModel = '') {
    selectedModel = modelName;
    selectedModelCode = modelCode ? decodeURIComponent(modelCode) : '';
    currentScreenCompatibility = screenCompat ? decodeURIComponent(screenCompat) : '';
    currentBatteryModel = batteryModel ? decodeURIComponent(batteryModel) : '';

    document.getElementById('appContainer').innerHTML = `
        ${getHeaderTemplate(true)}
        <div class="flex items-center justify-between mb-4 flex-shrink-0">
            <button onclick="renderModelsScreen(${jsArg(selectedBrand)})" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                <span>رجوع</span>
            </button>
            <h2 class="text-sm sm:text-base font-bold text-gray-800">اختر قطعة الغيار (${escapeHtmlValue(selectedModel)})</h2>
        </div>
        <div id="partsListContainerAfter" class="flex-1 overflow-y-auto space-y-3 p-1">
            <div class="text-center text-gray-400 text-sm py-8">جاري جلب قطع الغيار...</div>
        </div>
    `;

    loadDynamicMenuIntoSidebar();

    let sparePartsList = [];
    try {
        const { data, error } = await supabaseClient.rpc('get_spare_parts');

        if (error) {
            showSystemAlert("فشل جلب قطع الغيار", currentUserId || "غير معروف", "دالة get_spare_parts", error.message);
        } else if (data) {
            sparePartsList = data;
        }
    } catch (err) {
        showSystemAlert("استثناء في جلب قطع الغيار", currentUserId || "غير معروف", "تنفيذ RPC", err.message);
    }

    const container = document.getElementById('partsListContainerAfter');
    if (!container) return;

    if (sparePartsList.length > 0) {
        container.innerHTML = sparePartsList.map((part, index) => {
            const style = getRotatingCardStyle(index);
            return `
                <div onclick="renderPartDetailsFinal(${jsArg(part)})" class="w-full ${style.bg} border ${style.border} p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all text-sm sm:text-base group">
                    <span class="font-bold text-gray-800 text-right flex-1 ml-3" dir="auto">${escapeHtmlValue(part)}</span>
                    <svg class="w-5 h-5 ${style.icon} flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </div>
            `;
        }).join('');
    } else {
        container.innerHTML = `<div class="text-center text-gray-500 py-6">لا توجد قطع غيار متاحة حالياً</div>`;
    }
}

async function renderPartDetailsFinal(partName = '') {
    selectedPart = partName;
    if (currentFlow === 'alerts') {
        renderMaintenanceAlertScreen(partName);
        return;
    }
    alert(`بيانات الشراء النهائية:\n- الماركة: ${selectedBrand}\n- الموديل: ${selectedModel}\n- الكود: ${selectedModelCode}\n- قطعة الغيار: ${selectedPart}`);
}


// ================= شاشة تنبيه الصيانة (الموديل + قطعة الغيار) =================
// بتجيب جدول تنبيهات الماركة، وتدوّر على صف الموديل المختار، وتعرض عمود القطعة المختارة بس.
function maintAlertsNorm(v) {
    return String(v ?? '').toLowerCase().replace(/\s+/g, '');
}

async function renderMaintenanceAlertScreen(partName = '') {
    const slug = (typeof sdcBrandSlug === 'function') ? sdcBrandSlug(selectedBrand) : '';
    const partKey = (typeof sdcPartSuffix === 'function') ? sdcPartSuffix(partName) : '';

    const backAction = `renderPartsScreenAfterModel(${jsArg(selectedModel)}, ${jsArg(encodeURIComponent(selectedModelCode || ''))}, ${jsArg(encodeURIComponent(currentScreenCompatibility || ''))}, ${jsArg(encodeURIComponent(currentBatteryModel || ''))})`;

    document.getElementById('appContainer').innerHTML = `
        ${getHeaderTemplate(true)}
        <div class="flex items-center justify-between mb-4 flex-shrink-0">
            <button onclick="${backAction}" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                <span>رجوع</span>
            </button>
            <h2 class="text-sm sm:text-base font-bold text-gray-800">تنبيهات الصيانة</h2>
        </div>
        <div id="maintAlertBox" class="flex-1 overflow-y-auto space-y-3 p-1">
            <div class="text-center text-gray-400 text-sm py-8">جاري جلب التنبيه...</div>
        </div>
    `;
    loadDynamicMenuIntoSidebar();

    const box = document.getElementById('maintAlertBox');
    const msg = (text, color = 'text-gray-500') => {
        if (box) box.innerHTML = `<div class="text-center ${color} text-sm py-8">${escapeHtmlValue(text)}</div>`;
    };

    if (!slug) { msg('الماركة غير معروفة لجدول التنبيهات'); return; }
    if (!partKey) { msg(`قطعة الغيار "${partName}" غير مربوطة بعمود تنبيهات`); return; }

    try {
        const { data, error } = await supabaseClient.rpc('get_brand_model_spare_part_maintenance_alerts_for_data_center', {
            p_user_id: currentUserId,
            p_brand: slug
        });
        if (error) { msg('خطأ في جلب التنبيهات: ' + error.message, 'text-red-400'); return; }

        let payload = data;
        if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) {} }
        const rows = payload && Array.isArray(payload.rows) ? payload.rows : [];
        const columns = payload && Array.isArray(payload.columns) ? payload.columns : [];
        if (!columns.length) { msg('جدول التنبيهات غير موجود لهذه الماركة'); return; }

        const nameCol = `${slug}_model_names`;
        const alertCol = columns.find(col => {
            if (col === nameCol || col === 'id' || col === 'created_at' || col === 'updated_at') return false;
            const key = String(col)
                .replace(`${slug}_model_`, '')
                .replace(/_spare_part_maintenance_alerts$/, '')
                .replace(/_maintenance_alerts$/, '')
                .replace(/_alerts$/, '');
            return key === partKey;
        });
        if (!alertCol) { msg(`لا يوجد عمود تنبيهات للقطعة "${partName}"`); return; }

        // صف الموديل: تطابق تام على اسم الموديل
        const target = maintAlertsNorm(selectedModel);
        const row = rows.find(r => maintAlertsNorm(r[nameCol]) === target);

        const alertText = row && row[alertCol] !== null && row[alertCol] !== undefined ? String(row[alertCol]).trim() : '';

        box.innerHTML = `
            <div class="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl shadow-sm">
                <div class="text-xs text-gray-500 mb-1">الموديل</div>
                <div class="font-bold text-gray-800 mb-3" dir="auto">${escapeHtmlValue(selectedModel)}</div>
                <div class="text-xs text-gray-500 mb-1">قطعة الغيار</div>
                <div class="font-bold text-gray-800" dir="auto">${escapeHtmlValue(partName)}</div>
            </div>
            <div class="w-full bg-blue-50 border border-blue-200 p-4 rounded-2xl shadow-sm">
                <div class="text-xs font-bold text-blue-700 mb-2">تنبيهات صيانة ${escapeHtmlValue(partName)}</div>
                ${alertText
                    ? `<div class="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap" dir="auto">${escapeHtmlValue(alertText)}</div>`
                    : `<div class="text-sm text-gray-500">${row ? 'لا توجد تنبيهات صيانة لهذه القطعة' : 'هذا الموديل غير موجود في جدول التنبيهات'}</div>`}
            </div>
        `;
    } catch (err) {
        console.error('Maintenance alert error:', err);
        msg('حدث خطأ غير متوقع', 'text-red-400');
    }
}
