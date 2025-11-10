import { html, render } from 'lit';
import { AppModal } from '../components/app-modal.js';

/**
 * @typedef {Object} ModalManagerOptions
 * @property {(action: 'save' | 'print' | 'saveAndPrint') => void | Promise<void>} [onPrintAction] - Callback when print action is selected
 */

/**
 * Manages modal dialogs and overlays
 */
export class ModalManager {
  /** @type {((action: 'save' | 'print' | 'saveAndPrint') => void | Promise<void>) | undefined} */
  onPrintAction;

  /**
   * @param {ModalManagerOptions} [options] - Configuration options
   */
  constructor(options = {}) {
    this.onPrintAction = options.onPrintAction;
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
          @click=${() => this._handlePrintAction('save')}
        >
          💾 Save Image
        </button>
        ${isPrinterConnected
          ? html`
              <button
                class="success"
                slot="actions"
                @click=${() => this._handlePrintAction('print')}
              >
                🖨️ Print to Printer
              </button>
              <button
                class="success"
                slot="actions"
                @click=${() => this._handlePrintAction('saveAndPrint')}
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
   * Handle print action selection
   * @param {'save' | 'print' | 'saveAndPrint'} action - The action to perform
   * @returns {void}
   * @private
   */
  _handlePrintAction(action) {
    // Call the callback with the action - orchestration happens elsewhere
    if (this.onPrintAction) {
      this.onPrintAction(action);
    }
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
    this.closePrintOptions();
  }
}
