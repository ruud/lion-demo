import { html, LitElement } from 'lit';

// ContextRoot MUST be imported first — it catches unhandled context-request
// events from early-connecting consumers and re-dispatches them when late
// providers appear. This makes the system order-independent.
import './context-root.js';

// lion-tabs (or any custom extension) is imported by the consuming app,
// not by the tabs wrappers — so you can swap in your own tabs component.
import '@lion/ui/define/lion-tabs.js';

// Import order no longer matters — ContextRoot handles late providers.
import './worksession-tabs.js';
import './worksession-panel.js';
import './customer-tabs.js';
import './customer-panel.js';
import './my-timer.js';
import './ajax-provider.js';
import './my-fetcher.js';
import './my-poller.js';

export class LionDemo extends LitElement {
  render() {
    return html`
    <div class="container">
      <h1>Resumable Nested Tabs Demo</h1>

      <worksession-tabs>
        <lion-tabs>
          <button slot="tab">WS-001</button>
          <worksession-panel ws-id="WS-001" slot="panel">
            <h2>Worksession WS-001</h2>
            <customer-tabs>
              <lion-tabs>
                <button slot="tab">Alice</button>
                <customer-panel customer-id="CUST-A" slot="panel">
                  <h3>Customer: Alice (CUST-A)</h3>
                  <my-timer></my-timer>
                  <ajax-provider>
                    <my-fetcher></my-fetcher>
                    <my-poller></my-poller>
                  </ajax-provider>
                </customer-panel>

                <button slot="tab">Bob</button>
                <customer-panel customer-id="CUST-B" slot="panel">
                  <h3>Customer: Bob (CUST-B)</h3>
                  <my-timer></my-timer>
                  <ajax-provider>
                    <my-fetcher></my-fetcher>
                    <my-poller></my-poller>
                  </ajax-provider>
                </customer-panel>
              </lion-tabs>
            </customer-tabs>
          </worksession-panel>

          <button slot="tab">WS-002</button>
          <worksession-panel ws-id="WS-002" slot="panel">
            <h2>Worksession WS-002</h2>
            <customer-tabs>
              <lion-tabs>
                <button slot="tab">Charlie</button>
                <customer-panel customer-id="CUST-C" slot="panel">
                  <h3>Customer: Charlie (CUST-C)</h3>
                  <my-timer></my-timer>
                  <ajax-provider>
                    <my-fetcher></my-fetcher>
                  </ajax-provider>
                </customer-panel>

                <button slot="tab">Diana</button>
                <customer-panel customer-id="CUST-D" slot="panel">
                  <h3>Customer: Diana (CUST-D)</h3>
                  <my-timer></my-timer>
                  <ajax-provider>
                    <my-fetcher></my-fetcher>
                    <my-poller></my-poller>
                  </ajax-provider>
                </customer-panel>
              </lion-tabs>
            </customer-tabs>
          </worksession-panel>
        </lion-tabs>
      </worksession-tabs>
    </div>
    `;
  }
}
customElements.define('lion-demo', LionDemo);