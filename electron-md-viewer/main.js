const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 500,
    minHeight: 400,
    titleBarStyle: 'hiddenInset', // macOS native inset traffic lights
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')

  // Build native macOS menu
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Open…',
          accelerator: 'CmdOrCtrl+O',
          click: () => openFile()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
}

function openFile() {
  const files = dialog.showOpenDialogSync(mainWindow, {
    title: 'Open Markdown File',
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }
    ],
    properties: ['openFile']
  })

  if (!files || files.length === 0) return

  const filePath = files[0]
  const content = fs.readFileSync(filePath, 'utf-8')
  const fileName = path.basename(filePath)

  mainWindow.webContents.send('file-opened', { content, fileName, filePath })
  mainWindow.setRepresentedFilename(filePath) // macOS: show file icon in title bar
  mainWindow.setTitle(fileName)
}

// IPC: renderer asks to open a file
ipcMain.on('open-file', () => openFile())

// IPC: handle drag-and-drop file path from renderer
ipcMain.handle('read-file', (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const fileName = path.basename(filePath)
    mainWindow.setRepresentedFilename(filePath)
    mainWindow.setTitle(fileName)
    return { content, fileName, filePath }
  } catch (err) {
    return { error: err.message }
  }
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
