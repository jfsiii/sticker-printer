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
   * @throws {Error} If AI status element not found or image generation fails
   */
  async generateImage(prompt) {
    const aiStatus = document.getElementById('aiStatus');
    if (!aiStatus) {
      throw new Error('AI status element not found');
    }
    aiStatus.style.display = 'block';

    return new Promise((resolve, reject) => {
      try {
        const enhancedPrompt = encodeURIComponent(
          `${prompt}, coloring book style, simple black and white line art, outline drawing, no shading`
        );

        const imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=384&height=384&nologo=true&enhance=true`;

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          aiStatus.style.display = 'none';
          resolve(img);
        };

        img.onerror = () => {
          aiStatus.style.display = 'none';
          reject(new Error('Could not generate image. Try a different description!'));
        };

        img.src = imageUrl;
      } catch (error) {
        aiStatus.style.display = 'none';
        reject(error);
      }
    });
  }
}
