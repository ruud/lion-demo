import { createContext } from '@lit/context';

/**
 * Context key for providing an Ajax instance to descendant components.
 * Each provider can supply its own Ajax instance with independent
 * configuration (headers, interceptors, caching, etc.).
 *
 * @type {import('@lit/context').Context<'ajax-context', import('@lion/ajax').Ajax>}
 */
export const ajaxContext = createContext('ajax-context');
