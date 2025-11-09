import { CANVAS_CONFIG, DRAWING_SIZES } from './constants.js';

/**
 * Manages canvas drawing operations including mouse/touch input and rendering
 */
export class DrawingManager {
  /** @type {HTMLCanvasElement} */
  canvas;

  /** @type {CanvasRenderingContext2D} */
  ctx;

  /** @type {string} */
  currentColor;

  /** @type {number} */
  currentSize;

  /** @type {boolean} */
  isDrawing;

  /** @type {number} */
  lastX;

  /** @type {number} */
  lastY;

  /** @type {number} */
  textCount;

  /**
   * @param {HTMLCanvasElement} canvas - The canvas element to draw on
   * @throws {Error} If 2D context cannot be obtained from canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;
    this.currentColor = '#000000';
    this.currentSize = DRAWING_SIZES.SMALL;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.textCount = 0;

    this.initCanvas();
    this.setupEventListeners();
  }

  /**
   * Initialize the canvas with default dimensions and clear it
   * @returns {void}
   */
  initCanvas() {
    this.canvas.width = CANVAS_CONFIG.WIDTH;
    this.canvas.height = CANVAS_CONFIG.HEIGHT;
    this.clearCanvas();
  }

  /**
   * Set up mouse and touch event listeners for drawing
   * @returns {void}
   */
  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const mouseEvent = new MouseEvent('mouseup', {});
      this.canvas.dispatchEvent(mouseEvent);
    });
  }

  /**
   * Start drawing at the mouse/touch position
   * @param {MouseEvent} e - The mouse event
   * @returns {void}
   */
  startDrawing(e) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
  }

  /**
   * Draw a line from the last position to the current position
   * @param {MouseEvent} e - The mouse event
   * @returns {void}
   */
  draw(e) {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentSize;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  /**
   * Stop the current drawing operation
   * @returns {void}
   */
  stopDrawing() {
    this.isDrawing = false;
  }

  /**
   * Set the current drawing color
   * @param {string} color - The color in CSS format (e.g., '#000000')
   * @returns {void}
   */
  setColor(color) {
    this.currentColor = color;
  }

  /**
   * Set the current brush size
   * @param {number} size - The brush size in pixels
   * @returns {void}
   */
  setSize(size) {
    this.currentSize = size;
  }

  /**
   * Clear the entire canvas to white
   * @returns {void}
   */
  clearCanvas() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Add text to the canvas at a semi-random position
   * @param {string} text - The text to add
   * @param {string} color - The text color in CSS format
   * @param {number} size - The size multiplier for the text
   * @returns {void}
   */
  addText(text, color, size) {
    const fontSize = size * 8;
    const x = Math.random() * (this.canvas.width - 100);
    const y = 40 + (this.textCount * 50) % (this.canvas.height - fontSize * 2);

    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillText(text, x, y);

    this.textCount++;
  }

  /**
   * Draw an image on the canvas, scaling it to fit
   * @param {HTMLImageElement} img - The image to draw
   * @returns {void}
   */
  drawImage(img) {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const scale = Math.min(
      this.canvas.width / img.width,
      this.canvas.height / img.height
    );
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (this.canvas.width - scaledWidth) / 2;
    const y = (this.canvas.height - scaledHeight) / 2;

    this.ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  }

  /**
   * Get the canvas element
   * @returns {HTMLCanvasElement}
   */
  getCanvas() {
    return this.canvas;
  }

  /**
   * Get the 2D rendering context
   * @returns {CanvasRenderingContext2D}
   */
  getContext() {
    return this.ctx;
  }
}
