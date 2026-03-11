import { LitElement } from 'lit';

/**
 * CustomerTabs — a light-DOM wrapper that intercepts `selected-changed`
 * events from its <lion-tabs> child and sets the `selected` property on
 * its <customer-panel> children.
 *
 * Light-DOM wrapper component — no `render()` method, no shadow DOM.
 * Children are slotted into `lion-tabs` via the light DOM tree.
 *
 * Uses capture-phase listening since lion-tabs fires with `bubbles: false`.
 *
 * DOM flow:
 *   <customer-tabs>              listens for selected-changed
 *     <lion-tabs>                fires selected-changed
 *       <customer-panel>         receives `selected` property
 *         <my-timer> etc.        consumes panelVisibleContext
 */
class CustomerTabs extends LitElement {
  connectedCallback() {
    super.connectedCallback();

    this._onSelectedChanged ??= (e) => {
      // Only react to lion-tabs that belong to this <customer-tabs>.
      // Skip if there's a <customer-panel> between the lion-tabs and us —
      // that means it's a feature-level lion-tabs inside a panel.
      if (e.target.closest('customer-tabs') !== this) return;
      if (e.target.closest('customer-panel')) return;

      const newIndex = e.target.selectedIndex ?? 0;
      this._updatePanels(newIndex);
    };

    this.removeEventListener('selected-changed', this._onSelectedChanged, { capture: true });
    this.addEventListener('selected-changed', this._onSelectedChanged, { capture: true });

    this._updatePanels(0);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('selected-changed', this._onSelectedChanged, { capture: true });
  }

  /** Set `selected` on each <customer-panel> owned by this wrapper. */
  _updatePanels(selectedIndex) {
    const panels = [...this.querySelectorAll('customer-panel')]
      .filter(p => p.closest('customer-tabs') === this);
    panels.forEach((panel, i) => {
      panel.selected = i === selectedIndex;
    });
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('customer-tabs', CustomerTabs);
