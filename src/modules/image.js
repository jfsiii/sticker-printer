/**
 * Manages image upload and saving functionality
 */
export class ImageManager {
  /** @type {HTMLInputElement} */
  fileInput;

  /** @type {((img: HTMLImageElement) => void) | null} */
  onImageLoaded;

  /**
   * @throws {Error} If image input element not found or is not an input element
   */
  constructor() {
    const fileInput = document.getElementById('imageInput');
    if (!(fileInput instanceof HTMLInputElement)) {
      throw new Error('Image input element not found or is not an input element');
    }
    this.fileInput = fileInput;
    this.onImageLoaded = null;
    this.setupFileInputHandler();
  }

  /**
   * Set up file input change handler
   * @returns {void}
   */
  setupFileInputHandler() {
    this.fileInput.addEventListener('change', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement) || !target.files) {
        return;
      }

      const file = target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target) {
          return;
        }
        const result = event.target.result;
        if (typeof result !== 'string') {
          return;
        }

        const img = new Image();
        img.onload = () => {
          if (this.onImageLoaded) {
            this.onImageLoaded(img);
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);

      target.value = '';
    });
  }

  /**
   * Trigger file input click to open file picker
   * @returns {void}
   */
  uploadImage() {
    this.fileInput.click();
  }

  /**
   * Save canvas as a PNG image file
   * @param {HTMLCanvasElement} canvas - The canvas to save
   * @returns {void}
   */
  saveCanvasAsImage(canvas) {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `magic-print-${Date.now()}.png`;
    link.click();
  }
}
