import { load_AppLayout, loadAll, type AppLayout$input } from '$houdini';
import { CURRENT_VERSION } from '$lib/buildinfo';
export const ssr = true;



export async function load(event) {
  const result = await loadAll(
    load_AppLayout({
      event,
      variables: {
        version: CURRENT_VERSION,
        pagePath: event.url.pathname,
      } as AppLayout$input, // see https://github.com/HoudiniGraphql/houdini/issues/1308
    }),
  );
  return result;
}
