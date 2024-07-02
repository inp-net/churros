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
  query AppLayoutScanningEvent($group: UID!, $slug: String!) {
    event(group: $group, slug: $slug) @loading {
      ...NavigationTopCurrentEvent
    }
  }
`);

// Ensures type safety (if the page is moved, typescript will force us to update this value)
const scanningEventsRouteId: LayoutRouteId = '/(app)/events/[group]/[uid]/scan';

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
        variables: {
          group: event.params.group!,
          slug: event.params.uid!,
        },
      })),
    };
  }

  return data;
}
