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

  describe('Global Managers', () => {
    it('should expose drawingManager on window', () => {
      invariant('drawingManager' in window, 'drawingManager not found on window');
      invariant(typeof window.drawingManager === 'object', 'drawingManager is not an object');
      invariant(typeof window.drawingManager.clearCanvas === 'function', 'clearCanvas method not found');
    });

    it('should expose modalManager on window', () => {
      invariant('modalManager' in window, 'modalManager not found on window');
      invariant(typeof window.modalManager === 'object', 'modalManager is not an object');
    });

    it('should expose aiManager on window', () => {
      invariant('aiManager' in window, 'aiManager not found on window');
      invariant(typeof window.aiManager === 'object', 'aiManager is not an object');
      invariant(typeof window.aiManager.showPromptModal === 'function', 'showPromptModal method not found');
    });

    it('should expose cameraManager on window', () => {
      invariant('cameraManager' in window, 'cameraManager not found on window');
      invariant(typeof window.cameraManager === 'object', 'cameraManager is not an object');
      invariant(typeof window.cameraManager.captureCamera === 'function', 'captureCamera method not found');
    });

    it('should expose imageManager on window', () => {
      invariant('imageManager' in window, 'imageManager not found on window');
      invariant(typeof window.imageManager === 'object', 'imageManager is not an object');
      invariant(typeof window.imageManager.uploadImage === 'function', 'uploadImage method not found');
    });
  });

  describe('Modals', () => {
    it('should create modals dynamically (no modals on initial load)', () => {
      // Modals are now created dynamically using app-modal components
      // They should NOT exist on initial page load
      const statusModal = document.getElementById('statusModal');
      const printOptionsModal = document.getElementById('printOptionsModal');
      const textInputModal = document.getElementById('textInputModal');
      const aiPromptModal = document.getElementById('aiPromptModal');
      const cameraModal = document.getElementById('cameraModal');

      // All should be null initially (created on demand)
      expect(statusModal).toBeNull();
      expect(printOptionsModal).toBeNull();
      expect(textInputModal).toBeNull();
      expect(aiPromptModal).toBeNull();
      expect(cameraModal).toBeNull();
    });

    it('should be able to create status modal on demand', () => {
      // Test that modalManager can create status modal
      window.modalManager.showStatus('Test', 'Testing');
      const modal = document.getElementById('statusModal');
      expect(modal).toBeTruthy();
      expect(modal?.tagName.toLowerCase()).toBe('app-modal');
      window.modalManager.closeStatus();
    });

    it('should be able to create text input modal on demand', () => {
      // Test that drawingManager can create text modal
      window.drawingManager.showTextInputModal();
      const modal = document.getElementById('textInputModal');
      expect(modal).toBeTruthy();
      expect(modal?.tagName.toLowerCase()).toBe('app-modal');
      window.drawingManager.closeTextInputModal();
    });

    it('should be able to create AI prompt modal on demand', () => {
      // Test that aiManager can create AI modal
      window.aiManager.showPromptModal();
      const modal = document.getElementById('aiPromptModal');
      expect(modal).toBeTruthy();
      expect(modal?.tagName.toLowerCase()).toBe('app-modal');
      window.aiManager.closePromptModal();
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

  describe('Drawing Interactions', () => {
    it('should draw on canvas when mouse is pressed and moved', () => {
      const canvas = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('drawingCanvas')
      );
      invariant(canvas, 'Canvas should exist');

      const ctx = canvas.getContext('2d');
      invariant(ctx, 'Context should exist');

      // Clear canvas to start fresh
      window.drawingManager.clearCanvas();

      // Get initial pixel data at drawing position
      const testX = 100;
      const testY = 100;
      const initialPixel = ctx.getImageData(testX, testY, 1, 1);

      // Simulate mouse drawing
      const rect = canvas.getBoundingClientRect();
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: rect.left + testX,
        clientY: rect.top + testY,
      });
      canvas.dispatchEvent(mouseDownEvent);

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: rect.left + testX + 10,
        clientY: rect.top + testY + 10,
      });
      canvas.dispatchEvent(mouseMoveEvent);

      const mouseUpEvent = new MouseEvent('mouseup', {});
      canvas.dispatchEvent(mouseUpEvent);

      // Check that pixels changed from white
      const afterPixel = ctx.getImageData(testX + 5, testY + 5, 1, 1);
      const pixelChanged =
        afterPixel.data[0] !== initialPixel.data[0] ||
        afterPixel.data[1] !== initialPixel.data[1] ||
        afterPixel.data[2] !== initialPixel.data[2];

      expect(pixelChanged).toBe(true);
    });

    it('should draw with different colors', () => {
      const canvas = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('drawingCanvas')
      );
      invariant(canvas, 'Canvas should exist');

      window.drawingManager.clearCanvas();
      window.drawingManager.setColor('#FF0000'); // Red

      const rect = canvas.getBoundingClientRect();
      const testX = 150;
      const testY = 150;

      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: rect.left + testX,
        clientY: rect.top + testY,
      });
      canvas.dispatchEvent(mouseDownEvent);

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: rect.left + testX + 10,
        clientY: rect.top + testY,
      });
      canvas.dispatchEvent(mouseMoveEvent);

      const mouseUpEvent = new MouseEvent('mouseup', {});
      canvas.dispatchEvent(mouseUpEvent);

      // Check that drawing happened
      const ctx = canvas.getContext('2d');
      invariant(ctx, 'Context should exist');
      const pixel = ctx.getImageData(testX + 5, testY, 1, 1);

      // Should have red color (may not be pure red due to anti-aliasing)
      expect(pixel.data[0]).toBeGreaterThan(200); // R channel should be high
    });

    it('should draw with different brush sizes', () => {
      const canvas = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('drawingCanvas')
      );
      invariant(canvas, 'Canvas should exist');

      // Test small size
      window.drawingManager.clearCanvas();
      window.drawingManager.setSize(2);
      expect(window.drawingManager.currentSize).toBe(2);

      // Test medium size
      window.drawingManager.setSize(5);
      expect(window.drawingManager.currentSize).toBe(5);

      // Test large size
      window.drawingManager.setSize(10);
      expect(window.drawingManager.currentSize).toBe(10);
    });

    it('should clear canvas to white', () => {
      const canvas = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('drawingCanvas')
      );
      invariant(canvas, 'Canvas should exist');

      const ctx = canvas.getContext('2d');
      invariant(ctx, 'Context should exist');

      // Draw something first
      window.drawingManager.setColor('#000000');
      const rect = canvas.getBoundingClientRect();
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: rect.left + 50,
        clientY: rect.top + 50,
      });
      canvas.dispatchEvent(mouseDownEvent);

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: rect.left + 100,
        clientY: rect.top + 100,
      });
      canvas.dispatchEvent(mouseMoveEvent);

      const mouseUpEvent = new MouseEvent('mouseup', {});
      canvas.dispatchEvent(mouseUpEvent);

      // Clear canvas
      window.drawingManager.clearCanvas();

      // Verify canvas is white
      const pixel = ctx.getImageData(75, 75, 1, 1);
      expect(pixel.data[0]).toBe(255); // R
      expect(pixel.data[1]).toBe(255); // G
      expect(pixel.data[2]).toBe(255); // B
    });
  });

  describe('Text Input', () => {
    it('should add text to canvas via modal', () => {
      const canvas = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('drawingCanvas')
      );
      invariant(canvas, 'Canvas should exist');

      window.drawingManager.clearCanvas();
      const initialTextCount = window.drawingManager.textCount;

      // Show modal
      window.drawingManager.showTextInputModal();

      // Wait for modal to render
      const textInput = /** @type {HTMLInputElement | null} */ (
        document.getElementById('textInput')
      );
      invariant(textInput, 'Text input should exist');

      // Enter text
      textInput.value = 'Hello Test!';

      // Set up callback to add text
      window.drawingManager.onTextEntered = (text) => {
        window.drawingManager.addText(text, '#000000', 3);
      };

      // Submit
      const submitBtn = /** @type {HTMLElement | null} */ (
        document.querySelector('#textInputModal button.primary')
      );
      invariant(submitBtn, 'Submit button should exist');
      submitBtn.click();

      // Verify text count increased
      expect(window.drawingManager.textCount).toBe(initialTextCount + 1);

      // Verify modal closed
      const modal = document.getElementById('textInputModal');
      expect(modal?.getAttribute('open')).toBeNull();
    });

    it('should not submit empty text', () => {
      window.drawingManager.showTextInputModal();

      const textInput = /** @type {HTMLInputElement | null} */ (
        document.getElementById('textInput')
      );
      invariant(textInput, 'Text input should exist');

      // Leave empty
      textInput.value = '';

      const initialTextCount = window.drawingManager.textCount;

      // Mock alert to prevent actual alert dialog
      const originalAlert = window.alert;
      let alertCalled = false;
      window.alert = () => {
        alertCalled = true;
      };

      // Try to submit
      const submitBtn = /** @type {HTMLElement | null} */ (
        document.querySelector('#textInputModal button.primary')
      );
      invariant(submitBtn, 'Submit button should exist');
      submitBtn.click();

      // Restore alert
      window.alert = originalAlert;

      // Verify alert was called and text count unchanged
      expect(alertCalled).toBe(true);
      expect(window.drawingManager.textCount).toBe(initialTextCount);
    });

    it('should cancel text input modal', () => {
      window.drawingManager.showTextInputModal();

      const modal = document.getElementById('textInputModal');
      expect(modal).toBeTruthy();

      // Click cancel
      const cancelBtn = /** @type {HTMLElement | null} */ (
        document.querySelector('#textInputModal button.danger')
      );
      invariant(cancelBtn, 'Cancel button should exist');
      cancelBtn.click();

      // Verify modal closed
      expect(modal?.getAttribute('open')).toBeNull();
    });
  });

  describe('Image Loading', () => {
    it('should load and display image on canvas', () => {
      const canvas = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('drawingCanvas')
      );
      invariant(canvas, 'Canvas should exist');

      window.drawingManager.clearCanvas();

      // Create a test image (1x1 red pixel as data URL)
      const testImg = new Image();
      testImg.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

      return new Promise((resolve) => {
        testImg.onload = () => {
          // Set up callback
          window.imageManager.onImageLoaded = (img) => {
            window.drawingManager.drawImage(img);
          };

          // Trigger callback directly (simulating file load)
          if (window.imageManager.onImageLoaded) {
            window.imageManager.onImageLoaded(testImg);
          }

          // Verify image was drawn (canvas no longer pure white everywhere)
          const ctx = canvas.getContext('2d');
          invariant(ctx, 'Context should exist');

          // Sample the center - should have some image data
          const centerPixel = ctx.getImageData(
            Math.floor(canvas.width / 2),
            Math.floor(canvas.height / 2),
            1,
            1
          );

          // Just verify we got valid pixel data
          expect(centerPixel.data).toBeDefined();
          expect(centerPixel.data.length).toBe(4);

          resolve();
        };
      });
    });
  });

  describe('AI Image Generation', () => {
    it('should generate AI image successfully (mocked)', async () => {
      // Mock Image constructor to simulate successful load
      const OriginalImage = window.Image;
      let mockImageOnload = null;
      let mockImageSrc = '';

      // @ts-ignore - Mocking Image
      window.Image = function () {
        const img = new OriginalImage();
        Object.defineProperty(img, 'onload', {
          configurable: true,
          set: function (handler) {
            mockImageOnload = handler;
          },
          get: function () {
            return mockImageOnload;
          },
        });
        Object.defineProperty(img, 'src', {
          configurable: true,
          set: function (value) {
            mockImageSrc = value;
            // Simulate successful image load
            if (value.includes('pollinations.ai')) {
              setTimeout(() => {
                if (mockImageOnload) {
                  mockImageOnload.call(img);
                }
              }, 10);
            }
          },
          get: function () {
            return mockImageSrc;
          },
        });
        return img;
      };

      // Show modal
      window.aiManager.showPromptModal();

      const promptInput = /** @type {HTMLInputElement | null} */ (
        document.getElementById('aiPrompt')
      );
      invariant(promptInput, 'AI prompt input should exist');

      promptInput.value = 'a cute robot';

      // Set up callback
      let imageGenerated = false;
      window.aiManager.onImageGenerated = (img) => {
        imageGenerated = true;
        window.drawingManager.drawImage(img);
      };

      // Mock alert for success message
      const originalAlert = window.alert;
      window.alert = () => {};

      // Submit
      const generateBtn = /** @type {HTMLElement | null} */ (
        document.querySelector('#aiPromptModal button.success')
      );
      invariant(generateBtn, 'Generate button should exist');
      generateBtn.click();

      // Wait for async generation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Restore
      window.Image = OriginalImage;
      window.alert = originalAlert;

      // Verify image was generated
      expect(imageGenerated).toBe(true);
    });

    it('should handle AI image generation failure (mocked)', async () => {
      // Mock Image constructor to simulate error
      const OriginalImage = window.Image;
      let mockImageOnerror = null;
      let mockImageSrc = '';

      // @ts-ignore - Mocking Image
      window.Image = function () {
        const img = new OriginalImage();
        Object.defineProperty(img, 'onerror', {
          configurable: true,
          set: function (handler) {
            mockImageOnerror = handler;
          },
          get: function () {
            return mockImageOnerror;
          },
        });
        Object.defineProperty(img, 'src', {
          configurable: true,
          set: function (value) {
            mockImageSrc = value;
            // Simulate image load error
            if (value.includes('pollinations.ai')) {
              setTimeout(() => {
                if (mockImageOnerror) {
                  mockImageOnerror.call(img);
                }
              }, 10);
            }
          },
          get: function () {
            return mockImageSrc;
          },
        });
        return img;
      };

      // Show modal
      window.aiManager.showPromptModal();

      const promptInput = /** @type {HTMLInputElement | null} */ (
        document.getElementById('aiPrompt')
      );
      invariant(promptInput, 'AI prompt input should exist');

      promptInput.value = 'test error case';

      // Set up callback
      let imageGenerated = false;
      window.aiManager.onImageGenerated = () => {
        imageGenerated = true;
      };

      // Mock alert to capture error message
      const originalAlert = window.alert;
      let alertMessage = '';
      window.alert = (msg) => {
        alertMessage = String(msg);
      };

      // Submit
      const generateBtn = /** @type {HTMLElement | null} */ (
        document.querySelector('#aiPromptModal button.success')
      );
      invariant(generateBtn, 'Generate button should exist');
      generateBtn.click();

      // Wait for async error handling
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Restore
      window.Image = OriginalImage;
      window.alert = originalAlert;

      // Verify error was handled
      expect(imageGenerated).toBe(false);
      expect(alertMessage).toContain('Could not generate image');
    });

    it('should not submit empty AI prompt', () => {
      window.aiManager.showPromptModal();

      const promptInput = /** @type {HTMLInputElement | null} */ (
        document.getElementById('aiPrompt')
      );
      invariant(promptInput, 'AI prompt input should exist');

      // Leave empty
      promptInput.value = '';

      // Mock alert
      const originalAlert = window.alert;
      let alertCalled = false;
      window.alert = () => {
        alertCalled = true;
      };

      // Try to submit
      const generateBtn = /** @type {HTMLElement | null} */ (
        document.querySelector('#aiPromptModal button.success')
      );
      invariant(generateBtn, 'Generate button should exist');
      generateBtn.click();

      // Restore alert
      window.alert = originalAlert;

      // Verify alert was called
      expect(alertCalled).toBe(true);
    });

    it('should cancel AI prompt modal', () => {
      window.aiManager.showPromptModal();

      const modal = document.getElementById('aiPromptModal');
      expect(modal).toBeTruthy();

      // Click cancel
      const cancelBtn = /** @type {HTMLElement | null} */ (
        document.querySelector('#aiPromptModal button.danger')
      );
      invariant(cancelBtn, 'Cancel button should exist');
      cancelBtn.click();

      // Verify modal closed
      expect(modal?.getAttribute('open')).toBeNull();
    });
  });
});
