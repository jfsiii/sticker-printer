import { html, render } from 'lit';
import { AppModal } from '../components/app-modal.js';

/**
 * Manages modal dialogs and overlays
 */
export class ModalManager {
  /**
   * @throws {Error} If required modal elements are not found in DOM
   */
  constructor() {
    // No longer need modalOverlay or statusModal references
    // Modals are self-contained now
  }

  /**
   * Show status modal without close button
   * @param {string} title - The modal title
   * @param {string} message - The status message
   * @returns {void}
   */
  showStatus(title, message) {
    const modal = this._getOrCreateStatusModal();
    modal.title = title;
    modal.message = message;

    // Clear any existing content
    render(html``, modal);

    modal.open = true;
  }

  /**
   * Show status modal with close button
   * @param {string} title - The modal title
   * @param {string} message - The status message
   * @returns {void}
   */
  showStatusWithClose(title, message) {
    const modal = this._getOrCreateStatusModal();
    modal.title = title;
    modal.message = message;

    // Render close button using Lit template
    render(
      html`
        <button
          class="primary"
          slot="actions"
          @click=${() => this.closeStatus()}
        >
          OK
        </button>
      `,
      modal
    );

    modal.open = true;
  }

  /**
   * Close the status modal
   * @returns {void}
   */
  closeStatus() {
    const modal = /** @type {AppModal | null} */ (document.getElementById('statusModal'));
    if (modal) {
      modal.open = false;
    }
  }

  /**
   * Get or create the status modal
   * @returns {AppModal}
   */
  _getOrCreateStatusModal() {
    let modal = /** @type {AppModal | null} */ (document.getElementById('statusModal'));
    if (!modal) {
      modal = /** @type {AppModal} */ (document.createElement('app-modal'));
      modal.id = 'statusModal';
      document.body.appendChild(modal);
    }
    return modal;
  }

  /**
   * Show the text input modal
   * @returns {void}
   */
  showTextTools() {
    let modal = /** @type {AppModal | null} */ (document.getElementById('textToolsModal'));
    if (!modal) {
      modal = /** @type {AppModal} */ (document.createElement('app-modal'));
      modal.id = 'textToolsModal';
      document.body.appendChild(modal);
    }

    // Render content using Lit template
    render(
      html`
        <input
          type="text"
          id="textInput"
          placeholder="Type your message..."
        />
        <button
          class="primary"
          slot="actions"
          @click=${() => window.addText()}
        >
          Add Text
        </button>
        <button
          class="danger"
          slot="actions"
          @click=${() => this.closeTextTools()}
        >
          Cancel
        </button>
      `,
      modal
    );

    modal.open = true;
    // Focus input after modal opens
    setTimeout(() => {
      const input = document.getElementById('textInput');
      if (input) input.focus();
    }, 100);
  }

  /**
   * Close the text input modal
   * @returns {void}
   */
  closeTextTools() {
    const modal = /** @type {AppModal | null} */ (document.getElementById('textToolsModal'));
    if (modal) {
      modal.open = false;
    }
  }

  /**
   * Show the AI generation modal
   * @returns {void}
   */
  showAITools() {
    let modal = /** @type {AppModal | null} */ (document.getElementById('aiToolsModal'));
    if (!modal) {
      modal = /** @type {AppModal} */ (document.createElement('app-modal'));
      modal.id = 'aiToolsModal';
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
          @click=${() => window.generateAIImage()}
        >
          🎨 Generate!
        </button>
        <button
          class="danger"
          slot="actions"
          @click=${() => this.closeAITools()}
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
   * Close the AI generation modal
   * @returns {void}
   */
  closeAITools() {
    const modal = /** @type {AppModal | null} */ (document.getElementById('aiToolsModal'));
    if (modal) {
      modal.open = false;
    }
  }

  /**
   * Show print options modal
   * @param {boolean} isPrinterConnected - Whether a printer is connected
   * @returns {void}
   */
  showPrintOptions(isPrinterConnected) {
    let modal = /** @type {AppModal | null} */ (document.getElementById('printOptionsModal'));
    if (!modal) {
      modal = /** @type {AppModal} */ (document.createElement('app-modal'));
      modal.id = 'printOptionsModal';
      document.body.appendChild(modal);
    }

    // Update title based on printer connection
    modal.title = isPrinterConnected ? '🖨️ What do you want to do?' : '💾 Save Image?';

    // Render content using Lit template with conditional buttons
    render(
      html`
        <button
          class="primary"
          slot="actions"
          @click=${() => window.saveImageOnly()}
        >
          💾 Save Image
        </button>
        ${isPrinterConnected
          ? html`
              <button
                class="success"
                slot="actions"
                @click=${() => window.printImageOnly()}
              >
                🖨️ Print to Printer
              </button>
              <button
                class="success"
                slot="actions"
                @click=${() => window.saveAndPrint()}
              >
                💾🖨️ Save & Print
              </button>
            `
          : ''}
        <button
          class="danger"
          slot="actions"
          @click=${() => this.closePrintOptions()}
        >
          Cancel
        </button>
      `,
      modal
    );

    modal.open = true;
  }

  /**
   * Close the print options modal
   * @returns {void}
   */
  closePrintOptions() {
    const modal = /** @type {AppModal | null} */ (document.getElementById('printOptionsModal'));
    if (modal) {
      modal.open = false;
    }
  }

  /**
   * Close all modals
   * @returns {void}
   */
  closeAll() {
    this.closeStatus();
    this.closeTextTools();
    this.closeAITools();
    this.closePrintOptions();
  }
}
