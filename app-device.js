// app-device.js — بيجهّز window.APP_DEVICE لما الموقع يتفتح جوه أبليكيشن (Electron على ويندوز / Capacitor على أندرويد وآيفون).
// في المتصفح العادي مبيعملش حاجة، و auth.js بيكمل بالطريقة العادية.
// auth.js بيستنى window.APP_DEVICE_READY قبل ما يبعت الدخول.
(function () {
    // معرّفات الآيفون الداخلية (اللي النظام بيرجّعها) ← اسم الجهاز. المعرّف اللي مش هنا بيتسجّل كود بس، من غير اسم.
    const IOS_NAMES = {
        'iPhone10,1': 'Apple iPhone 8',
        'iPhone10,4': 'Apple iPhone 8',
        'iPhone10,2': 'Apple iPhone 8 Plus',
        'iPhone10,5': 'Apple iPhone 8 Plus',
        'iPhone10,3': 'Apple iPhone X',
        'iPhone10,6': 'Apple iPhone X',
        'iPhone11,2': 'Apple iPhone XS',
        'iPhone11,4': 'Apple iPhone XS Max',
        'iPhone11,6': 'Apple iPhone XS Max',
        'iPhone11,8': 'Apple iPhone XR',
        'iPhone12,1': 'Apple iPhone 11',
        'iPhone12,3': 'Apple iPhone 11 Pro',
        'iPhone12,5': 'Apple iPhone 11 Pro Max',
        'iPhone12,8': 'Apple iPhone SE (2nd generation)',
        'iPhone13,1': 'Apple iPhone 12 mini',
        'iPhone13,2': 'Apple iPhone 12',
        'iPhone13,3': 'Apple iPhone 12 Pro',
        'iPhone13,4': 'Apple iPhone 12 Pro Max',
        'iPhone14,4': 'Apple iPhone 13 mini',
        'iPhone14,5': 'Apple iPhone 13',
        'iPhone14,2': 'Apple iPhone 13 Pro',
        'iPhone14,3': 'Apple iPhone 13 Pro Max',
        'iPhone14,6': 'Apple iPhone SE (3rd generation)',
        'iPhone14,7': 'Apple iPhone 14',
        'iPhone14,8': 'Apple iPhone 14 Plus',
        'iPhone15,2': 'Apple iPhone 14 Pro',
        'iPhone15,3': 'Apple iPhone 14 Pro Max',
        'iPhone15,4': 'Apple iPhone 15',
        'iPhone15,5': 'Apple iPhone 15 Plus',
        'iPhone16,1': 'Apple iPhone 15 Pro',
        'iPhone16,2': 'Apple iPhone 15 Pro Max',
        'iPhone17,3': 'Apple iPhone 16',
        'iPhone17,4': 'Apple iPhone 16 Plus',
        'iPhone17,1': 'Apple iPhone 16 Pro',
        'iPhone17,2': 'Apple iPhone 16 Pro Max',
        'iPhone17,5': 'Apple iPhone 16e'
    };

    function clean(v) {
        return String(v == null ? '' : v).trim().slice(0, 100) || null;
    }

    window.APP_DEVICE_READY = (async function () {
        try {
            // ---- Electron (ويندوز / ماك / لينكس) ----
            if (window.electronDevice && window.electronDevice.getInfo) {
                const i = await window.electronDevice.getInfo();
                window.APP_DEVICE = { type: clean(i.type), name: clean(i.name), code: null };
                return;
            }
            // ---- Capacitor (أندرويد / آيفون) ----
            const cap = window.Capacitor;
            if (cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins && cap.Plugins.Device) {
                const i = await cap.Plugins.Device.getInfo();
                const model = clean(i.model);
                if (i.platform === 'ios') {
                    const hasId = model && /^(iPhone|iPad|iPod)\d+,\d+$/.test(model);
                    window.APP_DEVICE = {
                        type: /^iPad/.test(model || '') ? 'iPad' : 'iPhone',
                        name: hasId ? (IOS_NAMES[model] || null) : null,
                        code: hasId ? model : null
                    };
                } else {
                    // أندرويد: الكود بس. الماركة والاسم بيجيبهم الـ SQL من جداول الموديلات.
                    window.APP_DEVICE = { code: model, name: null };
                }
            }
        } catch (e) {
            console.warn('app-device: تعذّر قراءة بيانات الجهاز', e);
        }
    })();
})();
