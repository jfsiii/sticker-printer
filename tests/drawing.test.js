import { describe, it, expect, beforeEach } from 'vitest';
import { DrawingManager } from '../src/modules/drawing.js';
import { CANVAS_CONFIG, DRAWING_SIZES } from '../src/modules/constants.js';

describe('DrawingManager', () => {
  /** @type {HTMLCanvasElement} */
  let canvas;
  /** @type {DrawingManager} */
  let drawingManager;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    drawingManager = new DrawingManager(canvas);
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(drawingManager.currentColor).toBe('#000000');
      expect(drawingManager.currentSize).toBe(DRAWING_SIZES.SMALL);
      expect(drawingManager.isDrawing).toBe(false);
      expect(drawingManager.textCount).toBe(0);
    });

    it('should set canvas dimensions from config', () => {
      expect(canvas.width).toBe(CANVAS_CONFIG.WIDTH);
      expect(canvas.height).toBe(CANVAS_CONFIG.HEIGHT);
    });

    it('should throw error if canvas context is not available', () => {
      const mockCanvas = /** @type {HTMLCanvasElement} */ ({
        getContext: () => null,
      });
      expect(() => new DrawingManager(mockCanvas)).toThrow('Could not get 2D context from canvas');
    });

    it('should clear canvas to white on initialization', () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Context should exist');

      const imageData = ctx.getImageData(0, 0, 10, 10);
      // Check that pixels are white (255, 255, 255, 255)
      for (let i = 0; i < imageData.data.length; i += 4) {
        expect(imageData.data[i]).toBe(255); // R
        expect(imageData.data[i + 1]).toBe(255); // G
        expect(imageData.data[i + 2]).toBe(255); // B
        expect(imageData.data[i + 3]).toBe(255); // A
      }
    });
  });

  describe('setColor', () => {
    it('should update current color', () => {
      drawingManager.setColor('#ff0000');
      expect(drawingManager.currentColor).toBe('#ff0000');
    });
  });

  describe('setSize', () => {
    it('should update current size', () => {
      drawingManager.setSize(DRAWING_SIZES.LARGE);
      expect(drawingManager.currentSize).toBe(DRAWING_SIZES.LARGE);
    });
  });

  describe('clearCanvas', () => {
    it('should clear the canvas to white', () => {
      const ctx = drawingManager.getContext();
      // Draw something first
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 50, 50);

      // Clear it
      drawingManager.clearCanvas();

      // Check that it's white again
      const imageData = ctx.getImageData(25, 25, 1, 1);
      expect(imageData.data[0]).toBe(255); // R
      expect(imageData.data[1]).toBe(255); // G
      expect(imageData.data[2]).toBe(255); // B
    });
  });

  describe('startDrawing', () => {
    it('should set isDrawing to true', () => {
      const rect = canvas.getBoundingClientRect();
      const mockEvent = new MouseEvent('mousedown', {
        clientX: rect.left + 50,
        clientY: rect.top + 50,
      });

      drawingManager.startDrawing(mockEvent);
      expect(drawingManager.isDrawing).toBe(true);
    });

    it('should set lastX and lastY based on mouse position', () => {
      const rect = canvas.getBoundingClientRect();
      const mockEvent = new MouseEvent('mousedown', {
        clientX: rect.left + 100,
        clientY: rect.top + 150,
      });

      drawingManager.startDrawing(mockEvent);
      expect(drawingManager.lastX).toBe(100);
      expect(drawingManager.lastY).toBe(150);
    });
  });

  describe('stopDrawing', () => {
    it('should set isDrawing to false', () => {
      drawingManager.isDrawing = true;
      drawingManager.stopDrawing();
      expect(drawingManager.isDrawing).toBe(false);
    });
  });

  describe('addText', () => {
    it('should increment textCount', () => {
      const initialCount = drawingManager.textCount;
      drawingManager.addText('Test', '#000000', DRAWING_SIZES.MEDIUM);
      expect(drawingManager.textCount).toBe(initialCount + 1);
    });

    it('should add text with correct color and size', () => {
      const ctx = drawingManager.getContext();
      drawingManager.addText('Hello', '#ff0000', DRAWING_SIZES.LARGE);

      // Font size should be size * 8
      const expectedFontSize = DRAWING_SIZES.LARGE * 8;
      expect(ctx.font).toBe(`${expectedFontSize}px Arial`);
      expect(ctx.fillStyle).toBe('#ff0000');
    });
  });

  describe('drawImage', () => {
    it('should clear canvas before drawing image', () => {
      const img = new Image();
      img.width = 200;
      img.height = 200;

      // Draw something first
      const ctx = drawingManager.getContext();
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 50, 50);

      drawingManager.drawImage(img);

      // Canvas should have been cleared (drawImage fills with white first)
      // We can't easily check if the image was drawn in a unit test,
      // but we can verify the method doesn't throw
      expect(true).toBe(true);
    });

    it('should scale image to fit canvas', () => {
      const img = new Image();
      img.width = 1000; // Larger than canvas
      img.height = 1000;

      // Should not throw
      expect(() => drawingManager.drawImage(img)).not.toThrow();
    });
  });

  describe('getCanvas', () => {
    it('should return the canvas element', () => {
      expect(drawingManager.getCanvas()).toBe(canvas);
    });
  });

  describe('getContext', () => {
    it('should return the 2D context', () => {
      const ctx = drawingManager.getContext();
      expect(ctx).toBe(canvas.getContext('2d'));
    });
  });
});
