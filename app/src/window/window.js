import {BrowserWindow} from 'electron'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'

async function createWindow(options = {
    width: 1600, 
    height: 900,
    minWidth: 600,
    minHeight: 600
}) {
    const win = new BrowserWindow({
        ...options,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Dev mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        //if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        // Non dev mode
        createProtocol('app')
        win.loadURL('app://./index.html')
    }

    return win
}

export {
    createWindow
}