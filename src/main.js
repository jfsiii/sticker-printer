import './styles/main.css';
import { DrawingManager } from './modules/drawing.js';
import { PrinterManager } from './modules/printer.js';
import { ModalManager } from './modules/modals.js';
import { AIManager } from './modules/ai.js';
import { CameraManager } from './modules/camera.js';
import { ImageManager } from './modules/image.js';
import { DRAWING_SIZES } from './modules/constants.js';

/**
 * Main application class that coordinates all modules
 */
class StickerPrinterApp {
  /** @type {HTMLCanvasElement} */
  canvas;

  /** @type {DrawingManager} */
  drawingManager;

  /** @type {PrinterManager} */
  printerManager;

  /** @type {ModalManager} */
  modalManager;

  /** @type {AIManager} */
  aiManager;

  /** @type {CameraManager} */
  cameraManager;

  /** @type {ImageManager} */
  imageManager;

  /** @type {HTMLElement} */
  printerStatus;

  /** @type {HTMLElement} */
  connectPrinterBtn;

  /** @type {HTMLElement} */
  disconnectPrinterBtn;

  /** @type {HTMLElement} */
  printOptionsBtn;

  /**
   * @throws {Error} If canvas element not found
   */
  constructor() {
    const canvas = document.getElementById('drawingCanvas');
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Drawing canvas element not found');
    }
    this.canvas = canvas;

    this.drawingManager = new DrawingManager(this.canvas);
    this.printerManager = new PrinterManager();
    this.modalManager = new ModalManager();
    this.aiManager = new AIManager(this.modalManager);
    this.cameraManager = new CameraManager(this.modalManager);
    this.imageManager = new ImageManager();

    this.printerStatus = document.createElement('div');
    this.connectPrinterBtn = document.createElement('button');
    this.disconnectPrinterBtn = document.createElement('button');
    this.printOptionsBtn = document.createElement('button');

    this.initUI();
    this.setupEventHandlers();
  }

  /**
   * Initialize UI elements
   * @returns {void}
   * @throws {Error} If required UI elements not found
   */
  initUI() {
    const printerStatus = document.getElementById('printerStatus');
    const connectPrinterBtn = document.getElementById('connectPrinterBtn');
    const disconnectPrinterBtn = document.getElementById('disconnectPrinterBtn');
    const printOptionsBtn = document.getElementById('printOptionsBtn');

    if (!printerStatus || !connectPrinterBtn || !disconnectPrinterBtn || !printOptionsBtn) {
      throw new Error('Required UI elements not found');
    }

    this.printerStatus = printerStatus;
    this.connectPrinterBtn = connectPrinterBtn;
    this.disconnectPrinterBtn = disconnectPrinterBtn;
    this.printOptionsBtn = printOptionsBtn;

    this.updatePrinterStatus();
  }

  /**
   * Set up all event handlers for UI interactions
   * @returns {void}
   */
  setupEventHandlers() {
    // Color picker
    const colorPicker = document.getElementById('colorPicker');
    if (colorPicker instanceof HTMLInputElement) {
      colorPicker.addEventListener('change', (e) => {
        const target = e.target;
        if (target instanceof HTMLInputElement) {
          this.drawingManager.setColor(target.value);
        }
      });
    }

    // Size buttons
    const sizeS = document.getElementById('sizeS');
    const sizeM = document.getElementById('sizeM');
    const sizeL = document.getElementById('sizeL');

    if (sizeS) {
      sizeS.addEventListener('click', () => {
        this.setSize(DRAWING_SIZES.SMALL);
      });
    }
    if (sizeM) {
      sizeM.addEventListener('click', () => {
        this.setSize(DRAWING_SIZES.MEDIUM);
      });
    }
    if (sizeL) {
      sizeL.addEventListener('click', () => {
        this.setSize(DRAWING_SIZES.LARGE);
      });
    }

    // Printer connection
    this.connectPrinterBtn.addEventListener('click', () => this.connectPrinter());
    this.disconnectPrinterBtn.addEventListener('click', () =>
      this.disconnectPrinter()
    );

    // Print options
    this.printOptionsBtn.addEventListener('click', () => this.showPrintOptions());

    // Status modal close
    const statusCloseBtn = document.getElementById('statusCloseBtn');
    if (statusCloseBtn) {
      statusCloseBtn.addEventListener('click', () => this.modalManager.closeStatus());
    }

    // Expose managers globally for HTML onclick handlers
    window.modalManager = this.modalManager;
    window.drawingManager = this.drawingManager;
    window.cameraManager = this.cameraManager;
    window.imageManager = this.imageManager;
    window.aiManager = this.aiManager;

    // Image upload handler
    this.imageManager.onImageLoaded = (img) => {
      this.drawingManager.drawImage(img);
      this.modalManager.showStatusWithClose(
        '✅ Image Loaded!',
        'Ready to save or print'
      );
    };

    // Camera capture handler
    this.cameraManager.onImageCaptured = (img) => {
      img.onload = () => {
        this.drawingManager.drawImage(img);
      };
    };

    // AI image generated handler
    this.aiManager.onImageGenerated = (img) => this.handleAIImageGenerated(img);

    // Text entered handler
    this.drawingManager.onTextEntered = (text) => {
      const colorPickerEl = document.getElementById('colorPicker');
      if (colorPickerEl instanceof HTMLInputElement) {
        const color = colorPickerEl.value;
        this.drawingManager.addText(text, color, this.drawingManager.currentSize);
      }
    };

    // Print action handler
    this.modalManager.onPrintAction = (action) => this.handlePrintAction(action);
  }

  /**
   * Set the drawing brush size
   * @param {number} size - The brush size to set
   * @returns {void}
   */
  setSize(size) {
    this.drawingManager.setSize(size);
    document.querySelectorAll('.size-btn').forEach((btn) => {
      btn.classList.remove('active');
    });

    const sizeS = document.getElementById('sizeS');
    const sizeM = document.getElementById('sizeM');
    const sizeL = document.getElementById('sizeL');

    if (size === DRAWING_SIZES.SMALL && sizeS) {
      sizeS.classList.add('active');
    } else if (size === DRAWING_SIZES.MEDIUM && sizeM) {
      sizeM.classList.add('active');
    } else if (size === DRAWING_SIZES.LARGE && sizeL) {
      sizeL.classList.add('active');
    }
  }


  /**
   * Handle AI image generation - orchestrates drawing the generated image
   * @param {HTMLImageElement} img - The generated image from AI
   * @returns {void}
   */
  handleAIImageGenerated(img) {
    this.drawingManager.drawImage(img);
  }


  /**
   * Connect to a Bluetooth printer
   * @returns {Promise<void>}
   */
  async connectPrinter() {
    try {
      this.modalManager.showStatus('⏳ Connecting...', 'Looking for printer...');

      const deviceName = await this.printerManager.connect();

      this.updatePrinterStatus();
      this.modalManager.closeStatus();
      this.modalManager.showStatusWithClose(
        '✅ Connected!',
        `Printer ready: ${deviceName}`
      );
    } catch (error) {
      this.updatePrinterStatus();
      const message = error instanceof Error ? error.message : String(error);
      this.modalManager.showStatusWithClose('❌ Connection Failed', message);
    }
  }

  /**
   * Disconnect from the printer
   * @returns {void}
   */
  disconnectPrinter() {
    this.printerManager.disconnect();
    this.updatePrinterStatus();
    this.modalManager.showStatusWithClose(
      '👋 Disconnected',
      'Printer connection closed'
    );
  }

  /**
   * Update the printer status UI
   * @returns {void}
   */
  updatePrinterStatus() {
    const isConnected = this.printerManager.getConnectionStatus();

    if (isConnected) {
      const deviceName = this.printerManager.getDeviceName();
      this.printerStatus.textContent = `🖨️ Connected: ${deviceName}`;
      this.printerStatus.classList.remove('disconnected');
      this.printerStatus.classList.add('connected');
      this.connectPrinterBtn.style.display = 'none';
      this.disconnectPrinterBtn.style.display = 'block';
    } else {
      this.printerStatus.textContent = 'Printer: Not Connected';
      this.printerStatus.classList.remove('connected');
      this.printerStatus.classList.add('disconnected');
      this.connectPrinterBtn.style.display = 'block';
      this.disconnectPrinterBtn.style.display = 'none';
    }
  }

  /**
   * Show the print/save options modal
   * @returns {void}
   */
  showPrintOptions() {
    const isConnected = this.printerManager.getConnectionStatus();
    this.modalManager.showPrintOptions(isConnected);
  }

  /**
   * Handle print action - orchestrates the selected action
   * @param {'save' | 'print' | 'saveAndPrint'} action - The action to perform
   * @returns {void | Promise<void>}
   */
  handlePrintAction(action) {
    switch (action) {
      case 'save':
        return this.saveImageOnly();
      case 'print':
        return this.printImageOnly();
      case 'saveAndPrint':
        return this.saveAndPrint();
    }
  }

  /**
   * Save the canvas image without printing
   * @returns {void}
   * @private
   */
  saveImageOnly() {
    this.imageManager.saveCanvasAsImage(this.canvas);
    this.modalManager.closePrintOptions();
    this.modalManager.showStatusWithClose(
      '✅ Saved!',
      'Your image has been saved.'
    );
  }

  /**
   * Print the canvas image without saving
   * @returns {Promise<void>}
   * @private
   */
  async printImageOnly() {
    this.modalManager.closePrintOptions();
    try {
      this.modalManager.showStatus('⏳ Printing...', 'Sending to printer...');
      await this.printerManager.print(this.canvas);
      this.modalManager.showStatusWithClose(
        '✅ Success!',
        'Your image has been printed!'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.modalManager.showStatusWithClose(
        '❌ Error',
        `Printing failed: ${message}`
      );
    }
  }

  /**
   * Save and print the canvas image
   * @returns {Promise<void>}
   * @private
   */
  async saveAndPrint() {
    this.modalManager.closePrintOptions();
    this.imageManager.saveCanvasAsImage(this.canvas);

    try {
      this.modalManager.showStatus('⏳ Printing...', 'Sending to printer...');
      await this.printerManager.print(this.canvas);
      this.modalManager.showStatusWithClose(
        '✅ Success!',
        'Your image has been saved and printed!'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.modalManager.showStatusWithClose(
        '❌ Error',
        `Printing failed: ${message}`
      );
    }
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new StickerPrinterApp();
});
