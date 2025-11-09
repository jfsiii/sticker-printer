import { PRINTER_CONFIG, COMMANDS } from './constants.js';

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
      console.log('Requesting Bluetooth device...');
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [PRINTER_CONFIG.SERVICE_UUID],
      });

      console.log('Device selected:', this.device.name);
      if (!this.device.gatt) {
        throw new Error('GATT server not available');
      }
      const server = await this.device.gatt.connect();
      console.log('Connected to GATT server');
      const services = await server.getPrimaryServices();
      console.log('Found services:', services.length);

      let service = null;
      for (const s of services) {
        try {
          const char = await s.getCharacteristic(PRINTER_CONFIG.WRITE_CHAR_UUID);
          if (char) {
            service = s;
            console.log('Found printer service!');
            break;
          }
        } catch (e) {
          // Service doesn't have the characteristic we need
        }
      }

      if (!service) {
        console.error('Could not find printer service');
        throw new Error('Could not find printer service');
      }

      this.writeCharacteristic = await service.getCharacteristic(
        PRINTER_CONFIG.WRITE_CHAR_UUID
      );
      console.log('Got write characteristic');

      try {
        const notifyChar = await service.getCharacteristic(
          PRINTER_CONFIG.NOTIFY_CHAR_UUID
        );
        await notifyChar.startNotifications();
        console.log('Started notifications');
      } catch (e) {
        console.log('Notifications not available (optional)');
      }

      this.isConnected = true;
      console.log('Connection successful!');
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
   * @param {number[]} data - Array of bytes to send
   * @returns {Promise<void>}
   * @throws {Error} If printer is not connected or any chunk write fails
   */
  async sendData(data) {
    if (!this.writeCharacteristic) {
      throw new Error('Printer not connected');
    }

    console.log(
      `Sending ${data.length} bytes in ${Math.ceil(data.length / PRINTER_CONFIG.MTU_SIZE)} chunks of ${PRINTER_CONFIG.MTU_SIZE} bytes`
    );

    for (let i = 0; i < data.length; i += PRINTER_CONFIG.MTU_SIZE) {
      const chunk = data.slice(i, i + PRINTER_CONFIG.MTU_SIZE);
      try {
        await this.writeCharacteristic.writeValue(new Uint8Array(chunk));
        // Small delay between writes to ensure printer processes each chunk
        await new Promise((resolve) => setTimeout(resolve, 5));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Chunk write failed at offset ${i}:`, message);
        throw error;
      }
    }

    console.log('All data sent');
  }

  /**
   * Convert a canvas to a bitmap array for printing
   * @param {HTMLCanvasElement} canvas - The canvas to convert
   * @returns {number[][]} 2D array of bytes representing the bitmap
   * @throws {Error} If 2D context cannot be obtained from canvas
   */
  canvasToBitmap(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const bitmap = [];

    for (let y = 0; y < canvas.height; y++) {
      const row = [];
      for (let x = 0; x < PRINTER_CONFIG.BYTES_PER_LINE; x++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const px = x * 8 + bit;
          if (px < canvas.width) {
            const idx = (y * canvas.width + px) * 4;

            if (idx + 3 < data.length) {
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              const brightness = r * 0.299 + g * 0.587 + b * 0.114;

              if (brightness < 128) {
                byte |= 1 << (7 - bit);
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

    await this.sendData([ESC, 0x40]);
    await new Promise((resolve) => setTimeout(resolve, 200));

    await this.sendData([0x1a, 0x04, 0x5a]);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await this.sendData([0x1a, 0x09, 0x0c]);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await this.sendData([0x1a, 0x07, 0x01, 0x00, 0x00]);
    await new Promise((resolve) => setTimeout(resolve, 100));

    await this.sendData([ESC, 0x61, 0x01]);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await this.sendData([0x1f, 0x11, 0x02, 0x04]);
    await new Promise((resolve) => setTimeout(resolve, 100));

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
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    await this.sendData([ESC, 0x64, 0x03]);
    await new Promise((resolve) => setTimeout(resolve, 100));
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
