import { LitElement } from 'lit';

/**
 * WorksessionTabs — a light-DOM wrapper that intercepts `selected-changed`
 * events from its <lion-tabs> child and sets the `selected` property on its
 * <worksession-panel> children.
 *
 * Light-DOM wrapper component — no `render()` method, no shadow DOM.
 * Children are slotted into `lion-tabs` via the light DOM tree.
 *
 * Uses capture-phase listening since lion-tabs fires with `bubbles: false`.
 * Ignores events from nested <customer-tabs> or feature-level <lion-tabs>.
 *
 * **Two-level assumption:** The event guards assume a two-level model
 * (worksession → customer). They skip events from any `lion-tabs` inside a
 * `<customer-tabs>` or `<worksession-panel>`, which also correctly ignores
 * feature-level `lion-tabs` placed inside panels by consuming teams.
 *
 * DOM flow:
 *   <worksession-tabs>           listens for selected-changed
 *     <lion-tabs>                fires selected-changed
 *       <worksession-panel>      receives `selected` property
 *         <customer-tabs>        (separate level, ignored here)
 */
class WorksessionTabs extends LitElement {
  connectedCallback() {
    super.connectedCallback();

    this._onSelectedChanged ??= (e) => {
      // Ignore events from lion-tabs inside a <customer-tabs> — those
      // belong to the customer level, not the worksession level.
      // Also ignore feature-level lion-tabs inside a <worksession-panel>.
      if (e.target.closest('customer-tabs')) return;
      if (e.target.closest('worksession-panel')) return;

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

  /** Set `selected` on each <worksession-panel> owned by this wrapper. */
  _updatePanels(selectedIndex) {
    const panels = [...this.querySelectorAll('worksession-panel')]
      .filter(p => p.closest('worksession-tabs') === this);
    panels.forEach((panel, i) => {
      panel.selected = i === selectedIndex;
    });
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('worksession-tabs', WorksessionTabs);
