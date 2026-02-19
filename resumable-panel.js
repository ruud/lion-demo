import { LitElement } from 'lit';
import { ContextProvider, ContextConsumer } from '@lit/context';
import { panelVisibleContext } from './panel-visible-context.js';
import { selectedTabContext } from './selected-tab-context.js';

/**
 * ResumablePanel — a light-DOM wrapper for each tab panel that:
 * 1. Consumes `selectedTabContext` from the nearest <resumable-tabs> ancestor
 * 2. Computes its own visibility by comparing the selected index to its
 *    position among sibling <resumable-panel> elements
 * 3. Provides `panelVisibleContext` to all descendants (ResumableMixin,
 *    ajax-provider, etc.)
 *
 * No coupling to any specific tabs component name — works with <lion-tabs>
 * or any extension that fires `selected-changed`.
 *
 * Usage:
 *   <resumable-panel slot="panel">
 *     <my-timer></my-timer>
 *     <ajax-provider>…</ajax-provider>
 *   </resumable-panel>
 */
export class ResumablePanel extends LitElement {
  constructor() {
    super();
    console.log('[ResumablePanel] constructor');

    /** Provides visibility state to all descendants */
    this._visibleProvider = new ContextProvider(this, {
      context: panelVisibleContext,
      initialValue: false,
    });
    console.log('[ResumablePanel] panelVisibleContext provider created');

    /** Consumes the selected tab index from <resumable-tabs> */
    this._selectedConsumer = new ContextConsumer(this, {
      context: selectedTabContext,
      callback: (selectedIndex) => {
        const myIndex = this._getOwnIndex();
        const visible = myIndex === selectedIndex;
        console.log(
          `[ResumablePanel] selectedTabContext callback: selectedIndex=${selectedIndex}, myIndex=${myIndex}, visible=${visible}`,
        );
        this._visibleProvider.setValue(visible);
      },
      subscribe: true,
    });
    console.log('[ResumablePanel] selectedTabContext consumer created');
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('[ResumablePanel] connectedCallback');
    console.log('[ResumablePanel] parentElement:', this.parentElement?.localName);
    console.log('[ResumablePanel] selectedConsumer.value:', this._selectedConsumer.value);
  }

  /**
   * Compute this panel's index among sibling <resumable-panel> elements.
   * @returns {number} 0-based index, or -1 if not found
   */
  _getOwnIndex() {
    const parent = this.parentElement;
    if (!parent) {
      console.log('[ResumablePanel] _getOwnIndex: no parentElement, returning -1');
      return -1;
    }
    const panels = [...parent.querySelectorAll(':scope > resumable-panel')];
    const idx = panels.indexOf(this);
    console.log(`[ResumablePanel] _getOwnIndex: parent=${parent.localName}, panels found=${panels.length}, myIndex=${idx}`);
    return idx;
  }

  createRenderRoot() {
    // Light DOM so children participate in lion-tabs slots
    return this;
  }

  // No render() — light DOM means children are already in the DOM.
}

customElements.define('resumable-panel', ResumablePanel);
