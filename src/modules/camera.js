import { PRINTER_CONFIG } from './constants.js';

export class CameraManager {
  constructor(modalManager) {
    this.modalManager = modalManager;
    this.video = document.getElementById('cameraVideo');
    this.currentStream = null;
    this.onImageCaptured = null;
  }

  async captureCamera() {
    try {
      this.currentStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      this.video.srcObject = this.currentStream;
      this.video.play();

      setTimeout(() => {
        this.showCameraPreview();
      }, 500);
    } catch (error) {
      throw new Error(`Could not access camera: ${error.message}`);
    }
  }

  showCameraPreview() {
    this.modalManager.showStatus('📷 Camera Ready', 'Position and tap Capture');

    const statusTitle = document.getElementById('statusTitle');
    const statusMessage = document.getElementById('statusMessage');
    const statusCloseBtn = document.getElementById('statusCloseBtn');

    statusTitle.innerHTML = '📷 Camera';
    statusMessage.innerHTML = `<video id="previewVideo" style="width: 100%; max-width: 300px; border-radius: 8px; margin: 10px 0;" playsinline autoplay muted></video>`;
    statusCloseBtn.textContent = '✓ Capture';
    statusCloseBtn.style.display = 'block';

    const previewVideo = document.getElementById('previewVideo');
    previewVideo.srcObject = this.currentStream;
    previewVideo.onloadedmetadata = () => previewVideo.play();

    statusCloseBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        const img = this.captureFrame(previewVideo);

        // Call the callback with the captured image
        if (this.onImageCaptured) {
          this.onImageCaptured(img);
        }

        this.modalManager.closeStatus();
        this.modalManager.showStatusWithClose('✅ Photo Captured!', 'Ready to save or print');
      } catch (error) {
        this.modalManager.showStatusWithClose('❌ Error', error.message);
      }

      // Reset the close button
      statusCloseBtn.textContent = 'OK';
      statusCloseBtn.onclick = () => this.modalManager.closeStatus();
    };
  }

  captureFrame(previewVideo) {
    if (!previewVideo) {
      throw new Error('Could not capture video frame');
    }

    const videoWidth = previewVideo.videoWidth;
    const videoHeight = previewVideo.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) {
      throw new Error('Video not ready');
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = PRINTER_CONFIG.WIDTH;
    tempCanvas.height = 400;

    const tempCtx = tempCanvas.getContext('2d');

    const targetRatio = PRINTER_CONFIG.WIDTH / 400;
    const videoRatio = videoWidth / videoHeight;

    let sx, sy, sWidth, sHeight;

    if (videoRatio > targetRatio) {
      sHeight = videoHeight;
      sWidth = videoHeight * targetRatio;
      sx = (videoWidth - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = videoWidth;
      sHeight = videoWidth / targetRatio;
      sx = 0;
      sy = (videoHeight - sHeight) / 2;
    }

    tempCtx.drawImage(
      previewVideo,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      PRINTER_CONFIG.WIDTH,
      400
    );

    // Stop the camera stream
    this.stopStream();

    const img = new Image();
    img.src = tempCanvas.toDataURL();
    return img;
  }

  stopStream() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => track.stop());
      this.currentStream = null;
    }
  }
}
