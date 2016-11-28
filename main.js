const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron')
var path = require('path')
var KeyVault = require('azure-keyvault')
var AuthenticationContext = require('adal-node').AuthenticationContext
var placeholderHelper = require('./placeholderHelper.js')

var clientId = process.env.KeyholdR_ClientId
var clientSecret = process.env.KeyholdR_Secret

// Authenticator - retrieves the access token
var authenticator = function (challenge, callback) {
  // Create a new authentication context.
  var context = new AuthenticationContext(challenge.authorization)
  // Use the context to acquire an authentication token
  return context.acquireTokenWithClientCredentials(challenge.resource, clientId, clientSecret, function (err, tokenResponse) {
    if (err) throw err
    // Calculate the value to be set in the request's Authorization header and resume the call.
    var authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken
    return callback(null, authorizationValue)
  })
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
var appIcon = null
var credentials = new KeyVault.KeyVaultCredentials(authenticator)
var client = new KeyVault.KeyVaultClient(credentials)

var iconPath = path.join(__dirname, 'images', 'keyball.png')

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 720,
    height: 255,
    titleBarStyle: 'hidden',
    icon: iconPath
  })
  mainWindow.loadURL(`file://${__dirname}/index.html`)
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('did-finish-load')
  })

  mainWindow.on('minimize', function (event) {
    event.preventDefault()
    mainWindow.hide()
  })

  mainWindow.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })
}

function handleSubmission () {
  ipcMain.on('did-submit-form', (event, argument) => {
    const { placeholder } = argument
    console.log(argument)
    client.getSecret(GetSecretUri(placeholder), function (getErr, getSecretBundle) {
      if (getErr) {
        event.sender.send('processing-did-fail', getErr)
      } else {
        event.sender.send('processing-did-succeed', getSecretBundle.value)
      }
    })
  })
}

function GetSecretUri (userInput) {
  // var segments = userInput.split(':')
  var segments = placeholderHelper.parse(userInput)
  return `https://${segments[0]}.vault.azure.net/secrets/${segments[1]}`
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
  handleSubmission()
  appIcon = new Tray(iconPath)
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show KeyBall',
      click: function () {
        mainWindow.show()
      }
    },
    {
      label: 'Quit',
      click: function () {
        app.isQuiting = true
        app.quit()
      }
    }
  ])
  appIcon.setToolTip('KeyBall')
  appIcon.setContextMenu(contextMenu)
})

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('browser-window-created', function (e, window) {
  window.setMenu(null)
})
