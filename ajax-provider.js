import { LitElement } from 'lit';
import { ContextProvider, ContextConsumer } from '@lit/context';
import { Ajax } from '@lion/ajax';
import { ajaxContext } from './ajax-context.js';
import { panelVisibleContext } from './panel-visible-context.js';
import { workSessionContext } from './worksession-context.js';
import { customerContext } from './customer-context.js';

/**
 * A provider element that creates an independent Ajax instance and provides
 * it to all descendant components via the Lit Context protocol.
 *
 * It consumes `panelVisibleContext` from the nearest panel component.
 * While the panel is hidden, async interceptors on the Ajax instance gate
 * all outgoing requests and incoming responses — they are held until the
 * panel becomes visible again.
 *
 * It also consumes `workSessionContext` and `customerContext` to automatically
 * inject `X-WorkSession-Id` and `X-Customer-Id` headers on every request.
 *
 * No events, no document listeners, no DOM traversal. Visibility and
 * identity flow down the tree via context.
 *
 * Usage:
 *   <ajax-provider>
 *     <my-fetcher></my-fetcher>
 *   </ajax-provider>
 *
 * Each <ajax-provider> creates its own Ajax instance, so tabs have
 * completely independent HTTP configurations and request queues.
 */
class AjaxProvider extends LitElement {
  constructor() {
    super();
    this._ajaxInstance = null;
    this._ajaxProvider = null;
    /** @type {boolean} Whether the panel is currently visible */
    this._visible = false;
    /** @type {Array<{resolve: Function}>} Pending gate promises */
    this._pendingGates = [];

    /** Consume panel visibility from the nearest panel component */
    this._visibilityConsumer = new ContextConsumer(this, {
      context: panelVisibleContext,
      callback: (visible) => this._onVisibilityChanged(visible),
      subscribe: true,
    });

    /** Consume worksession identity for automatic header injection */
    this._wsConsumer = new ContextConsumer(this, {
      context: workSessionContext,
      subscribe: true,
    });

    /** Consume customer identity for automatic header injection */
    this._custConsumer = new ContextConsumer(this, {
      context: customerContext,
      subscribe: true,
    });
  }

  connectedCallback() {
    super.connectedCallback();
    // Only create the Ajax instance once — on reconnect, consumers
    // still hold a reference to the original instance from context.
    if (!this._ajaxInstance) {
      this._createAjaxInstance();
    }

    // If no provider is found, auto-resume after a frame
    this._autoResumeRaf = requestAnimationFrame(() => {
      if (this._visibilityConsumer.value === undefined && !this._visible) {
        this._visible = true;
        this._releaseGates();
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this._autoResumeRaf);
    // Reject stale gates so callers can handle the abort gracefully
    // instead of resolving with undefined (which would trigger side effects).
    this._rejectGates();
  }

  // --------------- Visibility ---------------

  /** @private */
  _onVisibilityChanged(visible) {
    const wasVisible = this._visible;
    this._visible = visible;
    if (visible && !wasVisible) {
      this._releaseGates();
    }
  }

  // --------------- Gate helpers ---------------

  /** Release all pending request gates so their fetch calls proceed. */
  _releaseGates() {
    const gates = [...this._pendingGates];
    this._pendingGates = [];
    for (const { resolve } of gates) {
      resolve();
    }
  }

  /**
   * Reject all pending gates — used during disconnect so stale requests
   * fail fast instead of silently resolving with undefined data.
   */
  _rejectGates() {
    const gates = [...this._pendingGates];
    this._pendingGates = [];
    for (const { reject } of gates) {
      reject(new DOMException('Ajax provider disconnected', 'AbortError'));
    }
  }

  /**
   * Returns a promise that resolves immediately when visible,
   * or waits until the provider's panel becomes visible.
   * @returns {Promise<void>}
   */
  _waitUntilVisible() {
    if (this._visible) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this._pendingGates.push({ resolve, reject });
    });
  }

  // --------------- Ajax instance ---------------

  _createAjaxInstance() {
    this._ajaxInstance = new Ajax();

    // Async gate interceptor: holds every request until the panel is visible,
    // then injects worksession and customer IDs as headers.
    this._ajaxInstance.addRequestInterceptor(async (request) => {
      await this._waitUntilVisible();
      const wsId = this._wsConsumer.value?.id;
      const custId = this._custConsumer.value?.id;
      if (wsId) request.headers.set('X-WorkSession-Id', wsId);
      if (custId) request.headers.set('X-Customer-Id', custId);
      return request;
    });

    // Response interceptor: holds every response until the panel is visible,
    // so downstream code (dialogs, side effects) won't run while hidden.
    this._ajaxInstance.addResponseInterceptor(async (response) => {
      await this._waitUntilVisible();
      return response;
    });

    this._ajaxProvider = new ContextProvider(this, {
      context: ajaxContext,
      initialValue: this._ajaxInstance,
    });
  }

  createRenderRoot() {
    // Light DOM so children stay in the document flow.
    // No render() needed — <slot> is a no-op in light DOM.
    return this;
  }
}

customElements.define('ajax-provider', AjaxProvider);
