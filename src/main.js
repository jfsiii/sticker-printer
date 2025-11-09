import './styles/main.css';
import { DrawingManager } from './modules/drawing.js';
import { PrinterManager } from './modules/printer.js';
import { ModalManager } from './modules/modals.js';
import { AIManager } from './modules/ai.js';
import { CameraManager } from './modules/camera.js';
import { ImageManager } from './modules/image.js';
import { DRAWING_SIZES } from './modules/constants.js';

class StickerPrinterApp {
  constructor() {
    this.canvas = document.getElementById('drawingCanvas');
    this.drawingManager = new DrawingManager(this.canvas);
    this.printerManager = new PrinterManager();
    this.modalManager = new ModalManager();
    this.aiManager = new AIManager(this.modalManager);
    this.cameraManager = new CameraManager(this.modalManager);
    this.imageManager = new ImageManager();

    this.initUI();
    this.setupEventHandlers();
  }

  initUI() {
    this.printerStatus = document.getElementById('printerStatus');
    this.connectPrinterBtn = document.getElementById('connectPrinterBtn');
    this.disconnectPrinterBtn = document.getElementById('disconnectPrinterBtn');
    this.printOptionsBtn = document.getElementById('printOptionsBtn');

    this.updatePrinterStatus();
  }

  setupEventHandlers() {
    // Color picker
    document.getElementById('colorPicker').addEventListener('change', (e) => {
      this.drawingManager.setColor(e.target.value);
    });

    // Size buttons
    document.getElementById('sizeS').addEventListener('click', () => {
      this.setSize(DRAWING_SIZES.SMALL);
    });
    document.getElementById('sizeM').addEventListener('click', () => {
      this.setSize(DRAWING_SIZES.MEDIUM);
    });
    document.getElementById('sizeL').addEventListener('click', () => {
      this.setSize(DRAWING_SIZES.LARGE);
    });

    // Printer connection
    this.connectPrinterBtn.addEventListener('click', () => this.connectPrinter());
    this.disconnectPrinterBtn.addEventListener('click', () =>
      this.disconnectPrinter()
    );

    // Print options
    this.printOptionsBtn.addEventListener('click', () => this.showPrintOptions());

    // Status modal close
    document
      .getElementById('statusCloseBtn')
      .addEventListener('click', () => this.modalManager.closeStatus());

    // Setup global functions for onclick handlers in HTML
    window.clearCanvas = () => this.clearCanvas();
    window.showTextTools = () => this.showTextTools();
    window.closeTextTools = () => this.modalManager.closeTextTools();
    window.addText = () => this.addText();
    window.showAITools = () => this.showAITools();
    window.closeAITools = () => this.modalManager.closeAITools();
    window.generateAIImage = () => this.generateAIImage();
    window.captureCamera = () => this.captureCamera();
    window.uploadImage = () => this.uploadImage();
    window.saveImageOnly = () => this.saveImageOnly();
    window.printImageOnly = () => this.printImageOnly();
    window.saveAndPrint = () => this.saveAndPrint();
    window.closePrintOptionsModal = () => this.modalManager.closePrintOptions();
    window.closeStatusModal = () => this.modalManager.closeStatus();

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
  }

  setSize(size) {
    this.drawingManager.setSize(size);
    document.querySelectorAll('.size-btn').forEach((btn) => {
      btn.classList.remove('active');
    });

    if (size === DRAWING_SIZES.SMALL) {
      document.getElementById('sizeS').classList.add('active');
    } else if (size === DRAWING_SIZES.MEDIUM) {
      document.getElementById('sizeM').classList.add('active');
    } else if (size === DRAWING_SIZES.LARGE) {
      document.getElementById('sizeL').classList.add('active');
    }
  }

  clearCanvas() {
    this.drawingManager.clearCanvas();
  }

  showTextTools() {
    this.modalManager.showTextTools();
  }

  addText() {
    const text = document.getElementById('textInput').value;
    if (!text) return;

    const color = document.getElementById('colorPicker').value;
    const size = this.drawingManager.currentSize;

    this.drawingManager.addText(text, color, size);

    this.modalManager.closeTextTools();
    document.getElementById('textInput').value = '';
  }

  showAITools() {
    this.modalManager.showAITools();
  }

  async generateAIImage() {
    const prompt = document.getElementById('aiPrompt').value.trim();
    if (!prompt) {
      alert('Please describe what you want to draw!');
      return;
    }

    try {
      const img = await this.aiManager.generateImage(prompt);
      this.drawingManager.drawImage(img);
      this.modalManager.closeAITools();
      this.modalManager.showStatusWithClose(
        '✨ Perfect!',
        'Your AI artwork is ready! You can save or print it.'
      );
    } catch (error) {
      alert('❌ ' + error.message);
    }
  }

  async captureCamera() {
    try {
      await this.cameraManager.captureCamera();
    } catch (error) {
      this.modalManager.showStatusWithClose('❌ Camera Error', error.message);
    }
  }

  uploadImage() {
    this.imageManager.uploadImage();
  }

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
      this.modalManager.showStatusWithClose('❌ Connection Failed', error.message);
    }
  }

  disconnectPrinter() {
    this.printerManager.disconnect();
    this.updatePrinterStatus();
    this.modalManager.showStatusWithClose(
      '👋 Disconnected',
      'Printer connection closed'
    );
  }

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

  showPrintOptions() {
    const isConnected = this.printerManager.getConnectionStatus();
    this.modalManager.showPrintOptions(isConnected);
  }

  saveImageOnly() {
    this.imageManager.saveCanvasAsImage(this.canvas);
    this.modalManager.closePrintOptions();
    this.modalManager.showStatusWithClose(
      '✅ Saved!',
      'Your image has been saved.'
    );
  }

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
      this.modalManager.showStatusWithClose(
        '❌ Error',
        `Printing failed: ${error.message}`
      );
    }
  }

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
      this.modalManager.showStatusWithClose(
        '❌ Error',
        `Printing failed: ${error.message}`
      );
    }
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new StickerPrinterApp();
});
