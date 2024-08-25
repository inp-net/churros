<script lang="ts">
  import { graphql } from '$houdini';
  import AvatarStudentAssociation from '$lib/components/AvatarStudentAssociation.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { loading, LoadingText } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import type { PageData } from './$houdini';
  import ItemContribution from './ItemContribution.svelte';

  const AddContribution = graphql(`
    mutation AddContribution($user: UID!, $option: LocalID!) {
      markContributionAsPaid(user: $user, option: $option, create: true) {
        ...MutationErrors
        ... on MutationMarkContributionAsPaidSuccess {
          data {
            ...List_UserContributions_Paid_insert
            ...List_UserContributions_Options_remove
          }
        }
      }
    }
  `);

  export let data: PageData;
  $: ({ PageUserEditContributions } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageUserEditContributions} let:data={{ user }}>
  <div class="contents">
    {#if user.isMe && user.canContributeTo.some((c) => !c.contributing)}
      <h2 class="typo-field-label">Cotiser pour</h2>
      <ul>
        {#each user.canContributeTo.filter((c) => !c.contributing) as studentAssociation}
          <li>
            <ButtonSecondary href={refroute('/[uid=uid]', loading(studentAssociation.uid, ''))}>
              <AvatarStudentAssociation name {studentAssociation} />
            </ButtonSecondary>
          </li>
        {/each}
      </ul>
    {:else if user.contributionOptions.some((option) => option.canMarkAsPaid)}
      <h2>Ajouter une cotisation</h2>
      <ul>
        {#each user.contributionOptions.filter((option) => option.canMarkAsPaid && !option.paidByUser) as option}
          <ItemContribution paid={false} by={user.uid} {option}>
            <ButtonSecondary
              slot="status"
              on:click={async () => {
                await mutateAndToast(
                  AddContribution,
                  {
                    user: user.uid,
                    option: option.localID,
                  },
                  { error: 'Impossible de créer la cotisation' },
                );
                // // TODO figure out why this is needed???
                // await PageUserEditContributions.fetch({ variables: { uid: $page.params.uid } });
              }}
            >
              Rendre cotisant·e
            </ButtonSecondary>
          </ItemContribution>
        {:else}
          <li class="muted">
            <LoadingText value={user.fullName} /> ne peut pas (ou plus) cotiser.
          </li>
        {/each}
      </ul>
    {/if}
    {#if user.pendingContributions.length > 0}
      <h2 class="typo-field-label">Cotisations en attente de paiement</h2>
      <ul>
        {#each user.pendingContributions as option}
          <ItemContribution paid={false} by={user.uid} {option} />
        {/each}
      </ul>
    {/if}
    <h2 class="typo-field-label">Cotisations payées</h2>
    <ul>
      {#each user.contributesWith as option}
        <ItemContribution paid by={user.uid} {option} />
      {:else}
        <li class="muted">
          Aucune cotisation {#if user.pendingContributions.length > 0}payée{/if}
        </li>
      {/each}
    </ul>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  h2 {
    margin-top: 3rem;
    margin-bottom: 1rem;
  }
</style>
