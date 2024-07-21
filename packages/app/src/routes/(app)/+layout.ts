import {
  graphql,
  load_AppLayout,
  load_AppLayoutScanningEvent,
  type AppLayout$input,
} from '$houdini';
import { CURRENT_VERSION } from '$lib/buildinfo';
import type { LayoutRouteId } from './$types.js';
export const ssr = false;

graphql(`
  query AppLayoutScanningEvent($id: LocalID!) {
    scanningEvent: event(id: $id) @loading {
      ...NavigationTopCurrentEvent
    }
  }
`);

// Ensures type safety (if the page is moved, typescript will force us to update this value)
const scanningEventsRouteId: LayoutRouteId = '/(app)/events/[id]/scan';

export async function load(event) {
  const data = await load_AppLayout({
    event,
    variables: {
      version: CURRENT_VERSION,
    } as AppLayout$input, // see https://github.com/HoudiniGraphql/houdini/issues/1308
  });

  if (event.route.id === scanningEventsRouteId) {
    return {
      ...data,
      ...(await load_AppLayoutScanningEvent({
        event,
        variables: { id: event.params.id! },
      })),
    };
  }

  return data;
}
