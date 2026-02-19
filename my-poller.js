import { LitElement, html, css } from 'lit';
import { ResumableMixin } from './resumable-mixin.js';
import { AjaxConsumerMixin } from './ajax-consumer-mixin.js';

/**
 * MyPoller - auto-fetches on a 10-second interval with a 3-second server delay.
 *
 * Uses ResumableMixin to pause/resume the polling interval itself, preventing
 * gated requests from accumulating while the tab is hidden. Without this,
 * each 10s tick would queue another request in the interceptor - leading to
 * a burst of N requests when the tab becomes visible again.
 *
 * TESTS:
 * - Interval pausing: when the tab is hidden, the setInterval is cleared.
 *   No new poll ticks fire, so no requests accumulate.
 * - Request interceptor: if a poll was already in-flight when the tab was
 *   hidden, the request interceptor holds it until the tab is visible.
 * - Response interceptor: if a response arrives while hidden, the response
 *   interceptor holds it until the tab is visible.
 *
 * HOW TO VERIFY:
 * 1. Open Tab 1 - the poller starts and the poll count increments.
 * 2. Switch to Tab 2 and wait 30+ seconds.
 * 3. Switch back to Tab 1 - the poll count should NOT have jumped by 3+.
 *    The interval was paused, so no requests were queued while hidden.
 * 4. Check the browser's Network tab: no requests should have been sent
 *    while Tab 1 was hidden.
 */
class MyPoller extends ResumableMixin(AjaxConsumerMixin(LitElement)) {
  static properties = {
    lastResult: { type: String },
    fetchCount: { type: Number },
    loading: { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
      margin-top: 12px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-family: sans-serif;
    }
    .status {
      margin-top: 8px;
    }
    .loading {
      color: #999;
    }
    .timestamp {
      font-size: 0.85em;
      color: #666;
    }
  `;

  constructor() {
    super();
    this.lastResult = '';
    this.fetchCount = 0;
    this.loading = false;
    this._interval = null;
  }

  /** Start polling when the tab becomes visible. */
  onResume() {
    console.log('[MyPoller] onResume - starting interval');
    this._poll();
    this._interval = setInterval(() => this._poll(), 10000);
  }

  /** Stop polling when the tab becomes hidden. */
  onPause() {
    console.log('[MyPoller] onPause - clearing interval');
    clearInterval(this._interval);
    this._interval = null;
  }

  async _poll() {
    this.loading = true;
    try {
      // Uses httpbin's delay endpoint - 3 second server-side delay.
      // This gives you time to switch tabs while the request is in-flight,
      // testing the response interceptor.
      const res = await this.ajax.fetch(
        'https://httpbin.org/delay/3',
      );
      const data = await res.json();
      this.fetchCount++;
      this.lastResult = 'Poll #' + this.fetchCount + ' completed at ' + new Date().toLocaleTimeString() + ' - origin: ' + data.origin;
    } catch (e) {
      this.lastResult = 'Poll error: ' + e.message;
    }
    this.loading = false;
  }

  render() {
    return html`
      <strong>Auto-poller</strong> (every 10s, 3s server delay)
      <div class="status">
        ${this.loading
          ? html`<p class="loading">Polling...</p>`
          : this.lastResult
            ? html`<p>${this.lastResult}</p>`
            : html`<p>Starting...</p>`}
      </div>
      <p class="timestamp">Total polls: ${this.fetchCount}</p>
    `;
  }
}

customElements.define('my-poller', MyPoller);
