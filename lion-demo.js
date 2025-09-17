import { html, LitElement } from 'lit';

import { LionDialog } from '@lion/ui/dialog.js';
import { OverlayController } from '@lion/ui/overlays.js';

const originalHide = OverlayController.prototype.hide;
OverlayController.prototype.hide = function(...args) {
  console.debug('before hide, body margin:', document.documentElement.style.marginRight);
  originalHide.call(this, ...args);
  console.debug('hidden, body margin:', document.documentElement.style.marginRight);
}

// As a side-effect this way of importing defines the custom elements, eg. <lion-button>, ready for use
// import '@lion/ui/define/lion-dialog.js';

class DebugDialog extends LionDialog {
  /**
   * @overridable
   * @desc use this method to setup your open and close event listeners
   * For example, set a click event listener on _overlayInvokerNode to set opened to true
   * @protected
   */
  // eslint-disable-next-line class-methods-use-this
  _setupOpenCloseListeners() {
    /**
     * @param {{ stopPropagation: () => void; }} ev
     */
    this.__closeEventInContentNodeHandler = ev => {
      console.debug('handlet evt')
      ev.stopPropagation();
      /** @type {OverlayController} */ (this._overlayCtrl).hide();
    };

    if (this._overlayContentNode) {
      console.debug('registreert evt');
      this._overlayContentNode.addEventListener(
        'close-overlay',
        this.__closeEventInContentNodeHandler,
      );
    }
  }
}
customElements.define('lion-dialog', DebugDialog);



export class LionDemo extends LitElement {
  render() {
    return html`
      <lion-dialog>
        <button type="button" slot="invoker">open</button>
        <div slot="content" style="background-color: white;">
          zeer content
          <button type="button" @click="${({currentTarget}) => currentTarget.dispatchEvent(new Event('close-overlay', { bubbles: true }))}">
            close
          </button>
        </div>
      </lion-dialog>
    `;
  }
}
customElements.define('lion-demo', LionDemo);