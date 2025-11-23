import { describe, it, expect } from 'vitest';
import {
  PRINTER_CONFIGS,
  PRINTER_MODELS,
  DEFAULT_PRINTER_CONFIG,
  COMMANDS,
  CANVAS_CONFIG,
  DRAWING_SIZES,
} from '../src/modules/constants.js';

describe('PRINTER_CONFIGS', () => {
  describe('T02 printer', () => {
    const t02Config = PRINTER_CONFIGS[PRINTER_MODELS.T02];

    it('should have correct Bluetooth UUIDs', () => {
      expect(t02Config.WRITE_CHAR_UUID).toBe('0000ff02-0000-1000-8000-00805f9b34fb');
      expect(t02Config.NOTIFY_CHAR_UUID).toBe('0000ff03-0000-1000-8000-00805f9b34fb');
      expect(t02Config.SERVICE_UUID).toBe('0000ff00-0000-1000-8000-00805f9b34fb');
    });

    it('should have correct printer dimensions', () => {
      expect(t02Config.WIDTH).toBe(384);
      expect(t02Config.BYTES_PER_LINE).toBe(48);
    });

    it('should have correct communication settings', () => {
      expect(t02Config.MTU_SIZE).toBe(150);
      expect(t02Config.LINES_PER_CHUNK).toBe(8);
    });

    it('should calculate BYTES_PER_LINE correctly for WIDTH', () => {
      // WIDTH / 8 should equal BYTES_PER_LINE (1 byte = 8 pixels)
      expect(t02Config.WIDTH / 8).toBe(t02Config.BYTES_PER_LINE);
    });

    it('should have initialization commands', () => {
      expect(t02Config.INIT_COMMANDS).toBeDefined();
      expect(t02Config.INIT_COMMANDS?.WAKE_PRINTER).toBeDefined();
      expect(t02Config.INIT_COMMANDS?.SET_DENSITY).toBeDefined();
    });
  });

  describe('HB4057 printer', () => {
    const hbConfig = PRINTER_CONFIGS[PRINTER_MODELS.HB4057];

    it('should have correct Bluetooth UUIDs', () => {
      expect(hbConfig.WRITE_CHAR_UUID).toBe('49535343-8841-43f4-a8d4-ecbe34729bb3');
      expect(hbConfig.NOTIFY_CHAR_UUID).toBe('49535343-1e4d-4bd9-ba61-23c647249616');
      expect(hbConfig.SERVICE_UUID).toBe('49535343-fe7d-4ae5-8fa9-9fafd205e455');
    });

    it('should have correct printer dimensions', () => {
      expect(hbConfig.WIDTH).toBe(384);
      expect(hbConfig.BYTES_PER_LINE).toBe(48);
    });

    it('should have smaller MTU size', () => {
      expect(hbConfig.MTU_SIZE).toBe(64);
      expect(hbConfig.MTU_SIZE).toBeLessThan(PRINTER_CONFIGS[PRINTER_MODELS.T02].MTU_SIZE);
    });

    it('should not have initialization commands', () => {
      expect(hbConfig.INIT_COMMANDS).toBeNull();
    });
  });

  it('should have all printer models configured', () => {
    expect(PRINTER_CONFIGS[PRINTER_MODELS.T02]).toBeDefined();
    expect(PRINTER_CONFIGS[PRINTER_MODELS.HB4057]).toBeDefined();
  });
});

describe('DEFAULT_PRINTER_CONFIG', () => {
  it('should have conservative settings', () => {
    expect(DEFAULT_PRINTER_CONFIG.MTU_SIZE).toBe(64);
    expect(DEFAULT_PRINTER_CONFIG.MODEL).toBe(PRINTER_MODELS.UNKNOWN);
  });

  it('should have standard dimensions', () => {
    expect(DEFAULT_PRINTER_CONFIG.WIDTH).toBe(384);
    expect(DEFAULT_PRINTER_CONFIG.BYTES_PER_LINE).toBe(48);
  });

  it('should not have initialization commands', () => {
    expect(DEFAULT_PRINTER_CONFIG.INIT_COMMANDS).toBeNull();
  });
});

describe('COMMANDS', () => {
  it('should have correct ESC/POS command codes', () => {
    expect(COMMANDS.ESC).toBe(0x1b);
    expect(COMMANDS.GS).toBe(0x1d);
  });
});

describe('CANVAS_CONFIG', () => {
  it('should have correct canvas dimensions', () => {
    expect(CANVAS_CONFIG.WIDTH).toBe(384);
    expect(CANVAS_CONFIG.HEIGHT).toBe(500);
  });

  it('should match printer widths', () => {
    // All printers should have the same width as canvas
    Object.values(PRINTER_CONFIGS).forEach((config) => {
      expect(CANVAS_CONFIG.WIDTH).toBe(config.WIDTH);
    });
  });
});

describe('DRAWING_SIZES', () => {
  it('should have three size options', () => {
    expect(DRAWING_SIZES.SMALL).toBe(2);
    expect(DRAWING_SIZES.MEDIUM).toBe(5);
    expect(DRAWING_SIZES.LARGE).toBe(10);
  });

  it('should have sizes in ascending order', () => {
    expect(DRAWING_SIZES.SMALL).toBeLessThan(DRAWING_SIZES.MEDIUM);
    expect(DRAWING_SIZES.MEDIUM).toBeLessThan(DRAWING_SIZES.LARGE);
  });
});
