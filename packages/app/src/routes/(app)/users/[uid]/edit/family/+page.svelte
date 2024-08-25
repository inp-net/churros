<script lang="ts">
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputPerson from '$lib/components/InputPerson.svelte';
  import LoadingChurros from '$lib/components/LoadingChurros.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { formatDate } from '$lib/dates';
  import { allLoaded } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import IconCheck from '~icons/msl/check';
  import IconClose from '~icons/msl/close';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageUserEditFamily } = data);

  let godparentUid: string;
  $: godparentUid ??= $PageUserEditFamily?.data?.user?.godparent?.uid;

  const SendGodparentRequest = graphql(`
    mutation SendGodparentRequest($parent: String!, $child: String!) {
      upsertGodparentRequest(godchildUid: $child, godparentUid: $parent) {
        ...MutationErrors
        ... on MutationUpsertGodparentRequestSuccess {
          data {
            ...List_OutgoingGodparentRequests_insert
          }
        }
      }
    }
  `);

  const DeleteGodparent = graphql(`
    mutation DeleteGodparent($child: UID!, $parent: UID!) {
      deleteGodparent(child: $child, parent: $parent) {
        ...MutationErrors
        ... on MutationDeleteGodparentSuccess {
          data {
            godparent {
              ...AvatarUser
            }
          }
        }
      }
    }
  `);

  async function answerGodparentRequest(id: string, accept: boolean) {
    await graphql(`
      mutation AnswerGodparentRequest($id: LocalID!, $accept: Boolean!) {
        answerGodparentRequest(id: $id, accept: $accept) {
          ...MutationErrors
          ... on MutationAnswerGodparentRequestSuccess {
            data {
              ...List_IncomingGodparentRequests_remove
            }
          }
        }
      }
    `).mutate({ id, accept });
    await PageUserEditFamily.fetch({ variables: { uid: $page.params.uid } });
  }

  async function deleteGodchild(uid: string) {
    await graphql(`
      mutation DeleteGodchild($parent: UID!, $child: UID!) {
        deleteGodchild(parent: $parent, child: $child) {
          ...MutationErrors
          ... on MutationDeleteGodchildSuccess {
            data {
              ...List_Godchildren_remove
            }
          }
        }
      }
    `).mutate({ parent: $page.params.uid, child: uid });
    await PageUserEditFamily.fetch({ variables: { uid: $page.params.uid } });
  }
</script>

<MaybeError result={$PageUserEditFamily} let:data={{ user }}>
  <div class="contents">
    <h2>Parrainages</h2>
    {#if !allLoaded(user.godparent) || !allLoaded(user.familyTree.users)}
      <LoadingChurros />
    {:else}
      <InputPerson
        label="Parrain/Marraine"
        except={user.familyTree.users.map((u) => u.uid)}
        user={user.godparent}
        bind:uid={godparentUid}
      />
    {/if}
    <section class="send-request">
      <div class="actions">
        <ButtonSecondary
          disabled={!godparentUid || godparentUid === user.godparent?.uid}
          on:click={async () => {
            mutateAndToast(
              SendGodparentRequest,
              {
                parent: godparentUid,
                child: user.uid,
              },
              { error: "Impossible d'envoyer la demande de parrainage" },
            );
          }}>Envoyer une demande</ButtonSecondary
        >
        <ButtonSecondary
          disabled={!user.godparent}
          on:click={async () => {
            if (!user.godparent) return;
            mutateAndToast(DeleteGodparent, {
              parent: user.godparent.uid,
              child: user.uid,
            });
          }}>Rompre le parrainage</ButtonSecondary
        >
      </div>
    </section>

    {#if user.outgoingGodparentRequests.length > 0}
      <h3>Demandes en cours</h3>
      <ul class="nobullet">
        {#each user.outgoingGodparentRequests as { createdAt, godparent, id }}
          <li class="godparent-request">
            <AvatarUser name user={godparent} />
            <p class="date">
              {formatDate(createdAt)}
            </p>
            <div class="actions">
              <ButtonSecondary
                danger
                icon={IconClose}
                on:click={async () => answerGodparentRequest(id, false)}
              >
                Annuler
              </ButtonSecondary>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
    <h3>Fillot·e·s</h3>
    {#if [...user.incomingGodparentRequests, ...user.godchildren].length > 0}
      <ul class="nobullet">
        {#each user.incomingGodparentRequests as { godchild, id }}
          <li class="godchild-request">
            <AvatarUser name user={godchild} />
            <div class="actions">
              <ButtonSecondary
                icon={IconCheck}
                on:click={async () => answerGodparentRequest(id, true)}
              >
                Oui
              </ButtonSecondary>
              <ButtonSecondary
                danger
                icon={IconClose}
                on:click={async () => answerGodparentRequest(id, false)}
              >
                Non
              </ButtonSecondary>
            </div>
          </li>
        {/each}
        {#each user.godchildren as godchild}
          <li class="godchild">
            <AvatarUser name user={godchild} />
            <div class="actions">
              <ButtonSecondary
                danger
                icon={IconClose}
                on:click={async () => deleteGodchild(godchild.uid)}>Supprimer</ButtonSecondary
              >
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="godchildren-hint">
        Demandez à votre fillot·e de vous demander en tant que parrain/marraine
      </p>
    {/if}
  </div>
</MaybeError>

<style>
  .send-request {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
  }

  .send-request .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }

  .godparent-request,
  .godchild-request,
  .godchild {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }

  .godchildren-hint {
    padding: 1rem;
    color: var(--muted-text);
    border: var(--border-block) dashed var(--muted-border);
    border-radius: var(--radius-block);
  }

  .contents {
    padding: 0 1rem;
  }
</style>
