import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrinterManager } from '../src/modules/printer.js';
import { PRINTER_CONFIGS, PRINTER_MODELS } from '../src/modules/constants.js';

describe('PrinterManager', () => {
  /** @type {PrinterManager} */
  let printerManager;

  beforeEach(() => {
    printerManager = new PrinterManager();
  });

  describe('constructor', () => {
    it('should initialize with no device connected', () => {
      expect(printerManager.device).toBeNull();
      expect(printerManager.writeCharacteristic).toBeNull();
      expect(printerManager.isConnected).toBe(false);
    });
  });

  describe('getConnectionStatus', () => {
    it('should return false when not connected', () => {
      expect(printerManager.getConnectionStatus()).toBe(false);
    });

    it('should return true when connected', () => {
      printerManager.isConnected = true;
      expect(printerManager.getConnectionStatus()).toBe(true);
    });
  });

  describe('getDeviceName', () => {
    it('should return "Unknown" when no device is connected', () => {
      expect(printerManager.getDeviceName()).toBe('Unknown');
    });

    it('should return device name when connected', () => {
      printerManager.device = /** @type {BluetoothDevice} */ ({
        name: 'Test Printer',
      });
      expect(printerManager.getDeviceName()).toBe('Test Printer');
    });

    it('should return "Unknown" when device has no name', () => {
      printerManager.device = /** @type {BluetoothDevice} */ ({
        name: undefined,
      });
      expect(printerManager.getDeviceName()).toBe('Unknown');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from device and reset state', () => {
      const mockDisconnect = vi.fn();
      printerManager.device = /** @type {BluetoothDevice} */ ({
        gatt: {
          connected: true,
          disconnect: mockDisconnect,
        },
      });
      printerManager.isConnected = true;
      printerManager.writeCharacteristic = /** @type {BluetoothRemoteGATTCharacteristic} */ ({});

      printerManager.disconnect();

      expect(mockDisconnect).toHaveBeenCalled();
      expect(printerManager.isConnected).toBe(false);
      expect(printerManager.device).toBeNull();
      expect(printerManager.writeCharacteristic).toBeNull();
    });

    it('should handle disconnect when device is not connected', () => {
      printerManager.device = /** @type {BluetoothDevice} */ ({
        gatt: {
          connected: false,
          disconnect: vi.fn(),
        },
      });

      expect(() => printerManager.disconnect()).not.toThrow();
      expect(printerManager.isConnected).toBe(false);
    });

    it('should handle disconnect when no device exists', () => {
      expect(() => printerManager.disconnect()).not.toThrow();
      expect(printerManager.isConnected).toBe(false);
    });
  });

  describe('canvasToBitmap', () => {
    it('should convert canvas to bitmap array', () => {
      const canvas = document.createElement('canvas');
      const testConfig = PRINTER_CONFIGS[PRINTER_MODELS.T02];
      canvas.width = testConfig.WIDTH;
      canvas.height = 100;

      // Set up printer config
      printerManager.config = testConfig;

      const bitmap = printerManager.canvasToBitmap(canvas);

      expect(bitmap).toHaveLength(100); // Height
      expect(bitmap[0]).toHaveLength(testConfig.BYTES_PER_LINE);
    });

    it('should convert white pixels to 0 bits', () => {
      const canvas = document.createElement('canvas');
      const testConfig = PRINTER_CONFIGS[PRINTER_MODELS.T02];
      canvas.width = testConfig.WIDTH;
      canvas.height = 1;

      // Set up printer config
      printerManager.config = testConfig;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Context should exist');

      // Fill with white
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const bitmap = printerManager.canvasToBitmap(canvas);

      // All bytes should be 0 (white = no ink)
      for (const byte of bitmap[0]) {
        expect(byte).toBe(0);
      }
    });

    it('should convert black pixels to 1 bits', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 8; // Just one byte
      canvas.height = 1;

      // Set up printer config
      printerManager.config = PRINTER_CONFIGS[PRINTER_MODELS.T02];

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Context should exist');

      // Fill with black
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const bitmap = printerManager.canvasToBitmap(canvas);

      // First byte should be 255 (all bits set)
      expect(bitmap[0][0]).toBe(255);
    });

    it('should throw error if context cannot be obtained', () => {
      const testConfig = PRINTER_CONFIGS[PRINTER_MODELS.T02];
      const mockCanvas = /** @type {HTMLCanvasElement} */ ({
        width: testConfig.WIDTH,
        height: 100,
        getContext: () => null,
      });

      // Set up printer config
      printerManager.config = testConfig;

      expect(() => printerManager.canvasToBitmap(mockCanvas)).toThrow(
        'Could not get 2D context from canvas'
      );
    });

    it('should throw error if printer not configured', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 384;
      canvas.height = 100;

      // No config set
      printerManager.config = null;

      expect(() => printerManager.canvasToBitmap(canvas)).toThrow(
        'Printer not configured'
      );
    });
  });

  describe('sendData', () => {
    it('should throw error if not connected', async () => {
      await expect(printerManager.sendData([1, 2, 3])).rejects.toThrow(
        'Printer not connected'
      );
    });

    it('should send data in chunks', async () => {
      const testConfig = PRINTER_CONFIGS[PRINTER_MODELS.T02];
      const mockWrite = vi.fn().mockResolvedValue(undefined);
      printerManager.writeCharacteristic = /** @type {BluetoothRemoteGATTCharacteristic} */ ({
        writeValue: mockWrite,
        properties: { write: true, writeWithoutResponse: false },
      });
      printerManager.config = testConfig;

      const data = new Array(testConfig.MTU_SIZE * 2 + 10).fill(0);
      await printerManager.sendData(data);

      // Should be called 3 times (2 full chunks + 1 partial)
      expect(mockWrite).toHaveBeenCalledTimes(3);
    });

    it('should send correct chunk sizes', async () => {
      const testConfig = PRINTER_CONFIGS[PRINTER_MODELS.T02];
      const mockWrite = vi.fn().mockResolvedValue(undefined);
      printerManager.writeCharacteristic = /** @type {BluetoothRemoteGATTCharacteristic} */ ({
        writeValue: mockWrite,
        properties: { write: true, writeWithoutResponse: false },
      });
      printerManager.config = testConfig;

      const data = new Array(testConfig.MTU_SIZE + 10).fill(0);
      await printerManager.sendData(data);

      // First chunk should be MTU_SIZE
      expect(mockWrite.mock.calls[0][0]).toHaveLength(testConfig.MTU_SIZE);
      // Second chunk should be 10
      expect(mockWrite.mock.calls[1][0]).toHaveLength(10);
    });

    it('should propagate write errors', async () => {
      const mockWrite = vi.fn().mockRejectedValue(new Error('Write failed'));
      printerManager.writeCharacteristic = /** @type {BluetoothRemoteGATTCharacteristic} */ ({
        writeValue: mockWrite,
        properties: { write: true, writeWithoutResponse: false },
      });
      printerManager.config = PRINTER_CONFIGS[PRINTER_MODELS.T02];

      await expect(printerManager.sendData([1, 2, 3])).rejects.toThrow('Write failed');
    });
  });

});
