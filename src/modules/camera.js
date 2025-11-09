import { PRINTER_CONFIG } from './constants.js';
import { ModalManager } from './modals.js';

/**
 * Manages camera capture and video preview
 */
export class CameraManager {
  /** @type {ModalManager} */
  modalManager;

  /** @type {HTMLVideoElement} */
  video;

  /** @type {MediaStream | null} */
  currentStream;

  /** @type {((img: HTMLImageElement) => void) | null} */
  onImageCaptured;

  /**
   * @param {ModalManager} modalManager - The modal manager instance
   * @throws {Error} If camera video element not found or is not a video element
   */
  constructor(modalManager) {
    this.modalManager = modalManager;
    const video = document.getElementById('cameraVideo');
    if (!(video instanceof HTMLVideoElement)) {
      throw new Error('Camera video element not found or is not a video element');
    }
    this.video = video;
    this.currentStream = null;
    this.onImageCaptured = null;
  }

  /**
   * Start camera capture and show preview
   * @returns {Promise<void>}
   * @throws {Error} If camera access is denied or fails
   */
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
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Could not access camera: ${message}`);
    }
  }

  /**
   * Show camera preview modal with capture button
   * @returns {void}
   * @throws {Error} If status modal elements or preview video element not found
   */
  showCameraPreview() {
    this.modalManager.showStatus('📷 Camera Ready', 'Position and tap Capture');

    const statusTitle = document.getElementById('statusTitle');
    const statusMessage = document.getElementById('statusMessage');
    const statusCloseBtn = document.getElementById('statusCloseBtn');

    if (!statusTitle || !statusMessage || !statusCloseBtn) {
      throw new Error('Status modal elements not found');
    }

    statusTitle.innerHTML = '📷 Camera';
    statusMessage.innerHTML = `<video id="previewVideo" style="width: 100%; max-width: 300px; border-radius: 8px; margin: 10px 0;" playsinline autoplay muted></video>`;
    statusCloseBtn.textContent = '✓ Capture';
    statusCloseBtn.style.display = 'block';

    const previewVideo = document.getElementById('previewVideo');
    if (!(previewVideo instanceof HTMLVideoElement)) {
      throw new Error('Preview video element not found');
    }
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
        const message = error instanceof Error ? error.message : String(error);
        this.modalManager.showStatusWithClose('❌ Error', message);
      }

      // Reset the close button
      statusCloseBtn.textContent = 'OK';
      statusCloseBtn.onclick = () => this.modalManager.closeStatus();
    };
  }

  /**
   * Capture a frame from the video element and convert to image
   * @param {HTMLVideoElement} previewVideo - The video element to capture from
   * @returns {HTMLImageElement} The captured image
   * @throws {Error} If video is not ready or 2D context cannot be obtained
   */
  captureFrame(previewVideo) {
    const videoWidth = previewVideo.videoWidth;
    const videoHeight = previewVideo.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) {
      throw new Error('Video not ready');
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = PRINTER_CONFIG.WIDTH;
    tempCanvas.height = 400;

    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      throw new Error('Could not get 2D context from canvas');
    }

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

  /**
   * Stop the current camera stream
   * @returns {void}
   */
  stopStream() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => track.stop());
      this.currentStream = null;
    }
  }
}
