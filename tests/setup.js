/**
 * Setup file for unit tests
 * This runs before each test file in the unit test suite
 */

// Mock Web Bluetooth API for unit tests
global.navigator = global.navigator || {};
global.navigator.bluetooth = {
  requestDevice: () => Promise.reject(new Error('Bluetooth not available in test environment')),
  getDevices: () => Promise.resolve([]),
};

// Mock canvas API with actual pixel tracking
const mockCanvas2DContext = (canvas) => {
  let fillStyleValue = '';
  let strokeStyleValue = '';
  let fontValue = '';

  // Create a pixel buffer for the canvas
  const canvasWidth = canvas.width || 800;
  const canvasHeight = canvas.height || 600;
  const pixelBuffer = new Uint8ClampedArray(canvasWidth * canvasHeight * 4);

  // Initialize to white
  for (let i = 0; i < pixelBuffer.length; i += 4) {
    pixelBuffer[i] = 255;     // R
    pixelBuffer[i + 1] = 255; // G
    pixelBuffer[i + 2] = 255; // B
    pixelBuffer[i + 3] = 255; // A
  }

  // Helper to convert CSS color to RGB
  const colorToRGB = (color) => {
    if (color === 'white') return { r: 255, g: 255, b: 255 };
    if (color === 'black' || color === '#000000') return { r: 0, g: 0, b: 0 };
    // Parse hex colors
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      return { r, g, b };
    }
    return { r: 255, g: 255, b: 255 }; // default to white
  };

  return {
    get fillStyle() {
      return fillStyleValue;
    },
    set fillStyle(value) {
      fillStyleValue = value;
    },
    get strokeStyle() {
      return strokeStyleValue;
    },
    set strokeStyle(value) {
      strokeStyleValue = value;
    },
    get font() {
      return fontValue;
    },
    set font(value) {
      fontValue = value;
    },
    lineWidth: 1,
    lineCap: 'round',
    lineJoin: 'round',
    fillRect: function (x, y, width, height) {
      // Update pixel buffer with the fill color
      const rgb = colorToRGB(fillStyleValue);
      const startX = Math.max(0, Math.floor(x));
      const startY = Math.max(0, Math.floor(y));
      const endX = Math.min(canvasWidth, Math.ceil(x + width));
      const endY = Math.min(canvasHeight, Math.ceil(y + height));

      for (let py = startY; py < endY; py++) {
        for (let px = startX; px < endX; px++) {
          const idx = (py * canvasWidth + px) * 4;
          pixelBuffer[idx] = rgb.r;
          pixelBuffer[idx + 1] = rgb.g;
          pixelBuffer[idx + 2] = rgb.b;
          pixelBuffer[idx + 3] = 255;
        }
      }
    },
    clearRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fillText: () => {},
    measureText: () => ({ width: 0 }),
    drawImage: () => {},
    getImageData: (x, y, width, height) => {
      const data = new Uint8ClampedArray(width * height * 4);
      const startX = Math.max(0, Math.floor(x));
      const startY = Math.max(0, Math.floor(y));

      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const srcX = startX + px;
          const srcY = startY + py;
          const srcIdx = (srcY * canvasWidth + srcX) * 4;
          const dstIdx = (py * width + px) * 4;

          if (srcX < canvasWidth && srcY < canvasHeight && srcIdx < pixelBuffer.length) {
            data[dstIdx] = pixelBuffer[srcIdx];
            data[dstIdx + 1] = pixelBuffer[srcIdx + 1];
            data[dstIdx + 2] = pixelBuffer[srcIdx + 2];
            data[dstIdx + 3] = pixelBuffer[srcIdx + 3];
          } else {
            // Out of bounds = white
            data[dstIdx] = 255;
            data[dstIdx + 1] = 255;
            data[dstIdx + 2] = 255;
            data[dstIdx + 3] = 255;
          }
        }
      }

      return { data, width, height };
    },
  };
};

// Override HTMLCanvasElement.prototype.getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (contextType, options) {
  if (contextType === '2d') {
    // Store the mock context on the canvas instance
    if (!this._mockContext) {
      this._mockContext = mockCanvas2DContext(this);
    }
    return this._mockContext;
  }
  return originalGetContext?.call(this, contextType, options) || null;
};
