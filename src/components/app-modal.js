import { LitElement, html, css } from 'lit';

/**
 * Unified modal component using native <dialog>
 *
 * @property {boolean} open - Whether the modal is open
 * @property {string} title - Optional modal title
 * @property {string} message - Optional message text
 *
 * @slot - Default slot for modal content
 * @slot actions - Slot for action buttons
 *
 * @fires close - When the modal is closed
 */
export class AppModal extends LitElement {
  static styles = css`
    dialog {
      border: none;
      border-radius: 15px;
      padding: 20px;
      max-width: 90vw;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      text-align: center;
      font-family: 'Comic Sans MS', 'Chalkboard SE', 'Arial Rounded MT Bold',
        sans-serif;
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.5);
    }

    .title {
      margin: 0 0 15px 0;
      color: #667eea;
      font-size: 22px;
    }

    .message {
      margin: 15px 0;
      font-size: 14px;
      color: #666;
    }

    .content {
      margin: 15px 0;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 15px;
    }

    /* Button styles to match existing app */
    ::slotted(button) {
      padding: 10px 20px;
      border: none;
      border-radius: 18px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      font-family: inherit;
    }

    ::slotted(button:active) {
      transform: scale(0.95);
    }

    ::slotted(button.primary) {
      background: #667eea;
      color: white;
    }

    ::slotted(button.success) {
      background: #48bb78;
      color: white;
    }

    ::slotted(button.danger) {
      background: #f56565;
      color: white;
    }

    /* Input styles */
    ::slotted(input),
    ::slotted(textarea) {
      padding: 12px;
      font-size: 18px;
      border: 2px solid #667eea;
      border-radius: 8px;
      font-family: inherit;
      width: 100%;
      box-sizing: border-box;
    }
  `;

  static get properties() {
    return {
      open: { type: Boolean },
      title: { type: String },
      message: { type: String },
    };
  }

  constructor() {
    super();
    this.open = false;
    this.title = '';
    this.message = '';
  }

  /**
   * @param {Map<string, unknown>} changedProperties
   */
  updated(changedProperties) {
    if (changedProperties.has('open')) {
      const dialog = this.shadowRoot?.querySelector('dialog');
      if (!dialog) return;

      if (this.open && !dialog.open) {
        dialog.showModal();
      } else if (!this.open && dialog.open) {
        dialog.close();
      }
    }
  }

  /**
   * Handle dialog close event
   * @param {Event} e
   */
  _handleClose(e) {
    this.open = false;
    const dialog = /** @type {HTMLDialogElement | null} */ (e.target);
    this.dispatchEvent(
      new CustomEvent('close', {
        bubbles: true,
        composed: true,
        detail: { returnValue: dialog?.returnValue },
      })
    );
  }

  /**
   * Handle backdrop click to close
   * @param {MouseEvent} e
   */
  _handleBackdropClick(e) {
    // e.target is the dialog element
    const dialog = /** @type {HTMLDialogElement | null} */ (e.currentTarget);
    if (!dialog) return;

    const rect = dialog.getBoundingClientRect();
    const clickedInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!clickedInDialog) {
      this.open = false;
    }
  }

  render() {
    return html`
      <dialog @close=${this._handleClose} @click=${this._handleBackdropClick}>
        ${this.title ? html`<h2 class="title">${this.title}</h2>` : ''}
        ${this.message ? html`<div class="message">${this.message}</div>` : ''}

        <div class="content">
          <slot></slot>
        </div>

        <div class="actions">
          <slot name="actions"></slot>
        </div>
      </dialog>
    `;
  }
}

customElements.define('app-modal', AppModal);
