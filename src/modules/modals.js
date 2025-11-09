export class ModalManager {
  constructor() {
    this.modalOverlay = document.getElementById('modalOverlay');
    this.statusModal = document.getElementById('statusModal');
    this.statusTitle = document.getElementById('statusTitle');
    this.statusMessage = document.getElementById('statusMessage');
    this.statusCloseBtn = document.getElementById('statusCloseBtn');

    this.setupOverlayClickHandler();
  }

  setupOverlayClickHandler() {
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) {
        this.closeAll();
      }
    });
  }

  showStatus(title, message) {
    this.statusTitle.textContent = title;
    this.statusMessage.textContent = message;
    this.statusCloseBtn.style.display = 'none';
    this.statusModal.classList.add('active');
    this.modalOverlay.classList.add('active');
  }

  showStatusWithClose(title, message) {
    this.statusTitle.textContent = title;
    this.statusMessage.textContent = message;
    this.statusCloseBtn.style.display = 'block';
    this.statusModal.classList.add('active');
    this.modalOverlay.classList.add('active');
  }

  closeStatus() {
    this.statusModal.classList.remove('active');
    this.modalOverlay.classList.remove('active');
  }

  showTextTools() {
    const textTools = document.getElementById('textTools');
    textTools.classList.add('active');
    this.modalOverlay.classList.add('active');
    document.getElementById('textInput').focus();
  }

  closeTextTools() {
    const textTools = document.getElementById('textTools');
    textTools.classList.remove('active');
    this.modalOverlay.classList.remove('active');
  }

  showAITools() {
    const aiTools = document.getElementById('aiTools');
    aiTools.classList.add('active');
    this.modalOverlay.classList.add('active');
    document.getElementById('aiPrompt').focus();
  }

  closeAITools() {
    const aiTools = document.getElementById('aiTools');
    aiTools.classList.remove('active');
    this.modalOverlay.classList.remove('active');
  }

  showPrintOptions(isPrinterConnected) {
    const printOptionsModal = document.getElementById('printOptionsModal');
    const printOnlyBtn = document.getElementById('printOnlyBtn');
    const saveAndPrintBtn = document.getElementById('saveAndPrintBtn');
    const modalTitle = printOptionsModal.querySelector('h2');

    if (isPrinterConnected) {
      printOnlyBtn.style.display = 'block';
      saveAndPrintBtn.style.display = 'block';
      modalTitle.textContent = '🖨️ What do you want to do?';
    } else {
      printOnlyBtn.style.display = 'none';
      saveAndPrintBtn.style.display = 'none';
      modalTitle.textContent = '💾 Save Image?';
    }

    printOptionsModal.classList.add('active');
    this.modalOverlay.classList.add('active');
  }

  closePrintOptions() {
    const printOptionsModal = document.getElementById('printOptionsModal');
    printOptionsModal.classList.remove('active');
    this.modalOverlay.classList.remove('active');
  }

  closeAll() {
    document.getElementById('textTools').classList.remove('active');
    document.getElementById('aiTools').classList.remove('active');
    document.getElementById('printOptionsModal').classList.remove('active');
    this.statusModal.classList.remove('active');
    this.modalOverlay.classList.remove('active');
  }
}
