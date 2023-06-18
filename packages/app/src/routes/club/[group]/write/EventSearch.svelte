<script lang="ts">
  import GhostButton from '$lib/components/buttons/GhostButton.svelte';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import InlineLoader from '$lib/components/loaders/InlineLoader.svelte';
  import { zeus } from '$lib/zeus';
  import { tick } from 'svelte';
  import IconCheckLine from '~icons/mdi/check';
  import IconClose from '~icons/mdi/close';
  import IconDotsHorizontal from '~icons/mdi/dots-horizontal';
  import IconPlus from '~icons/mdi/plus';

  export let eventId: string | undefined = undefined;
  export let eventUid: string | undefined = undefined;
  export let groupUid: string;

  let loading = false;
  let enabled: boolean;
  let q = '';
  let options: Array<{ uid: string; title: string }> = [];

  let input: HTMLInputElement;
</script>

<FormInput label="Évènement : ">
  {#if enabled || eventUid}
    <span>
      {#if eventUid}
        <a href="/club/{groupUid}/event/{eventUid}">{eventUid}</a>
      {/if}
      {#if loading}
        <InlineLoader />
      {:else if eventUid}
        <IconCheckLine aria-label="Valeur acceptée" aria-live="polite" />
      {:else}
        <IconDotsHorizontal aria-label="Entrez un nom d'un évènement" />
      {/if}
      <input
        bind:this={input}
        type="search"
        list="events"
        class="flex-1"
        placeholder="Rechercher un évènement du groupe"
        required
        bind:value={q}
        on:input={async () => {
          if (!q) return;
          loading = true;
          enabled = true;
          eventUid = undefined;
          try {
            const { event } = await $zeus.query({
              event: [
                { uid: q, groupUid },
                { uid: true, title: true, id: true },
              ],
            });
            input.setCustomValidity('');
            eventUid = event.uid;
            eventId = event.id;
          } catch {
            input.setCustomValidity('Veuillez entrer un évènement valide');
            const { searchEvents } = await $zeus.query({
              searchEvents: [
                { q, groupUid },
                { title: true, uid: true },
              ],
            });
            options = searchEvents;
          } finally {
            loading = false;
          }
        }}
      />
      <!-- The following span is used as a placeholder to space things a bit -->
      <span />
      <GhostButton
        title="Supprimer"
        on:click={() => {
          eventUid = undefined;
          enabled = false;
        }}
      >
        <IconClose aria-label="Supprimer" />
      </GhostButton>
    </span>
  {:else}
    <button
      type="button"
      on:click={async () => {
        if (input === null) {
          // @ts-expect-error Tricking TS into thinking that input is always defined
          input = undefined;
          return;
        }

        enabled = true;
        await tick();
        input.focus();
      }}
    >
      <IconPlus aria-hidden="true" /> Choisir un évènement
    </button>
  {/if}
</FormInput>

<datalist id="events">
  {#each options as { uid, title }}
    <option value={uid}>{title}</option>
  {/each}
</datalist>
