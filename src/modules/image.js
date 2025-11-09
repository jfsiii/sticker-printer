export class ImageManager {
  constructor() {
    this.fileInput = document.getElementById('imageInput');
    this.setupFileInputHandler();
  }

  setupFileInputHandler() {
    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          if (this.onImageLoaded) {
            this.onImageLoaded(img);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);

      e.target.value = '';
    });
  }

  uploadImage() {
    this.fileInput.click();
  }

  onImageLoaded(callback) {
    this.onImageLoaded = callback;
  }

  saveCanvasAsImage(canvas) {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `magic-print-${Date.now()}.png`;
    link.click();
  }
}
