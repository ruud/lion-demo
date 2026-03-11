import { LitElement } from 'lit';
import { ContextProvider, ContextConsumer } from '@lit/context';
import { panelVisibleContext } from './panel-visible-context.js';
import { customerContext } from './customer-context.js';
import { workSessionContext } from './worksession-context.js';

/**
 * CustomerPanel — a light-DOM wrapper for each customer tab panel.
 *
 * Light-DOM wrapper component — no `render()` method, no shadow DOM.
 * Children are slotted into `lion-tabs` via the light DOM tree.
 *
 * 1. Receives `selected` property from <customer-tabs>
 * 2. Consumes `workSessionContext` from <worksession-panel> to AND visibility
 * 3. Computes visibility: worksession visible AND this customer tab selected
 * 4. Provides `customerContext` ({ id, visible }) to all descendants
 * 5. Provides `panelVisibleContext` (ANDed) to descendants
 *
 * The `customer-id` attribute carries the customer identifier, which flows
 * down via context so <ajax-provider> can inject it as a request header.
 *
 * Usage:
 *   <customer-panel customer-id="CUST-A" slot="panel">
 *     <my-timer></my-timer>
 *     <ajax-provider>…</ajax-provider>
 *   </customer-panel>
 */
export class CustomerPanel extends LitElement {
  static properties = {
    customerId: { type: String, attribute: 'customer-id' },
    selected: { type: Boolean },
  };

  constructor() {
    super();
    this.customerId = null;
    this.selected = false;
    this._wsVisible = false;

    /** Consumes ancestor worksession visibility */
    this._wsConsumer = new ContextConsumer(this, {
      context: workSessionContext,
      callback: (ws) => {
        this._wsVisible = ws?.visible ?? false;
        this._updateVisibility();
      },
      subscribe: true,
    });

    /** Provides { id, visible } to descendants */
    this._custProvider = new ContextProvider(this, {
      context: customerContext,
      initialValue: { id: null, visible: false },
    });

    /** Provides boolean visibility to ResumableMixin consumers */
    this._visibleProvider = new ContextProvider(this, {
      context: panelVisibleContext,
      initialValue: false,
    });
  }

  updated(changed) {
    if (changed.has('selected') || changed.has('customerId')) {
      this._updateVisibility();
    }
  }

  /** @private */
  _updateVisibility() {
    const visible = this._wsVisible && this.selected;
    this._custProvider.setValue({ id: this.customerId, visible });
    this._visibleProvider.setValue(visible);
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('customer-panel', CustomerPanel);
