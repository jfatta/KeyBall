// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer } = require('electron')
const setApplicationMenu = require('./menu')

const form = document.querySelector('form')

const inputs = {
  placeholder: form.querySelector('input[name="placeholder"]'),
  result: form.querySelector('input[name="result"]')
}

ipcRenderer.on('did-finish-load', () => {
  setApplicationMenu()
})

ipcRenderer.on('processing-did-succeed', (event, secret) => {
  window.alert(secret)
  inputs.result.value = secret
})

ipcRenderer.on('processing-did-fail', (event, error) => {
  console.error(JSON.stringify(error))
  window.alert(JSON.stringify(error))
})

form.addEventListener('submit', (event) => {
  event.preventDefault()
  ipcRenderer.send('did-submit-form', {
    placeholder: inputs.placeholder.value
  })
})
