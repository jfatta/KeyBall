// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer, clipboard } = require('electron')
const setApplicationMenu = require('./menu')

const form = document.querySelector('form')

const inputs = {
  placeholder: form.querySelector('input[name="placeholder"]'),
  result: form.querySelector('input[name="result"]')
}

const buttons = {
  copyToClipboard: document.getElementById('copyToClipboard')
}

ipcRenderer.on('did-finish-load', () => {
  setApplicationMenu()
})

ipcRenderer.on('processing-did-succeed', (event, secret) => {
  inputs.result.value = secret
})

ipcRenderer.on('processing-did-fail', (event, error) => {
  window.alert(JSON.stringify(error))
})

form.addEventListener('submit', (event) => {
  event.preventDefault()
  ipcRenderer.send('did-submit-form', {
    placeholder: inputs.placeholder.value
  })
})

buttons.copyToClipboard.addEventListener('click', () => {
  console.log('copying ', inputs.result.value)
  clipboard.writeText(inputs.result.value)
})
