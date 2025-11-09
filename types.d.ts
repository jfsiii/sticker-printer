/**
 * Global type definitions for the Sticker Printer app
 */

/**
 * Extend the Window interface with our global functions
 * This prevents accidental redefinition and provides type safety
 */
declare global {
  interface Window {
    clearCanvas: () => void;
    showTextTools: () => void;
    closeTextTools: () => void;
    addText: () => void;
    showAITools: () => void;
    closeAITools: () => void;
    generateAIImage: () => Promise<void>;
    captureCamera: () => Promise<void>;
    uploadImage: () => void;
    saveImageOnly: () => void;
    printImageOnly: () => Promise<void>;
    saveAndPrint: () => Promise<void>;
    closePrintOptionsModal: () => void;
    closeStatusModal: () => void;
  }
}

export {};
