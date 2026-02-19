import { createContext } from '@lit/context';

/**
 * Context key for the currently selected tab index.
 *
 * Provided by <resumable-tabs>, consumed by <resumable-panel>.
 * Value is the 0-based index of the active tab.
 *
 * @type {import('@lit/context').Context<'selected-tab', number>}
 */
export const selectedTabContext = createContext('selected-tab');
