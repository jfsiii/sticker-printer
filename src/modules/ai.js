import { html, render } from 'lit';
import { ModalManager } from './modals.js';
import { AppModal } from '../components/app-modal.js';

/**
 * Manages AI image generation using external API
 */
export class AIManager {
  /** @type {ModalManager} */
  modalManager;

  /** @type {((img: HTMLImageElement) => void) | undefined} */
  onImageGenerated;

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

  /**
   * Show the AI prompt modal
   * @returns {void}
   */
  showPromptModal() {
    let modal = /** @type {AppModal | null} */ (document.getElementById('aiPromptModal'));
    if (!modal) {
      modal = /** @type {AppModal} */ (document.createElement('app-modal'));
      modal.id = 'aiPromptModal';
      modal.title = '✨ AI Magic Draw';
      document.body.appendChild(modal);
    }

    // Render content using Lit template
    render(
      html`
        <input
          type="text"
          id="aiPrompt"
          placeholder="Describe what to draw... (e.g., 'a cute dinosaur')"
        />
        <button
          class="success"
          slot="actions"
          @click=${() => this._handlePromptSubmit()}
        >
          🎨 Generate!
        </button>
        <button
          class="danger"
          slot="actions"
          @click=${() => this.closePromptModal()}
        >
          Cancel
        </button>
      `,
      modal
    );

    modal.open = true;
    // Focus input after modal opens
    setTimeout(() => {
      const input = document.getElementById('aiPrompt');
      if (input) input.focus();
    }, 100);
  }

  /**
   * Close the AI prompt modal
   * @returns {void}
   */
  closePromptModal() {
    const modal = /** @type {AppModal | null} */ (document.getElementById('aiPromptModal'));
    if (modal) {
      modal.open = false;
    }
  }

  /**
   * Handle AI prompt submission
   * @returns {Promise<void>}
   * @private
   */
  async _handlePromptSubmit() {
    const aiPromptEl = document.getElementById('aiPrompt');
    if (!(aiPromptEl instanceof HTMLInputElement)) {
      return;
    }

    const prompt = aiPromptEl.value.trim();
    if (!prompt) {
      alert('Please describe what you want to draw!');
      return;
    }

    try {
      const img = await this.generateImage(prompt);

      // Call the callback with the generated image
      if (this.onImageGenerated) {
        this.onImageGenerated(img);
      }

      this.closePromptModal();
      this.modalManager.showStatusWithClose(
        '✨ Perfect!',
        'Your AI artwork is ready! You can save or print it.'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      alert('❌ ' + message);
    }
  }
}
