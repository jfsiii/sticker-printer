import { PRINTER_CONFIG, COMMANDS, PHOMEMO_COMMANDS } from './constants.js';

/**
 * Sleep/wait for the specified number of milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Manages Bluetooth printer connections and printing operations
 */
export class PrinterManager {
  /** @type {BluetoothDevice | null} */
  device;

  /** @type {BluetoothRemoteGATTCharacteristic | null} */
  writeCharacteristic;

  /** @type {boolean} */
  isConnected;

  constructor() {
    this.device = null;
    this.writeCharacteristic = null;
    this.isConnected = false;
  }

  /**
   * Connect to a Bluetooth printer device
   * @returns {Promise<string>} The name of the connected device
   * @throws {Error} If connection fails, device/service not found, or GATT server unavailable
   */
  async connect() {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [PRINTER_CONFIG.SERVICE_UUID],
      });

      if (!this.device.gatt) {
        throw new Error('GATT server not available');
      }
      const server = await this.device.gatt.connect();
      const services = await server.getPrimaryServices();

      let service = null;
      for (const s of services) {
        try {
          const char = await s.getCharacteristic(PRINTER_CONFIG.WRITE_CHAR_UUID);
          if (char) {
            service = s;
            break;
          }
        } catch (e) {
          // Service doesn't have the characteristic we need
        }
      }

      if (!service) {
        throw new Error('Could not find printer service');
      }

      this.writeCharacteristic = await service.getCharacteristic(
        PRINTER_CONFIG.WRITE_CHAR_UUID
      );

      try {
        const notifyChar = await service.getCharacteristic(
          PRINTER_CONFIG.NOTIFY_CHAR_UUID
        );
        await notifyChar.startNotifications();
      } catch (e) {
        // Notifications not available (optional)
      }

      this.isConnected = true;
      return this.device.name || 'Phomemo';
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from the printer
   * @returns {void}
   */
  disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.device = null;
    this.writeCharacteristic = null;
  }

  /**
   * Send raw data to the printer in chunks
   * @param {number[] | readonly number[]} data - Array of bytes to send
   * @returns {Promise<void>}
   * @throws {Error} If printer is not connected or any chunk write fails
   */
  async sendData(data) {
    if (!this.writeCharacteristic) {
      throw new Error('Printer not connected');
    }

    for (let i = 0; i < data.length; i += PRINTER_CONFIG.MTU_SIZE) {
      const chunk = data.slice(i, i + PRINTER_CONFIG.MTU_SIZE);
      await this.writeCharacteristic.writeValue(new Uint8Array(chunk));
      // Small delay between writes to ensure printer processes each chunk
      await sleep(5);
    }
  }

  /**
   * Convert a canvas to a 1-bit bitmap array for thermal printing
   *
   * Thermal printers need images in a specific format:
   * - 1 bit per pixel (black or white only, no grayscale)
   * - Pixels packed into bytes (8 pixels = 1 byte)
   * - MSB (Most Significant Bit) first: leftmost pixel = bit 7, rightmost = bit 0
   * - Organized as rows of bytes
   *
   * @param {HTMLCanvasElement} canvas - The canvas to convert
   * @returns {number[][]} 2D array where each inner array is a row of bytes
   * @throws {Error} If 2D context cannot be obtained from canvas
   */
  canvasToBitmap(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    // Get raw RGBA pixel data from canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data; // [r, g, b, a, r, g, b, a, ...]

    const bitmap = [];

    // Loop 1: Process each horizontal line of pixels (y-axis)
    for (let y = 0; y < canvas.height; y++) {
      const row = [];

      // Loop 2: Process each byte in this row
      // 384 pixels wide ÷ 8 pixels per byte = 48 bytes per row
      for (let x = 0; x < PRINTER_CONFIG.BYTES_PER_LINE; x++) {
        let byte = 0;

        // Loop 3: Pack 8 pixels into 1 byte
        // Each bit represents one pixel: 1 = black, 0 = white
        for (let bit = 0; bit < 8; bit++) {
          const px = x * 8 + bit; // Calculate actual pixel x-coordinate

          if (px < canvas.width) {
            // Calculate index into RGBA array: (row * width + column) * 4 channels
            const idx = (y * canvas.width + px) * 4;

            if (idx + 3 < data.length) {
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              // Convert RGB to perceived brightness using standard luminance formula
              // Human eyes are more sensitive to green, less to blue
              const brightness = r * 0.299 + g * 0.587 + b * 0.114;

              // If pixel is dark (< 128 on 0-255 scale), set bit to 1 (print black)
              if (brightness < 128) {
                byte |= 1 << (7 - bit); // Set bit from left to right (MSB first)
              }
            }
          }
        }
        row.push(byte);
      }
      bitmap.push(row);
    }

    return bitmap;
  }

  /**
   * Print a bitmap to the connected printer
   * @param {number[][]} bitmap - 2D array of bytes representing the image
   * @returns {Promise<void>}
   */
  async printBitmap(bitmap) {
    const { ESC, GS } = COMMANDS;

    // ESC @ - Initialize printer (reset to default state)
    await this.sendData([ESC, 0x40]);
    await sleep(200);

    // Phomemo-specific initialization sequence
    await this.sendData(PHOMEMO_COMMANDS.WAKE_PRINTER);
    await sleep(100);
    await this.sendData(PHOMEMO_COMMANDS.SET_DENSITY);
    await sleep(100);
    await this.sendData(PHOMEMO_COMMANDS.SET_LABEL_GAP);
    await sleep(100);

    // ESC a - Set justification (0x01 = center)
    await this.sendData([ESC, 0x61, 0x01]);
    await sleep(100);
    await this.sendData(PHOMEMO_COMMANDS.SET_PRINT_SPEED);
    await sleep(100);

    const height = bitmap.length;

    for (
      let startLine = 0;
      startLine < height;
      startLine += PRINTER_CONFIG.LINES_PER_CHUNK
    ) {
      const endLine = Math.min(
        startLine + PRINTER_CONFIG.LINES_PER_CHUNK,
        height
      );
      const chunkHeight = endLine - startLine;

      const header = [
        GS,
        0x76,
        0x30,
        0x00,
        PRINTER_CONFIG.BYTES_PER_LINE,
        0x00,
        chunkHeight & 0xff,
        (chunkHeight >> 8) & 0xff,
      ];

      const chunkData = [];
      for (let i = startLine; i < endLine; i++) {
        chunkData.push(...bitmap[i]);
      }

      await this.sendData([...header, ...chunkData]);
      await sleep(150);
    }

    // ESC d - Print and feed paper (0x03 = 3 lines)
    await this.sendData([ESC, 0x64, 0x03]);
    await sleep(100);
  }

  /**
   * Print the contents of a canvas
   * @param {HTMLCanvasElement} canvas - The canvas to print
   * @returns {Promise<void>}
   */
  async print(canvas) {
    const bitmap = this.canvasToBitmap(canvas);
    await this.printBitmap(bitmap);
  }

  /**
   * Get the name of the connected device
   * @returns {string} The device name or 'Unknown' if not connected
   */
  getDeviceName() {
    return this.device?.name || 'Unknown';
  }

  /**
   * Check if printer is currently connected
   * @returns {boolean} True if connected, false otherwise
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}
