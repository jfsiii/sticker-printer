/**
 * Manages modal dialogs and overlays
 */
export class ModalManager {
  /** @type {HTMLElement} */
  modalOverlay;

  /** @type {HTMLElement} */
  statusModal;

  /** @type {HTMLElement} */
  statusTitle;

  /** @type {HTMLElement} */
  statusMessage;

  /** @type {HTMLElement} */
  statusCloseBtn;

  /**
   * @throws {Error} If required modal elements are not found in DOM
   */
  constructor() {
    const modalOverlay = document.getElementById('modalOverlay');
    const statusModal = document.getElementById('statusModal');
    const statusTitle = document.getElementById('statusTitle');
    const statusMessage = document.getElementById('statusMessage');
    const statusCloseBtn = document.getElementById('statusCloseBtn');

    if (!modalOverlay || !statusModal || !statusTitle || !statusMessage || !statusCloseBtn) {
      throw new Error('Required modal elements not found in DOM');
    }

    this.modalOverlay = modalOverlay;
    this.statusModal = statusModal;
    this.statusTitle = statusTitle;
    this.statusMessage = statusMessage;
    this.statusCloseBtn = statusCloseBtn;

    this.setupOverlayClickHandler();
  }

  /**
   * Set up click handler for overlay to close modals
   * @returns {void}
   */
  setupOverlayClickHandler() {
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) {
        this.closeAll();
      }
    });
  }

  /**
   * Show status modal without close button
   * @param {string} title - The modal title
   * @param {string} message - The status message
   * @returns {void}
   */
  showStatus(title, message) {
    this.statusTitle.textContent = title;
    this.statusMessage.textContent = message;
    this.statusCloseBtn.style.display = 'none';
    this.statusModal.classList.add('active');
    this.modalOverlay.classList.add('active');
  }

  /**
   * Show status modal with close button
   * @param {string} title - The modal title
   * @param {string} message - The status message
   * @returns {void}
   */
  showStatusWithClose(title, message) {
    this.statusTitle.textContent = title;
    this.statusMessage.textContent = message;
    this.statusCloseBtn.style.display = 'block';
    this.statusModal.classList.add('active');
    this.modalOverlay.classList.add('active');
  }

  /**
   * Close the status modal
   * @returns {void}
   */
  closeStatus() {
    this.statusModal.classList.remove('active');
    this.modalOverlay.classList.remove('active');
  }

  /**
   * Show the text input modal
   * @returns {void}
   * @throws {Error} If text tools element not found
   */
  showTextTools() {
    const textTools = document.getElementById('textTools');
    if (!textTools) {
      throw new Error('Text tools element not found');
    }
    textTools.classList.add('active');
    this.modalOverlay.classList.add('active');

    const textInput = document.getElementById('textInput');
    if (textInput instanceof HTMLInputElement || textInput instanceof HTMLTextAreaElement) {
      textInput.focus();
    }
  }

  /**
   * Close the text input modal
   * @returns {void}
   * @throws {Error} If text tools element not found
   */
  closeTextTools() {
    const textTools = document.getElementById('textTools');
    if (!textTools) {
      throw new Error('Text tools element not found');
    }
    textTools.classList.remove('active');
    this.modalOverlay.classList.remove('active');
  }

  /**
   * Show the AI generation modal
   * @returns {void}
   * @throws {Error} If AI tools element not found
   */
  showAITools() {
    const aiTools = document.getElementById('aiTools');
    if (!aiTools) {
      throw new Error('AI tools element not found');
    }
    aiTools.classList.add('active');
    this.modalOverlay.classList.add('active');

    const aiPrompt = document.getElementById('aiPrompt');
    if (aiPrompt instanceof HTMLInputElement || aiPrompt instanceof HTMLTextAreaElement) {
      aiPrompt.focus();
    }
  }

  /**
   * Close the AI generation modal
   * @returns {void}
   * @throws {Error} If AI tools element not found
   */
  closeAITools() {
    const aiTools = document.getElementById('aiTools');
    if (!aiTools) {
      throw new Error('AI tools element not found');
    }
    aiTools.classList.remove('active');
    this.modalOverlay.classList.remove('active');
  }

  /**
   * Show print options modal
   * @param {boolean} isPrinterConnected - Whether a printer is connected
   * @returns {void}
   * @throws {Error} If print options modal or button elements not found
   */
  showPrintOptions(isPrinterConnected) {
    const printOptionsModal = document.getElementById('printOptionsModal');
    if (!printOptionsModal) {
      throw new Error('Print options modal not found');
    }

    const printOnlyBtn = document.getElementById('printOnlyBtn');
    const saveAndPrintBtn = document.getElementById('saveAndPrintBtn');
    if (!printOnlyBtn || !saveAndPrintBtn) {
      throw new Error('Print buttons not found');
    }

    const modalTitle = printOptionsModal.querySelector('h2');
    if (!modalTitle) {
      throw new Error('Modal title not found');
    }

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

  /**
   * Close the print options modal
   * @returns {void}
   * @throws {Error} If print options modal not found
   */
  closePrintOptions() {
    const printOptionsModal = document.getElementById('printOptionsModal');
    if (!printOptionsModal) {
      throw new Error('Print options modal not found');
    }
    printOptionsModal.classList.remove('active');
    this.modalOverlay.classList.remove('active');
  }

  /**
   * Close all modals
   * @returns {void}
   */
  closeAll() {
    const textTools = document.getElementById('textTools');
    const aiTools = document.getElementById('aiTools');
    const printOptionsModal = document.getElementById('printOptionsModal');

    if (textTools) {
      textTools.classList.remove('active');
    }
    if (aiTools) {
      aiTools.classList.remove('active');
    }
    if (printOptionsModal) {
      printOptionsModal.classList.remove('active');
    }

    this.statusModal.classList.remove('active');
    this.modalOverlay.classList.remove('active');
  }
}
