
// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 它拥有与Chrome扩展一样的沙盒。
//!!! >=20 预加载脚本默认 沙盒化 ，不再拥有完整 Node.js 环境的访问权
//
const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    quitApp: () => ipcRenderer.send('quit-app'),

    //单向通道 
    sendBoardPos: (xPos, yPos) => ipcRenderer.send('send-board-pos', xPos, yPos)
    //双向通道
    //respSendBoardPos: (xPos, yPos) =>
    //   ipcRenderer.invoke('resp-send-board-pos', xPos, yPos)
})


