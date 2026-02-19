import { html, LitElement } from 'lit';

import '@lion/ui/define/lion-tabs.js';
import './my-timer.js';
import './ajax-provider.js';
import './my-fetcher.js';

export class LionDemo extends LitElement {
  render() {
    return html`
    <div class="container">
      <h1>Resumable Lion Tabs Example</h1>
      
      <lion-tabs>
        <button slot="tab">Tab 1: Overview</button>
        <div slot="panel" class="content">
          <h2>Welcome to Tab 1</h2>
          <p>This is the first tab with resumable content. You can click between tabs and the content will persist in the DOM.</p>
          <my-timer></my-timer>
          <ajax-provider headers='{"X-Tab": "tab-1", "X-User": "alice"}'>
            <my-fetcher></my-fetcher>
          </ajax-provider>
        </div>

        <button slot="tab">Tab 2: Features</button>
        <div slot="panel" class="content">
          <h2>Welcome to Tab 2</h2>
          <p>This is the second tab with resumable content. You can click between tabs and the content will persist in the DOM.</p>
          <my-timer></my-timer>
          <ajax-provider headers='{"X-Tab": "tab-2", "X-User": "bob"}'>
            <my-fetcher></my-fetcher>
          </ajax-provider>
        </div>
      </lion-tabs>
    </div>
    `;
  }
}
customElements.define('lion-demo', LionDemo);