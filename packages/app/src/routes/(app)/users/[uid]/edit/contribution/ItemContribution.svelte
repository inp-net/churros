<script lang="ts">
  import { fragment, graphql, type ItemContribution } from '$houdini';
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import AvatarStudentAssociation from '$lib/components/AvatarStudentAssociation.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { loaded, loading, LoadingText, mapLoading, type MaybeLoading } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import IconSuccess from '~icons/msl/check';

  export let paid: boolean;
  /** uid of the user paying the contribution */
  export let by: MaybeLoading<string>;
  export let option: ItemContribution | null;
  $: data = fragment(
    option,
    graphql(`
      fragment ItemContribution on ContributionOption @loading {
        name
        canMarkAsPaid
        localID
        price
        paysFor {
          ...AvatarStudentAssociation
        }
        offeredIn {
          ...AvatarSchool
        }
      }
    `),
  );

  const MarkContributionAsPaid = graphql(`
    mutation MarkContributionAsPaid($user: UID!, $option: LocalID!) {
      markContributionAsPaid(user: $user, option: $option) {
        ...MutationErrors
        ... on MutationMarkContributionAsPaidSuccess {
          data {
            ...List_UserContributions_Pending_remove
            ...List_UserContributions_Paid_insert
          }
        }
      }
    }
  `);

  const DeleteContribution = graphql(`
    mutation DeleteContribution($user: UID!, $option: LocalID!) {
      deleteContribution(user: $user, option: $option) {
        ...MutationErrors
        ... on MutationDeleteContributionSuccess {
          data {
            ...List_UserContributions_Pending_remove
            ...List_UserContributions_Paid_remove
            ...List_UserContributions_Options_insert @with(uid: $user)
          }
        }
      }
    }
  `);
</script>

<li>
  <header>
    <div class="text">
      {#if $data}
        <LoadingText value={mapLoading($data.price, (price) => `${price}€`)} />
        <LoadingText value={$data.name} />
      {/if}
    </div>
    <div class="status">
      <slot name="status">
        {#if paid}
          <span class="success">
            <IconSuccess></IconSuccess> Payée
          </span>
        {:else if $data?.canMarkAsPaid}
          <ButtonSecondary
            on:click={async () => {
              if (!$data) return;
              await mutateAndToast(
                MarkContributionAsPaid,
                {
                  user: by,
                  option: $data.localID,
                },
                { error: `Impossible de marquer ${loading($data.name, '…')} comme payée` },
              );
            }}>Marquer comme payée</ButtonSecondary
          >
        {:else}
          <span class="warning">En attente de paiement</span>
        {/if}
        {#if $data?.canMarkAsPaid}
          <ButtonSecondary
            danger
            on:click={async () => {
              if (!$data) return;
              await mutateAndToast(
                DeleteContribution,
                {
                  user: by,
                  option: $data.localID,
                },
                { error: `Impossible de supprimer ${loading($data.name, '…')}` },
              );
              if (!loaded(by)) return;
            }}>Supprimer</ButtonSecondary
          >
        {/if}
      </slot>
    </div>
  </header>
  <div class="details">
    <section class="pays-for">
      <span>Paye pour</span>
      {#each $data?.paysFor ?? [] as studentAssociation}
        <AvatarStudentAssociation name {studentAssociation} />
      {/each}
    </section>
    <section class="offered-in">
      <span>Disponible dans</span>
      <AvatarSchool name school={$data?.offeredIn ?? null} />
    </section>
  </div>
</li>

<style>
  li {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
  }

  header {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
  }

  header .text {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  .status {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  .details {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 2rem;
    align-items: center;
    justify-content: space-between;
  }

  .pays-for,
  .offered-in {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
