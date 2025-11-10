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
    clearCanvas: () => void;
    addText: () => void;
    captureCamera: () => Promise<void>;
    uploadImage: () => void;
    saveImageOnly: () => void;
    printImageOnly: () => Promise<void>;
    saveAndPrint: () => Promise<void>;
  }
}

export {};
