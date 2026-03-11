import { createContext } from '@lit/context';

/**
 * Context key for worksession identity and visibility.
 *
 * Provided by <worksession-panel>, consumed by <customer-panel> (to AND
 * visibility) and <ajax-provider> (to inject the worksession ID as a header).
 *
 * @type {import('@lit/context').Context<'work-session', { id: string|null, visible: boolean }>}
 */
export const workSessionContext = createContext('work-session');
