import { describe, it, expect } from 'vitest';
import invariant from 'tiny-invariant';

describe('Sticker Printer App - Browser Tests', () => {
  // Vitest browser mode automatically serves the app via Vite
  // and loads index.html, so the DOM is ready for testing

  describe('Page Load', () => {
    it('should have the main canvas element', () => {
      const canvas = document.getElementById('drawingCanvas');
      invariant(canvas, 'Canvas should exist');
      expect(canvas.tagName).toBe('CANVAS');
    });

    it('should have all toolbar buttons', () => {
      expect(document.getElementById('colorPicker')).toBeTruthy();
      expect(document.getElementById('sizeS')).toBeTruthy();
      expect(document.getElementById('sizeM')).toBeTruthy();
      expect(document.getElementById('sizeL')).toBeTruthy();
      expect(document.getElementById('connectPrinterBtn')).toBeTruthy();
      expect(document.getElementById('printOptionsBtn')).toBeTruthy();
    });

    it('should have printer status element', () => {
      const status = document.getElementById('printerStatus');
      expect(status).toBeTruthy();
      expect(status?.textContent).toContain('Not Connected');
    });
  });

  describe('Canvas Drawing', () => {
    it('should initialize canvas with correct dimensions', () => {
      const canvas = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('drawingCanvas')
      );
      if (!canvas) throw new Error('Canvas should exist');

      expect(canvas.width).toBe(384);
      expect(canvas.height).toBe(500);
    });

    it('should have white background initially', () => {
      const canvas = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('drawingCanvas')
      );
      if (!canvas) throw new Error('Canvas should exist');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Context should exist');

      const imageData = ctx.getImageData(100, 100, 1, 1);
      expect(imageData.data[0]).toBe(255); // R
      expect(imageData.data[1]).toBe(255); // G
      expect(imageData.data[2]).toBe(255); // B
    });
  });

  describe('Color Picker', () => {
    it('should be an input element of type color', () => {
      const colorPicker = /** @type {HTMLInputElement | null} */ (
        document.getElementById('colorPicker')
      );
      expect(colorPicker?.type).toBe('color');
    });

    it('should have a default value', () => {
      const colorPicker = /** @type {HTMLInputElement | null} */ (
        document.getElementById('colorPicker')
      );
      expect(colorPicker?.value).toBeTruthy();
    });
  });

  describe('Size Buttons', () => {
    it('should have small size button', () => {
      const sizeS = document.getElementById('sizeS');
      expect(sizeS?.textContent).toBe('S');
    });

    it('should have medium size button', () => {
      const sizeM = document.getElementById('sizeM');
      expect(sizeM?.textContent).toBe('M');
    });

    it('should have large size button', () => {
      const sizeL = document.getElementById('sizeL');
      expect(sizeL?.textContent).toBe('L');
    });

    it('should have active class on one size button', () => {
      const sizeButtons = document.querySelectorAll('.size-btn');
      const activeButtons = Array.from(sizeButtons).filter((btn) =>
        btn.classList.contains('active')
      );
      expect(activeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Global Functions', () => {
    it('should expose clearCanvas function on window', () => {
      invariant('clearCanvas' in window, 'clearCanvas not found on window');
      invariant(typeof window['clearCanvas'] === 'function', 'clearCanvas is not a function');
    });

    it('should expose showTextTools function on window', () => {
      invariant('showTextTools' in window, 'showTextTools not found on window');
      invariant(typeof window['showTextTools'] === 'function', 'showTextTools is not a function');
    });

    it('should expose showAITools function on window', () => {
      invariant('showAITools' in window, 'showAITools not found on window');
      invariant(typeof window['showAITools'] === 'function', 'showAITools is not a function');
    });

    it('should expose captureCamera function on window', () => {
      invariant('captureCamera' in window, 'captureCamera not found on window');
      invariant(typeof window['captureCamera'] === 'function', 'captureCamera is not a function');
    });

    it('should expose uploadImage function on window', () => {
      invariant('uploadImage' in window, 'uploadImage not found on window');
      invariant(typeof window['uploadImage'] === 'function', 'uploadImage is not a function');
    });

    it('should expose print functions on window', () => {
      invariant('saveImageOnly' in window, 'saveImageOnly not found on window');
      invariant(typeof window['saveImageOnly'] === 'function', 'saveImageOnly is not a function');
      invariant('printImageOnly' in window, 'printImageOnly not found on window');
      invariant(typeof window['printImageOnly'] === 'function', 'printImageOnly is not a function');
      invariant('saveAndPrint' in window, 'saveAndPrint not found on window');
      invariant(typeof window['saveAndPrint'] === 'function', 'saveAndPrint is not a function');
    });
  });

  describe('Modals', () => {
    it('should have modal overlay element', () => {
      const overlay = document.getElementById('modalOverlay');
      expect(overlay).toBeTruthy();
    });

    it('should have status modal', () => {
      const modal = document.getElementById('statusModal');
      expect(modal).toBeTruthy();
    });

    it('should have print options modal', () => {
      const modal = document.getElementById('printOptionsModal');
      expect(modal).toBeTruthy();
    });

    it('should have text tools modal', () => {
      const modal = document.getElementById('textTools');
      expect(modal).toBeTruthy();
    });

    it('should have AI tools modal', () => {
      const modal = document.getElementById('aiTools');
      expect(modal).toBeTruthy();
    });

    it('should have camera modal', () => {
      const modal = document.getElementById('cameraModal');
      expect(modal).toBeTruthy();
    });
  });

  describe('Printer Controls', () => {
    it('should show connect button when not connected', () => {
      const connectBtn = document.getElementById('connectPrinterBtn');
      const disconnectBtn = document.getElementById('disconnectPrinterBtn');

      expect(connectBtn?.style.display).not.toBe('none');
      expect(disconnectBtn?.style.display).toBe('none');
    });

    it('should have printer status with disconnected class', () => {
      const status = document.getElementById('printerStatus');
      expect(status?.classList.contains('disconnected')).toBe(true);
    });
  });
});
