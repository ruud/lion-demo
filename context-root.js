import { ContextRoot } from '@lit/context';

/**
 * Initialize ContextRoot at the document level.
 *
 * ContextRoot catches unhandled `context-request` events from early-connecting
 * consumers (whose providers haven't upgraded yet) and re-dispatches them when
 * late providers appear. This makes the system resilient to any element
 * definition/upgrade order.
 *
 * This module MUST be imported before any component definitions to ensure the
 * listener is active when the first `context-request` fires.
 */
new ContextRoot(document);
