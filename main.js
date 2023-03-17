//!!! 进程模型:
//    主进程: 可以访问所有 nodejs api, electron api 
//    渲染进程: 一个BrowserWindow将生成一个该进程 
//    preload脚本: 在渲染器进程中执行，但先于网页内容开始加载的代码
//                 实际上与渲染器进程存在上下文隔离，如 `window` 不是同一个
//                 只能访问有限集合 electron>=20
//    效率进程: 相当于后台任务，UtilityProcess Api, 可访问所有的 nodejs api
//    

//TODO: missing Maintainer field

const {app, BrowserWindow, ipcMain, Notification} = require('electron')
const path = require('path')

const child_process = require('node:child_process')
let notice = null;
let mainWindow = null;

//!!! 透明窗口黑屏的问题
// 经过不断切换版本,发现不是 electron 的问题，而是i3wm的问题
// 下面的解决方法作为备份
//
//if (process.platform == "linux") {
//    //app.commandLine.appendSwitch("use-gl", "desktop")
//    app.commandLine.appendSwitch("disable-gpu")
//    //app.disableHardwareAcceleration()
//    app.whenReady().then(() => setTimeout(createWindow, 1000))
//} else {
//    app.whenReady().then(() => createWindow)
//
//}

//单向通道: 主进程只接收渲染进程的消息，而不回复
const moveCursor = (xPos, yPos) => {
    return new Promise((resolve, reject) => {
        child_process.exec(`xdotool mousemove ${xPos} ${yPos}`,
            (error, stdout, stderr) => {
                if (error || stderr) {
                    reject(error)
                } else {
                    resolve()
                }
            })
    })
}

async function handleMoveCursor(e, xPos, yPos) {
    try {
        await moveCursor(xPos, yPos)
    } catch (err) {
        console.error(err)
        notice.body = err.toString()
        notice.show();
    }
}

//双向通道: 主进程接收渲染进程的消息后要回复
async function respHandleMoveCursor(e, xPos, yPos) {
    try {
        await moveCursor(xPos, yPos)
    } catch (err) {
        console.error(err)
        notice.body = err.toString()
        notice.show();
        return false;
    }

    return true;
}

const createWindow = () => {
    mainWindow = new BrowserWindow({
        height: 1080,
        width: 1920,
        transparent: true,
        frame: false,
        backgroundColor: '#60ffffff',
        // fullscreen: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            preload: path.join(__dirname, 'preload.js'),
        }
    });
    mainWindow.loadFile("index.html");
    //mainWindow.webContents.openDevTools()
};

//!!! single instance support
const additionalData = {key: 'single-instance'}
const gotLock = app.requestSingleInstanceLock(additionalData)

if (!gotLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory, additionData) => {
        console.log(additionData)

        if (mainWindow) {
            //!!! minimize() not work in linux 
            if (!mainWindow.isVisible()) mainWindow.show()
            mainWindow.focus()
        }
    })

    app.whenReady().then(() => {
        notice = Notification({title: 'Board: '});

        //hide app
        ipcMain.on('quit-app', () => {mainWindow.hide()});

        //单向通道
        ipcMain.on('send-board-pos', handleMoveCursor);

        //双向
        //ipcMain.handle('resp-send-board-pos', respHandleMoveCursor);

        createWindow()

        app.on('activate', () => {
            // 在 macOS 系统内, 如果没有已开启的应用窗口
            // 点击托盘图标时通常会重新创建一个新窗口
            if (BrowserWindow.getAllWindows().length === 0) createWindow()
        })
    })

    // 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
    // 对应用程序和它们的菜单栏来说应该时刻保持激活状态, 
    // 直到用户使用 Cmd + Q 明确退出
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit()
    })

}


