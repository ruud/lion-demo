import { html, LitElement } from 'lit';

// ContextRoot MUST be imported first — it catches unhandled context-request
// events from early-connecting consumers and re-dispatches them when late
// providers appear. This makes the system order-independent.
import './context-root.js';

// lion-tabs (or any custom extension) is imported by the consuming app,
// not by resumable-tabs — so you can swap in your own tabs component.
import '@lion/ui/define/lion-tabs.js';

// Import order no longer matters — ContextRoot handles late providers.
import './resumable-tabs.js';
import './resumable-panel.js';
import './my-timer.js';
import './ajax-provider.js';
import './my-fetcher.js';
import './my-poller.js';

export class LionDemo extends LitElement {
  render() {
    return html`
    <div class="container">
      <h1>Resumable Tabs Demo</h1>

      <resumable-tabs>
        <lion-tabs>
          <button slot="tab">Tab 1: Overview</button>
          <resumable-panel slot="panel" class="content">
            <h2>Welcome to Tab 1</h2>
            <p>This is the first tab with resumable content. Switch tabs to test pause/resume.</p>
            <my-timer></my-timer>
            <ajax-provider headers='{"X-Tab": "tab-1", "X-User": "alice"}'>
              <my-fetcher></my-fetcher>
              <my-poller></my-poller>
            </ajax-provider>
          </resumable-panel>

          <button slot="tab">Tab 2: Features</button>
          <resumable-panel slot="panel" class="content">
            <h2>Welcome to Tab 2</h2>
            <p>This is the second tab with resumable content. Switch tabs to test pause/resume.</p>
            <my-timer></my-timer>
            <ajax-provider headers='{"X-Tab": "tab-2", "X-User": "bob"}'>
              <my-fetcher></my-fetcher>
              <my-poller></my-poller>
            </ajax-provider>
          </resumable-panel>
        </lion-tabs>
      </resumable-tabs>
    </div>
    `;
  }
}
customElements.define('lion-demo', LionDemo);