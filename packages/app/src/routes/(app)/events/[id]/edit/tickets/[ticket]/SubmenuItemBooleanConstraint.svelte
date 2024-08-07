<script lang="ts">
  import { MutationStore, type BooleanConstraint$options } from '$houdini';
  import { SubmenuItem } from '$lib/components';
  import { DISPLAY_BOOLEAN_CONSTRAINT } from '$lib/display';
  import { LoadingText, loaded, mapAllLoading, type MaybeLoading } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import type { SvelteComponent } from 'svelte';
  import IconCheck from '~icons/msl/check';
  import IconDisallow from '~icons/msl/close';
  import IconDontCare from '~icons/msl/skip-next-outline';

  function withBooleanConstraint(label: MaybeLoading<string>, value: MaybeLoading<boolean | null>) {
    return mapAllLoading([label, value], (l, v) =>
      v === null ? 'Pas de contrainte' : `${l} ${v ? 'seulement' : 'interdits'}`,
    );
  }
  function cycleBooleanConstraint(current: boolean | null): BooleanConstraint$options {
    if (current === true) return 'DontCare';
    if (current === null) return 'Not';
    return 'Only';
  }

  export let icon: typeof SvelteComponent<any>;
  export let subtext: MaybeLoading<string>;
  export let ticketId: MaybeLoading<string>;
  export let value: MaybeLoading<boolean | null>;
  export let errorMessage: string;
  export let mutation: MutationStore<
    {
      updateTicketConstraints: { data?: any };
    },
    {
      ticket: string;
      constraint: BooleanConstraint$options;
    },
    {}
  >;
</script>

<SubmenuItem
  clickable
  on:click={async () => {
    if (!ticketId) return;
    if (!loaded(value)) return;
    toasts.mutation(
      // @ts-expect-error can't be bothered to type that right lmao
      await mutate(mutation, {
        ticket: ticketId,
        constraint: cycleBooleanConstraint(value),
      }),
      'updateTicketConstraints',
      '',
      errorMessage,
    );
  }}
  {icon}
  subtext={mapAllLoading([subtext, value], withBooleanConstraint)}
>
  <slot></slot>
  <div class="icon" slot="right">
    {#if !loaded(value)}
      <LoadingText>.</LoadingText>
    {:else if value === true}
      <IconCheck />
    {:else if value === false}
      <IconDisallow />
    {:else}
      <IconDontCare />
    {/if}
  </div>
</SubmenuItem>

<style>
  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
  }
</style>
