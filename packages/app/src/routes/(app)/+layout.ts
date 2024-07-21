import { graphql, load_AppLayout, type AppLayout$input } from '$houdini';
import { CURRENT_VERSION } from '$lib/buildinfo';
export const ssr = false;

graphql(`
  query AppLayoutScanningEvent($id: LocalID!) {
    scanningEvent: event(id: $id) @loading {
      ...NavigationTopCurrentEvent
    }
  }
`);

export async function load(event) {
  return await load_AppLayout({
    event,
    variables: {
      version: CURRENT_VERSION,
    } as AppLayout$input, // see https://github.com/HoudiniGraphql/houdini/issues/1308
  });
}
