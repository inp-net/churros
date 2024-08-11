<script lang="ts">
  import { MutationStore, type BooleanConstraint$options } from '$houdini';
  import { SubmenuItem } from '$lib/components';
  import { LoadingText, loaded, mapAllLoading, type MaybeLoading } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import type { SvelteComponent } from 'svelte';
  import IconCheck from '~icons/msl/check';
  import IconDisallow from '~icons/msl/close';
  import IconDontCare from '~icons/msl/skip-next-outline';

  function addToLabel(label: MaybeLoading<string>, value: MaybeLoading<boolean | null>) {
    return mapAllLoading([label, value], (l, v) =>
      v === null ? 'Pas de contrainte' : `${l}: ${v ? 'seulement' : 'interdit'}`,
    );
  }
  function nextValue(current: boolean | null): BooleanConstraint$options {
    if (current === true) return 'DontCare';
    if (current === null) return 'Not';
    return 'Only';
  }

  function toTristate(v: BooleanConstraint$options): boolean | null {
    return {
      DontCare: null,
      Not: false,
      Only: true,
    }[v];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let icon: typeof SvelteComponent<any>;
  export let subtext: MaybeLoading<string>;
  export let ticketId: MaybeLoading<string>;
  export let value: MaybeLoading<boolean | null>;
  export let optimisticResponseField: string;
  export let errorMessage: string;
  export let mutation: MutationStore<
    {
      updateTicketConstraints: // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | { data?: any; constraintsWereSimplified?: string | null }
        | { ' $fragments': { MutationErrors: {} } };
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
      // @ts-expect-error TODO type mutation argument correctly
      await mutate(
        mutation,
        {
          ticket: ticketId,
          constraint: nextValue(value),
        },
        {
          optimisticResponse: {
            updateTicketConstraints: {
              __typename: 'MutationUpdateTicketConstraintsSuccess',
              data: {
                id: ticketId,
                [optimisticResponseField]: toTristate(nextValue(value)),
              },
            },
          },
        },
      ),
      'updateTicketConstraints',
      '',
      errorMessage,
      {
        constraintsWereSimplified: 'info',
      },
    );
  }}
  {icon}
  subtext={mapAllLoading([subtext, value], addToLabel)}
>
  <slot></slot>
  <div
    class="icon"
    slot="right"
    style:color="var(--{value === true ? 'success' : value === false ? 'error' : 'warning'})"
  >
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
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }
</style>
