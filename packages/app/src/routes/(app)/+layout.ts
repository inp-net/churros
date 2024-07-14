import {
  graphql,
  load_AppLayout,
  load_AppLayoutScanningEvent,
  loadAll,
  type AppLayout$input,
} from '$houdini';
import { CURRENT_VERSION } from '$lib/buildinfo';
import type { LayoutRouteId } from './$types.js';
export const ssr = false;

graphql(`
  query AppLayoutScanningEvent($scanningEvent: Boolean!, $group: UID!, $slug: String!) {
    currentEvent: event(group: $group, slug: $slug) @loading @include(if: $scanningEvent) {
      ...NavigationTopCurrentEvent
    }
  }
`);

// Ensures type safety (if the page is moved, typescript will force us to update this value)
const scanningEventsRouteId: LayoutRouteId = '/(app)/events/[group]/[uid]/scan';

export async function load(event) {
  return loadAll(
    load_AppLayout({
      event,
      variables: { version: CURRENT_VERSION } as AppLayout$input,
    }),
    load_AppLayoutScanningEvent({
      event,
      variables: {
        group: event.params.group ?? 'unknown',
        slug: event.params.uid ?? 'unknown',
        scanningEvent: scanningEventsRouteId === event.route.id,
      },
    }),
  );
}
