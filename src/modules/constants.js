/**
 * @typedef {Object} InitCommands
 * @property {readonly number[]} WAKE_PRINTER
 * @property {readonly number[]} SET_DENSITY
 * @property {readonly number[]} SET_LABEL_GAP
 * @property {readonly number[]} SET_PRINT_SPEED
 */

/**
 * @typedef {Object} PrinterConfig
 * @property {string} MODEL
 * @property {string} NAME
 * @property {string} [SERVICE_UUID]
 * @property {string} [WRITE_CHAR_UUID]
 * @property {string} [NOTIFY_CHAR_UUID]
 * @property {number} WIDTH
 * @property {number} BYTES_PER_LINE
 * @property {number} MTU_SIZE
 * @property {number} LINES_PER_CHUNK
 * @property {InitCommands | null} INIT_COMMANDS
 */

// Printer model identifiers
export const PRINTER_MODELS = /** @type {const} */ ({
  T02: 'T02',
  HB4057: 'HB-4057',
  UNKNOWN: 'Unknown',
});

/**
 * Unified printer configuration registry
 * Add new printer support by adding an entry here with its unique characteristics
 */
export const PRINTER_CONFIGS = /** @type {const} */ ({
  [PRINTER_MODELS.T02]: {
    MODEL: PRINTER_MODELS.T02,
    NAME: 'Phomemo T02/M02',
    SERVICE_UUID: '0000ff00-0000-1000-8000-00805f9b34fb',
    WRITE_CHAR_UUID: '0000ff02-0000-1000-8000-00805f9b34fb',
    NOTIFY_CHAR_UUID: '0000ff03-0000-1000-8000-00805f9b34fb',
    WIDTH: 384,
    BYTES_PER_LINE: 48,
    MTU_SIZE: 150,
    LINES_PER_CHUNK: 8,
    // Printer-specific initialization commands
    // Reference: https://github.com/vivier/phomemo-tools
    INIT_COMMANDS: {
      // Wake printer / Set paper type
      // M02 Protocol: https://github.com/vivier/phomemo-tools?tab=readme-ov-file#31-header
      // [0x1a, 0x04, paper_type] where 0x5a is standard thermal paper
      WAKE_PRINTER: [0x1a, 0x04, 0x5a],

      // Set print density/darkness
      // M02 Protocol: https://github.com/vivier/phomemo-tools?tab=readme-ov-file#31-header
      // [0x1a, 0x09, density] - 0x0c = medium density (range 0x00-0x0f)
      SET_DENSITY: [0x1a, 0x09, 0x0c],

      // Set label gap/calibration
      // M02 Protocol: https://github.com/vivier/phomemo-tools?tab=readme-ov-file#31-header
      // [0x1a, 0x07, 0x01, gap_high, gap_low] - 0x00, 0x00 = continuous paper (no gap)
      SET_LABEL_GAP: [0x1a, 0x07, 0x01, 0x00, 0x00],

      // Set print speed
      // M02 Protocol: https://github.com/vivier/phomemo-tools?tab=readme-ov-file#31-header
      // [0x1f, 0x11, 0x02, speed] - 0x04 = speed level 4
      SET_PRINT_SPEED: [0x1f, 0x11, 0x02, 0x04],
    },
  },
  [PRINTER_MODELS.HB4057]: {
    MODEL: PRINTER_MODELS.HB4057,
    NAME: 'Hello Blink HB-4057',
    // Uses Microchip RN4870/71 Transparent UART Service for BLE communication
    // Reference: https://ww1.microchip.com/downloads/en/DeviceDoc/50002466B.pdf (Appendix B)
    SERVICE_UUID: '49535343-fe7d-4ae5-8fa9-9fafd205e455',
    WRITE_CHAR_UUID: '49535343-8841-43f4-a8d4-ecbe34729bb3',
    NOTIFY_CHAR_UUID: '49535343-1e4d-4bd9-ba61-23c647249616',
    WIDTH: 384,
    BYTES_PER_LINE: 48,
    MTU_SIZE: 64, // Smaller chunks for HB-4057
    LINES_PER_CHUNK: 8,
    // No special init commands for HB-4057
    INIT_COMMANDS: null,
  },
});

/**
 * Default configuration for unknown/generic printers
 * Uses conservative settings and standard ESC/POS commands only
 */
export const DEFAULT_PRINTER_CONFIG = /** @type {const} */ ({
  MODEL: PRINTER_MODELS.UNKNOWN,
  NAME: 'Generic Printer',
  SERVICE_UUID: '',
  WRITE_CHAR_UUID: '',
  NOTIFY_CHAR_UUID: '',
  WIDTH: 384,
  BYTES_PER_LINE: 48,
  MTU_SIZE: 64, // Conservative smaller chunks
  LINES_PER_CHUNK: 8,
  INIT_COMMANDS: null, // Only use standard ESC/POS, no vendor-specific commands
});

// Standard ESC/POS command prefixes
export const COMMANDS = /** @type {const} */ ({
  ESC: 0x1b, // Escape - Standard ESC/POS command prefix
  GS: 0x1d,  // Group Separator - Graphics/advanced commands prefix
});

export const CANVAS_CONFIG = /** @type {const} */ ({
  WIDTH: 384,
  HEIGHT: 500,
});

export const DRAWING_SIZES = /** @type {const} */ ({
  SMALL: 2,
  MEDIUM: 5,
  LARGE: 10,
});
