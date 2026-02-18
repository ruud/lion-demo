import { LitElement, html } from 'lit';
import { ContextProvider } from '@lit/context';
import { Ajax } from '@lion/ajax';
import { ajaxContext } from './ajax-context.js';

/**
 * A provider element that creates an independent Ajax instance and provides
 * it to all descendant components via the Lit Context protocol.
 *
 * Usage:
 *   <ajax-provider headers='{"X-Custom": "value"}'>
 *     <my-fetcher></my-fetcher>
 *   </ajax-provider>
 *
 * Each <ajax-provider> creates its own Ajax instance, so tabs can have
 * completely independent HTTP configurations.
 */
class AjaxProvider extends LitElement {
  static properties = {
    /** JSON string of headers to add to every request */
    headers: { type: String },
  };

  constructor() {
    super();
    this.headers = '{}';
    this._ajaxInstance = null;
    this._provider = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._createAjaxInstance();
  }

  _createAjaxInstance() {
    const parsedHeaders = JSON.parse(this.headers);
    this._ajaxInstance = new Ajax();

    // Add a request interceptor that logs the custom headers
    this._ajaxInstance.addRequestInterceptor((request) => {
      console.log(`[AjaxProvider] headers for request:`, parsedHeaders);
      return request;
    });

    this._provider = new ContextProvider(this, {
      context: ajaxContext,
      initialValue: this._ajaxInstance,
    });
  }

  createRenderRoot() {
    // Render children in light DOM so they participate in slots
    return this;
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('ajax-provider', AjaxProvider);
