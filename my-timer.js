import { LitElement, html, css } from 'lit';
import { ResumableMixin } from './resumable-mixin.js';

/**
 * MyTimer — a simple elapsed-time counter.
 *
 * TESTS:
 * - ResumableMixin onPause/onResume: the interval is cleared on pause and
 *   restarted on resume, so the counter only ticks while the tab is active.
 * - shouldUpdate() render blocking: even if `this.seconds` changes via some
 *   other path, the component won't re-render while paused.
 *
 * HOW TO VERIFY:
 * 1. Open Tab 1 — the timer starts counting.
 * 2. Switch to Tab 2 — Tab 1’s timer stops.
 * 3. Switch back to Tab 1 — the timer resumes from where it left off
 *    (no jump in the count).
 */
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
