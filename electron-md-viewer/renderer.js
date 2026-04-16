// renderer.js — runs in the browser context (no direct Node access)
// Uses window.electronAPI exposed by preload.js

const { marked } = require('marked')  // bundled via node_modules in dev; or use CDN

// Configure marked options
marked.setOptions({
  gfm: true,        // GitHub Flavored Markdown
  breaks: true,     // convert \n to <br>
})

const dropzone  = document.getElementById('dropzone')
const preview   = document.getElementById('preview')
const filePathEl = document.getElementById('file-path')
const titleText = document.getElementById('title-text')
const openBtn   = document.getElementById('open-btn')

// --- Render markdown content ---
function renderMarkdown(content, fileName, filePath) {
  preview.innerHTML = marked.parse(content)
  preview.style.display = 'block'
  dropzone.style.display = 'none'
  filePathEl.textContent = filePath || fileName
  titleText.textContent = fileName
}

// --- Open file button ---
openBtn.addEventListener('click', () => {
  window.electronAPI.openFile()
})

// --- IPC: file opened from main process (menu / button) ---
window.electronAPI.onFileOpened(({ content, fileName, filePath }) => {
  renderMarkdown(content, fileName, filePath)
})

// --- Drag and drop ---
document.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropzone.classList.add('drag-over')
})

document.addEventListener('dragleave', () => {
  dropzone.classList.remove('drag-over')
})

document.addEventListener('drop', async (e) => {
  e.preventDefault()
  dropzone.classList.remove('drag-over')

  const file = e.dataTransfer.files[0]
  if (!file) return

  const ext = file.name.split('.').pop().toLowerCase()
  if (!['md', 'markdown', 'txt'].includes(ext)) {
    alert('Please drop a Markdown (.md) file.')
    return
  }

  // Use the exposed IPC to read the file (avoids direct fs access in renderer)
  const result = await window.electronAPI.readFile(file.path)
  if (result.error) {
    alert('Error reading file: ' + result.error)
    return
  }
  renderMarkdown(result.content, result.fileName, result.filePath)
})
