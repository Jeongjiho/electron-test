const { app, BrowserWindow, session, ipcMain } = require('electron');
const axios = require('axios');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')  // Preload 스크립트 추가
        }
    });

    // Hoppscotch 웹 애플리케이션을 로드합니다.
    win.loadURL('https://www.naver.com');
}

// IPC 핸들러 등록
ipcMain.handle('make-api-request', async (event, { url, method, headers, data }) => {
    try {
        const response = await axios({ url, method, headers, data });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// 앱이 준비되면 창을 생성하고, 모든 네트워크 요청을 가로채서 처리합니다.
app.whenReady().then(() => {
    createWindow();

    // HTTP 요청을 가로채고 CORS 헤더를 추가합니다.
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        if (details.url.startsWith('http://') || details.url.startsWith('https://')) {
            // 여기에 API 요청 처리 로직을 직접 추가하거나 원래 요청을 허용
            callback({ cancel: false });  // 요청을 취소하지 않고 계속 진행
        } else {
            callback({ cancel: false });  // 기본 요청은 취소하지 않습니다.
        }
    });

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Access-Control-Allow-Origin': ['*'],
                'Access-Control-Allow-Headers': ['*'],
                'Access-Control-Allow-Methods': ['*']
            }
        });
    });
});

// 모든 창이 닫히면 애플리케이션 종료
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});