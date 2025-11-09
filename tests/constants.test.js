import { describe, it, expect } from 'vitest';
import {
  PRINTER_CONFIG,
  COMMANDS,
  CANVAS_CONFIG,
  DRAWING_SIZES,
} from '../src/modules/constants.js';

describe('PRINTER_CONFIG', () => {
  it('should have correct Bluetooth UUIDs', () => {
    expect(PRINTER_CONFIG.WRITE_CHAR_UUID).toBe('0000ff02-0000-1000-8000-00805f9b34fb');
    expect(PRINTER_CONFIG.NOTIFY_CHAR_UUID).toBe('0000ff03-0000-1000-8000-00805f9b34fb');
    expect(PRINTER_CONFIG.SERVICE_UUID).toBe('0000ff00-0000-1000-8000-00805f9b34fb');
  });

  it('should have correct printer dimensions', () => {
    expect(PRINTER_CONFIG.WIDTH).toBe(384);
    expect(PRINTER_CONFIG.BYTES_PER_LINE).toBe(48);
  });

  it('should have correct communication settings', () => {
    expect(PRINTER_CONFIG.MTU_SIZE).toBe(150);
    expect(PRINTER_CONFIG.LINES_PER_CHUNK).toBe(8);
  });

  it('should calculate BYTES_PER_LINE correctly for WIDTH', () => {
    // WIDTH / 8 should equal BYTES_PER_LINE (1 byte = 8 pixels)
    expect(PRINTER_CONFIG.WIDTH / 8).toBe(PRINTER_CONFIG.BYTES_PER_LINE);
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

  it('should match printer width', () => {
    expect(CANVAS_CONFIG.WIDTH).toBe(PRINTER_CONFIG.WIDTH);
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
