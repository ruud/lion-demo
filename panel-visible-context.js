import { createContext } from '@lit/context';

/**
 * Context key for panel visibility state.
 *
 * Provided by <resumable-panel>, consumed by ResumableMixin and <ajax-provider>.
 * Value is `true` when the panel is the active/visible tab, `false` otherwise.
 *
 * @type {import('@lit/context').Context<'panel-visible', boolean>}
 */
export const panelVisibleContext = createContext('panel-visible');
