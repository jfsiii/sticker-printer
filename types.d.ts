/**
 * Global type definitions for the Sticker Printer app
 */

/**
 * Extend the Window interface with our global functions
 * This prevents accidental redefinition and provides type safety
 */
declare global {
  interface Window {
    modalManager: import('./src/modules/modals.js').ModalManager;
    drawingManager: import('./src/modules/drawing.js').DrawingManager;
    cameraManager: import('./src/modules/camera.js').CameraManager;
    imageManager: import('./src/modules/image.js').ImageManager;
    aiManager: import('./src/modules/ai.js').AIManager;
  }
}

export {};
