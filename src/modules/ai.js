import { ModalManager } from './modals.js';

/**
 * Manages AI image generation using external API
 */
export class AIManager {
  /** @type {ModalManager} */
  modalManager;

  /**
   * @param {ModalManager} modalManager - The modal manager instance
   */
  constructor(modalManager) {
    this.modalManager = modalManager;
  }

  /**
   * Generate an image from a text prompt using AI
   * @param {string} prompt - The text description of what to generate
   * @returns {Promise<HTMLImageElement>} The generated image element
   * @throws {Error} If image generation fails
   */
  async generateImage(prompt) {
    // Show loading status
    this.modalManager.showStatus('✨ Generating...', 'Creating your image...');

    return new Promise((resolve, reject) => {
      try {
        const enhancedPrompt = encodeURIComponent(
          `${prompt}, coloring book style, simple black and white line art, outline drawing, no shading`
        );

        const imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=384&height=384&nologo=true&enhance=true`;

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          this.modalManager.closeStatus();
          resolve(img);
        };

        img.onerror = () => {
          this.modalManager.closeStatus();
          reject(new Error('Could not generate image. Try a different description!'));
        };

        img.src = imageUrl;
      } catch (error) {
        this.modalManager.closeStatus();
        reject(error);
      }
    });
  }
}
