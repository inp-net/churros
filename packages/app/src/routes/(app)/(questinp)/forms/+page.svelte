<script lang="ts">
  import type { PageData } from '../../../(questinp)/forms/$houdini';
  import { page } from '$app/stores';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import IconCheck from '~icons/msl/check';
  import { route } from '$lib/ROUTES';
  import { refroute } from '$lib/navigation';
  import { mutate } from '$lib/mutations';
  import { onceLoaded, mapLoading, LoadingText } from '$lib/loading';
  import Submenu from '$lib/components/Submenu.svelte';
  import { addDays } from 'date-fns';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import Avatar from '$lib/components/Avatar.svelte';
  import { formatDateTimeSmart } from '$lib/dates';

  const forms = [
    {
      title: '🏎Soirée FOY N7RT🏎',
      completed: false,
      dueAt: addDays(new Date(), 5),
      group: { uid: 'tvn7-n7', name: 'TVn7' },
      url: "https://forms.gle/redacted"
    },
    {
      title: '🎭🎼MUSICAL INP🎼🎭',
      completed: false,
      dueAt: null,
      group: { uid: 'musique-n7', name: "Club'Zik" },
    },
    {
      title: "Lumières pour l'OSET",
      completed: false,
      dueAt: null,
      group: { uid: 'animation-n7', name: 'CAn7' },
      url: "https://forms.gle/redacted"
    },
    {
      title: 'Créneaux DJ soirée Foy N7RT',
      completed: false,
      dueAt: null,
      group: { uid: 'animation-n7', name: 'CAn7' },
      url: "https://forms.gle/redacted"
    },
    {
      title: "AG d'admission",
      completed: true,
      dueAt: addDays(new Date(), 6),
      group: { uid: 'animation-n7', name: 'CAn7' },
      url: ""
    },
  ];
</script>

<div class="contents">
  <Submenu>
    {#each forms as { title, completed, dueAt, group, url }}
      <SubmenuItem href={url} icon={null}>
        <Avatar slot="icon" help="" href="" src="https://churros.inpt.fr/{group.uid}.png" />
        <span
          slot="subtext"
          class:success={completed}
          class:warning={!completed && dueAt}
          class:muted={!completed && !dueAt}
        >
          {#if completed}
            <IconCheck />
            Répondu
          {:else if dueAt}
            Répondre avant {formatDateTimeSmart(dueAt)}
          {:else}
            Non répondu
          {/if}
        </span>
        {title}
      </SubmenuItem>
    {/each}
  </Submenu>
</div>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
