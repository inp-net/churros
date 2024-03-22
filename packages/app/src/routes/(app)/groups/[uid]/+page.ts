import { load_AppLayout, load_GroupProfile } from '$houdini';
import { get } from 'svelte/store';

// export const _GroupProfileVariables: GroupProfileVariables = async (event) => {
//   return {
//     ...event.params,
//     isStudent: !me?.external,
//   };
// };

export async function load(event) {
  const { AppLayout } = await load_AppLayout({ event });
  const { me } = get(AppLayout).data ?? { me: undefined };
  return load_GroupProfile({
    event,
    variables: {
      isStudent: true,
      uid: event.params.uid,
    },
  });
}
