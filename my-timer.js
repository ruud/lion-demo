import { LitElement, html, css } from 'lit';
import { ResumableMixin } from './resumable-mixin.js';

class MyTimer extends ResumableMixin(LitElement) {
  static properties = {
    seconds: { type: Number },
  };

  static styles = css`
    :host {
      display: block;
      margin-top: 12px;
      font-size: 18px;
      font-family: monospace;
    }
  `;

  constructor() {
    super();
    this.seconds = 0;
    this._interval = null;
  }

  onResume() {
    this._interval = setInterval(() => {
      this.seconds++;
    }, 1000);
  }

  onPause() {
    clearInterval(this._interval);
    this._interval = null;
  }

  render() {
    const mins = String(Math.floor(this.seconds / 60)).padStart(2, '0');
    const secs = String(this.seconds % 60).padStart(2, '0');
    return html`⏱ ${mins}:${secs}`;
  }
}

customElements.define('my-timer', MyTimer);
