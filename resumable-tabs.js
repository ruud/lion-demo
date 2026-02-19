import { LitElement } from 'lit';
import { ContextProvider } from '@lit/context';
import { selectedTabContext } from './selected-tab-context.js';

/**
 * ResumableTabs — a wrapper that intercepts `selected-changed` events
 * (via capture phase, since lion-tabs fires with bubbles:false) and provides
 * the selected tab index to descendant <resumable-panel> elements via the
 * Lit Context protocol.
 *
 * Extends LitElement so it can act as a ReactiveControllerHost for
 * ContextProvider. Uses light DOM — no shadow boundary.
 *
 * No querySelector, no element name coupling. Works with <lion-tabs>,
 * or any custom extension that fires `selected-changed` with a
 * `.selectedIndex` property on the target.
 *
 * Context flow:
 *   <resumable-tabs>           provides selectedTabContext (number)
 *     <lion-tabs>              fires selected-changed (bubbles up)
 *       <resumable-panel>      consumes selectedTabContext → sets own visibility
 *         <my-timer>           consumes panelVisibleContext
 *
 * Usage:
 *   <resumable-tabs>
 *     <lion-tabs>
 *       <button slot="tab">Tab 1</button>
 *       <resumable-panel slot="panel">…</resumable-panel>
 *       <button slot="tab">Tab 2</button>
 *       <resumable-panel slot="panel">…</resumable-panel>
 *     </lion-tabs>
 *   </resumable-tabs>
 */
class ResumableTabs extends LitElement {
  constructor() {
    super();
    console.log('[ResumableTabs] constructor');
    this._provider = new ContextProvider(this, {
      context: selectedTabContext,
      initialValue: 0,
    });
    console.log('[ResumableTabs] ContextProvider created, initial value: 0');
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('[ResumableTabs] connectedCallback');
    console.log('[ResumableTabs] this.children:', this.children.length, [...this.children].map(c => c.localName));

    // Listen for `selected-changed` during the CAPTURE phase.
    // Lion-tabs fires this event with bubbles:false, so it won't bubble up.
    // Capture lets us intercept it on the way down — no element name coupling.
    // Remove first to prevent duplicates on reconnect.
    this._onSelectedChanged ??= (e) => {
      // Guard against nested <resumable-tabs>: only react to events
      // from our own direct tabs component, not from a nested one.
      if (e.target.closest('resumable-tabs') !== this) {
        console.log('[ResumableTabs] SKIPPED — event from nested resumable-tabs');
        return;
      }
      const newIndex = e.target.selectedIndex ?? 0;
      console.log(`[ResumableTabs] selected-changed → index ${newIndex}`);
      this._provider.setValue(newIndex);
    };
    this.removeEventListener('selected-changed', this._onSelectedChanged, { capture: true });
    this.addEventListener('selected-changed', this._onSelectedChanged, { capture: true });
    console.log('[ResumableTabs] event listener added for selected-changed (capture phase)');

    // Set initial value (default: first tab)
    console.log('[ResumableTabs] setting initial index 0');
    this._provider.setValue(0);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('selected-changed', this._onSelectedChanged, { capture: true });
  }

  createRenderRoot() {
    // Light DOM — no shadow boundary, children stay in the document flow.
    return this;
  }
}

customElements.define('resumable-tabs', ResumableTabs);
