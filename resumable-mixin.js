import { ajax as defaultAjax } from '@lion/ajax';
import { ContextConsumer } from '@lit/context';
import { ajaxContext } from './ajax-context.js';

/**
 * ResumableMixin - A generic mixin for LitElement components that pauses/resumes
 * lifecycle when an ancestor's visibility changes (e.g., inside tabs).
 *
 * It observes the closest ancestor with a `hidden` attribute (or any ancestor that
 * toggles `hidden`) using a MutationObserver. When the ancestor becomes hidden,
 * `onPause()` is called. When it becomes visible again, `onResume()` is called.
 *
 * When paused, the Lit rendering lifecycle is also stopped — `shouldUpdate()`
 * returns false, so no re-renders occur. When resumed, any pending updates are
 * flushed automatically.
 *
 * It consumes an Ajax instance via the Lit Context protocol (`ajaxContext`).
 * If a provider supplies an Ajax instance, that instance is used for
 * `resumableFetch()`. Otherwise, it falls back to the default `ajax` singleton.
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
      /** @type {MutationObserver|null} */
      this._visibilityObserver = null;
      /** @type {Element|null} The observed ancestor element */
      this._observedAncestor = null;
      /** @type {boolean} Whether an update was skipped while paused */
      this._hasPendingUpdate = false;
      /** @type {Array} Queue of fetch calls to execute on resume */
      this._fetchQueue = [];
      /** @type {Array} Buffer for in-flight results that arrived while paused */
      this._inflightResults = [];
      /** @type {ContextConsumer} Consumes an Ajax instance from context */
      this._ajaxConsumer = new ContextConsumer(this, {
        context: ajaxContext,
        subscribe: true,
      });
    }

    /**
     * Returns the Ajax instance from context, or the default singleton.
     * @returns {import('@lion/ajax').Ajax}
     */
    get ajax() {
      return this._ajaxConsumer.value ?? defaultAjax;
    }

    connectedCallback() {
      super.connectedCallback();
      this._setupVisibilityObserver();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._teardownVisibilityObserver();
      if (this._resumed) {
        this._resumed = false;
        this.onPause();
      }
    }

    /**
     * Find the closest ancestor that is used as a visibility container.
     * Walks up the DOM tree looking for an element with a `hidden` attribute
     * or a `slot="panel"` attribute (common in tab implementations).
     * Falls back to the parentElement.
     * @returns {Element|null}
     */
    _findObservableAncestor() {
      let el = this.parentElement;
      while (el) {
        if (el.hasAttribute('hidden') || el.getAttribute('slot') === 'panel') {
          return el;
        }
        el = el.parentElement;
      }
      return this.parentElement;
    }

    _setupVisibilityObserver() {
      this._observedAncestor = this._findObservableAncestor();
      if (!this._observedAncestor) return;

      this._visibilityObserver = new MutationObserver(() => {
        this._checkVisibility();
      });

      this._visibilityObserver.observe(this._observedAncestor, {
        attributes: true,
        attributeFilter: ['hidden', 'selected', 'style', 'class'],
      });

      // Initial check
      this._checkVisibility();
    }

    _teardownVisibilityObserver() {
      if (this._visibilityObserver) {
        this._visibilityObserver.disconnect();
        this._visibilityObserver = null;
      }
      this._observedAncestor = null;
    }

    _checkVisibility() {
      let isVisible = true;
      if (this._observedAncestor) {
        if (this._observedAncestor.hasAttribute('hidden')) {
          isVisible = false;
        } else if (this._observedAncestor.hasAttribute('selected')) {
          // Lion tabs uses selected="true" on the active panel
          isVisible = this._observedAncestor.getAttribute('selected') === 'true';
        } else if (this._observedAncestor.getAttribute('slot') === 'panel') {
          // Panel exists but has no selected attr => not active
          isVisible = false;
        }
      }

      if (isVisible && !this._resumed) {
        this._resumed = true;
        this.onResume();
        // Flush any updates that were skipped while paused
        if (this._hasPendingUpdate) {
          this._hasPendingUpdate = false;
          this.requestUpdate();
        }
        // Flush any queued fetch calls
        this._flushFetchQueue();
        // Deliver any in-flight responses that arrived while paused
        this._flushInflightResults();
      } else if (!isVisible && this._resumed) {
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

    /**
     * A resumable version of fetch(). Uses Lion's ajax.fetch under the hood,
     * which provides interceptors, XSRF handling, and caching support.
     *
     * Behaviour:
     * - When active: executes immediately. If the tab is switched away before
     *   the response arrives, the response is buffered and delivered once the
     *   component resumes (deferred resolution).
     * - When paused: the request is queued entirely and executed on resume.
     *
     * This means the consuming component never processes a response while
     * hidden — it pairs naturally with shouldUpdate() blocking renders.
     *
     * @param {string|Request} input - The resource URL or Request object
     * @param {RequestInit} [init] - Optional fetch options
     * @returns {Promise<Response>} The fetch response
     */
    resumableFetch(input, init) {
      if (this._resumed) {
        return this._trackInflight(this.ajax.fetch(input, init));
      }

      return new Promise((resolve, reject) => {
        this._fetchQueue.push({ input, init, resolve, reject });
      });
    }

    /**
     * Wraps a fetch promise so that if the response arrives while paused,
     * it is buffered and only delivered once the component resumes.
     * @param {Promise<Response>} fetchPromise
     * @returns {Promise<Response>}
     * @private
     */
    _trackInflight(fetchPromise) {
      return new Promise((resolve, reject) => {
        fetchPromise.then(
          (response) => {
            if (this._resumed) {
              resolve(response);
            } else {
              this._inflightResults.push({ resolve, reject, response });
            }
          },
          (err) => {
            if (this._resumed) {
              reject(err);
            } else {
              this._inflightResults.push({ resolve, reject, error: err });
            }
          },
        );
      });
    }

    /**
     * Execute all queued fetch calls.
     * @private
     */
    async _flushFetchQueue() {
      const queue = [...this._fetchQueue];
      this._fetchQueue = [];
      for (const { input, init, resolve, reject } of queue) {
        try {
          const response = await this.ajax.fetch(input, init);
          resolve(response);
        } catch (err) {
          reject(err);
        }
      }
    }

    /**
     * Deliver any in-flight fetch results that arrived while paused.
     * @private
     */
    _flushInflightResults() {
      const results = [...this._inflightResults];
      this._inflightResults = [];
      for (const entry of results) {
        if (entry.error !== undefined) {
          entry.reject(entry.error);
        } else {
          entry.resolve(entry.response);
        }
      }
    }
  };
