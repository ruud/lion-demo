import { LitElement, html, css } from 'lit';
import { AjaxConsumerMixin } from './ajax-consumer-mixin.js';

/**
 * MyFetcher — fetches a random joke on button click.
 *
 * TESTS:
 * - Response interceptor: the joke API responds quickly, but a parallel
 *   request to httpbin.org/delay/5 keeps the overall fetch in-flight for
 *   5 seconds. If you switch tabs during this window, the response is held
 *   by the response interceptor until the tab becomes visible again.
 * - Side-effect deferral: an alert() fires after the response. Because the
 *   response interceptor gates the await, the alert only appears when the
 *   tab is active — proving imperative side effects are also deferred.
 *
 * HOW TO VERIFY:
 * 1. Click "Fetch a joke" on Tab 1.
 * 2. Immediately switch to Tab 2.
 * 3. Wait at least 5 seconds, then switch back to Tab 1.
 * 4. The alert should appear only now (not while on Tab 2).
 */
class MyFetcher extends AjaxConsumerMixin(LitElement) {
  static properties = {
    joke: { type: String },
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
    button {
      padding: 6px 12px;
      cursor: pointer;
    }
    .joke {
      margin-top: 8px;
      font-style: italic;
    }
    .loading {
      color: #999;
    }
  `;

  constructor() {
    super();
    this.joke = '';
    this.loading = false;
  }

  async _fetchJoke() {
    this.loading = true;
    try {
      // NOTE: The httpbin delay request below is a DEMO-ONLY hack. It exists
      // solely to keep the Promise.all pending for 5 seconds so you have time
      // to switch tabs while the request is "in-flight", exercising the response
      // interceptor. In production code you would NOT include a dummy delay
      // request — the response interceptor works on real slow endpoints just
      // the same.
      const [jokeRes] = await Promise.all([
        this.ajax.fetch('https://official-joke-api.appspot.com/random_joke'),
        // 5 second server-side delay — DEMO-ONLY, see note above
        this.ajax.fetch('https://httpbin.org/delay/5'),
      ]);
      const data = await jokeRes.json();
      this.joke = `${data.setup} — ${data.punchline}`;
      // Show the joke in a native dialog — if the response interceptor works,
      // this should only appear when the tab is active.
      alert(`🃏 ${data.setup}\n\n${data.punchline}`);
    } catch (e) {
      this.joke = `Error: ${e.message}`;
    }
    this.loading = false;
  }

  render() {
    return html`
      <button @click=${this._fetchJoke}>Fetch a joke</button>
      ${this.loading
        ? html`<p class="loading">Loading...</p>`
        : this.joke
          ? html`<p class="joke">${this.joke}</p>`
          : html`<p>Click the button to fetch a random joke.</p>`}
    `;
  }
}

customElements.define('my-fetcher', MyFetcher);
