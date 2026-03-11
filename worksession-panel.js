import { LitElement } from 'lit';
import { ContextProvider } from '@lit/context';
import { panelVisibleContext } from './panel-visible-context.js';
import { workSessionContext } from './worksession-context.js';

/**
 * WorksessionPanel — a light-DOM wrapper for each worksession tab panel.
 *
 * Light-DOM wrapper component — no `render()` method, no shadow DOM.
 * Children are slotted into `lion-tabs` via the light DOM tree.
 *
 * 1. Receives `selected` property from <worksession-tabs>
 * 2. Provides `workSessionContext` ({ id, visible }) to all descendants
 * 3. Provides `panelVisibleContext` to descendants (ResumableMixin, ajax-provider)
 *
 * The `ws-id` attribute carries the worksession identifier, which flows
 * down via context so <ajax-provider> can inject it as a request header.
 *
 * Usage:
 *   <worksession-panel ws-id="WS-001" slot="panel">
 *     <customer-tabs>…</customer-tabs>
 *   </worksession-panel>
 */
export class WorksessionPanel extends LitElement {
  static properties = {
    wsId: { type: String, attribute: 'ws-id' },
    selected: { type: Boolean },
  };

  constructor() {
    super();
    this.wsId = null;
    this.selected = false;

    /** Provides { id, visible } to descendants */
    this._wsProvider = new ContextProvider(this, {
      context: workSessionContext,
      initialValue: { id: null, visible: false },
    });

    /**
     * Provides boolean visibility to ResumableMixin consumers.
     *
     * This provider exists intentionally at the worksession level to support
     * features placed directly inside a <worksession-panel> (outside any
     * <customer-panel>). For features inside a <customer-panel>, the
     * customer-panel provides its own `panelVisibleContext` that ANDs
     * worksession visibility with customer-tab selection.
     */
    this._visibleProvider = new ContextProvider(this, {
      context: panelVisibleContext,
      initialValue: false,
    });
  }

  updated(changed) {
    if (changed.has('selected') || changed.has('wsId')) {
      this._wsProvider.setValue({ id: this.wsId, visible: this.selected });
      this._visibleProvider.setValue(this.selected);
    }
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('worksession-panel', WorksessionPanel);
