import {BrowserWindow} from 'electron'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'

async function createWindow(options = {}) {
    let defaultOptions = {
        width: 1600, 
        height: 900,
        minWidth: 600,
        minHeight: 600,
        backgroundColor: "#262D37",
        ...options
    }

    const win = new BrowserWindow({
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        ...defaultOptions,
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