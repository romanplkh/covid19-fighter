const { app, BrowserWindow } = require("electron");
const path = require("path");



function createWindow() {
    // Create the browser window.
    let win = new BrowserWindow({
        width: 1200,
        height: 1000,
        center: true,
        minimizable: true,
        maximizable: true,
        fullscreenable: true,
        fullscreenWindowTitle: true,

        title: "Covid 19 Fighter",
        webPreferences: {
            nodeIntegration: true
        }
    })

    const pathToFile = path.join(__dirname, "public", "game.html")
    win.loadFile(pathToFile)
}

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})