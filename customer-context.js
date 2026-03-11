import { createContext } from '@lit/context';

/**
 * Context key for customer identity and visibility.
 *
 * Provided by <customer-panel>, consumed by <ajax-provider> (to inject
 * the customer ID as a header).
 *
 * @type {import('@lit/context').Context<'customer', { id: string|null, visible: boolean }>}
 */
export const customerContext = createContext('customer');
