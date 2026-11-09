const { contextBridge, ipcRenderer } = require('electron');

// بيدّي الصفحة طريقة تسأل بيها عن نوع الجهاز (app-device.js بيستخدمها)
contextBridge.exposeInMainWorld('electronDevice', {
    getInfo: () => ipcRenderer.invoke('device-info')
});
