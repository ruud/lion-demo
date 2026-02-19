import { ajax as defaultAjax } from '@lion/ajax';
import { ContextConsumer } from '@lit/context';
import { ajaxContext } from './ajax-context.js';

/**
 * AjaxConsumerMixin — a minimal mixin that provides `this.ajax`.
 *
 * It consumes the nearest `ajaxContext` provider (e.g. `<ajax-provider>`).
 * If no provider is found, it falls back to the default `@lion/ajax` singleton.
 *
 * This is the only change consuming teams need to make:
 *
 *   // before
 *   import { ajax } from '@lion/ajax';
 *   ajax.fetch('/api/data');
 *
 *   // after
 *   class MyComp extends AjaxConsumerMixin(LitElement) {
 *     doStuff() { this.ajax.fetch('/api/data'); }
 *   }
 */
export const AjaxConsumerMixin = (superClass) =>
  class AjaxConsumerMixinClass extends superClass {
    constructor() {
      super();
      /** @private */
      this._ajaxConsumer = new ContextConsumer(this, {
        context: ajaxContext,
        subscribe: true,
      });
    }

    /**
     * The Ajax instance from the nearest provider, or the default singleton.
     * @returns {import('@lion/ajax').Ajax}
     */
    get ajax() {
      return this._ajaxConsumer.value ?? defaultAjax;
    }
  };
