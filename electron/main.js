const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { execFile } = require('child_process');

// ويندوز: الشركة المصنّعة + الموديل من النظام (WMI). القيم الفاضية أو الوهمية زي "System Product Name" بتتتجاهل.
function getWindowsModel() {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') return resolve(null);
        execFile(
            'powershell.exe',
            ['-NoProfile', '-NonInteractive', '-Command',
             'Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer,Model | ConvertTo-Json -Compress'],
            { timeout: 8000, windowsHide: true },
            (err, out) => {
                if (err) return resolve(null);
                try {
                    const j = JSON.parse(out);
                    const junk = /^(system |to be filled|default string|o\.e\.m)/i;
                    const parts = [j.Manufacturer, j.Model]
                        .map((s) => String(s || '').trim())
                        .filter((s) => s && !junk.test(s));
                    resolve(parts.length ? parts.join(' ') : null);
                } catch (e) { resolve(null); }
            }
        );
    });
}

ipcMain.handle('device-info', async () => ({
    type: { win32: 'Windows', darwin: 'Mac', linux: 'Linux' }[process.platform] || 'Unknown',
    name: await getWindowsModel()
}));

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 850,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    // الموقع نفسه: index.html في جذر المستودع
    win.loadFile(path.join(__dirname, '..', 'index.html'));
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
