export const PRINTER_CONFIG = /** @type {const} */ ({
  WRITE_CHAR_UUID: '0000ff02-0000-1000-8000-00805f9b34fb',
  NOTIFY_CHAR_UUID: '0000ff03-0000-1000-8000-00805f9b34fb',
  SERVICE_UUID: '0000ff00-0000-1000-8000-00805f9b34fb',
  WIDTH: 384,
  BYTES_PER_LINE: 48,
  MTU_SIZE: 150,
  LINES_PER_CHUNK: 8,
});

// Standard ESC/POS command prefixes
export const COMMANDS = /** @type {const} */ ({
  ESC: 0x1b, // Escape - Standard ESC/POS command prefix
  GS: 0x1d,  // Group Separator - Graphics/advanced commands prefix
});

// Phomemo-specific printer initialization commands
// Protocol reverse-engineered from official Android app
// Reference: https://github.com/vivier/phomemo-tools
export const PHOMEMO_COMMANDS = /** @type {const} */ ({
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
