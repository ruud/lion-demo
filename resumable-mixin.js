import { ContextConsumer } from '@lit/context';
import { panelVisibleContext } from './panel-visible-context.js';

/**
 * ResumableMixin — A generic mixin for LitElement components that pauses/resumes
 * lifecycle based on the `panelVisibleContext` provided by <resumable-panel>.
 *
 * Uses the Lit Context protocol to receive visibility state from the nearest
 * <resumable-panel> ancestor. No events, no document listeners, no DOM traversal.
 *
 * When paused, `shouldUpdate()` returns false so no re-renders occur.
 * When resumed, any pending updates are flushed automatically.
 *
 * If no context provider is found (i.e. the component is used outside of
 * <resumable-panel>), it defaults to visible/resumed.
 *
 * Usage:
 *   class MyComponent extends ResumableMixin(LitElement) {
 *     onResume() { // start work }
 *     onPause()  { // stop work }
 *   }
 */
export const ResumableMixin = (superClass) =>
  class ResumableMixinClass extends superClass {
    constructor() {
      super();
      /** @type {boolean} Whether the component is currently resumed/active */
      this._resumed = false;
      /** @type {boolean} Whether an update was skipped while paused */
      this._hasPendingUpdate = false;

      /** @type {ContextConsumer} Consumes panel visibility from context */
      this._visibilityConsumer = new ContextConsumer(this, {
        context: panelVisibleContext,
        callback: (visible) => {
          console.log(`[ResumableMixin] context callback on <${this.localName}>, visible=${visible}`);
          this._onVisibilityChanged(visible);
        },
        subscribe: true,
      });
    }

    connectedCallback() {
      super.connectedCallback();
      console.log(`[ResumableMixin] connectedCallback on <${this.localName}>`);

      // If no provider is found, the consumer value stays undefined.
      // Auto-resume after a frame so standalone usage works.
      this._autoResumeRaf = requestAnimationFrame(() => {
        if (this._visibilityConsumer.value === undefined && !this._resumed) {
          console.log(`[ResumableMixin] auto-resume fallback on <${this.localName}> (no provider)`);
          this._resumed = true;
          this.onResume();
        }
      });
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      cancelAnimationFrame(this._autoResumeRaf);
      if (this._resumed) {
        this._resumed = false;
        this.onPause();
      }
    }

    /** @private */
    _onVisibilityChanged(visible) {
      if (visible && !this._resumed) {
        this._resumed = true;
        this.onResume();
        if (this._hasPendingUpdate) {
          this._hasPendingUpdate = false;
          this.requestUpdate();
        }
      } else if (!visible && this._resumed) {
        this._resumed = false;
        this.onPause();
      }
    }

    /**
     * Called when the component becomes visible / active.
     * Override this to start timers, animations, polling, etc.
     */
    onResume() {}

    /**
     * Called when the component becomes hidden / inactive.
     * Override this to pause timers, animations, polling, etc.
     */
    onPause() {}

    /**
     * Lit lifecycle hook: prevents re-rendering while the component is paused.
     * Any skipped updates are queued and flushed when the component resumes.
     */
    shouldUpdate(changedProperties) {
      if (!this._resumed) {
        this._hasPendingUpdate = true;
        return false;
      }
      return super.shouldUpdate(changedProperties);
    }
  };
