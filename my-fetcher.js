import { LitElement, html, css } from 'lit';
import { ResumableMixin } from './resumable-mixin.js';

class MyFetcher extends ResumableMixin(LitElement) {
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
      // 5 second delay so you can switch tabs while it's loading
      await new Promise((r) => setTimeout(r, 5000));
      const res = await this.resumableFetch(
        'https://official-joke-api.appspot.com/random_joke'
      );
      const data = await res.json();
      this.joke = `${data.setup} — ${data.punchline}`;
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
