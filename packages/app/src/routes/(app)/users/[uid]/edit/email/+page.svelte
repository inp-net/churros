<script lang="ts">
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { formatDateTime } from '$lib/dates';
  import { LoadingText, mapLoading } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageUserEditEmail } = data);

  const RequestChange = graphql(`
    mutation RequestEmailChange($email: Email!, $callbackURL: URL!) {
      requestEmailChange(email: $email, callbackURL: $callbackURL) {
        ...MutationErrors
        ... on MutationRequestEmailChangeSuccess {
          data {
            ...List_EmailChangeRequests_insert
          }
        }
      }
    }
  `);

  export let newEmail: string = '';
  $: newEmail ||= $PageUserEditEmail?.data?.user.email ?? '';
</script>

<MaybeError result={$PageUserEditEmail} let:data={{ user }}>
  <div class="contents">
    <form
      on:submit|preventDefault={async () => {
        const result = await mutate(RequestChange, {
          email: newEmail,
          callbackURL: new URL(route('/validate-email/[token]', '[token]'), $page.url),
        });
        toasts.mutation(
          result,
          'requestEmailChange',
          "Si l'adresse fournie existe, tu devrais recevoir un e-mail de validation dans quelques instants.",
          "Erreur lors de l'envoi de l'e-mail de validation",
        );
      }}
    >
      <InputText placeholder="Adresse e-mail" bind:value={newEmail} label="" required />
      <ButtonPrimary submits>Changer d'email</ButtonPrimary>
    </form>
    <section class="requests">
      <h2 class="typo-field-label">Demandes en cours</h2>
      <ul>
        {#each user.emailChangeRequests as request}
          <li>
            <header>
              <LoadingText tag="strong" class="primary" value={request.email} />
              <em>Réf. <LoadingText tag="code" value={request.localID} /></em>
            </header>
            <p class="muted">
              Créée le <LoadingText value={mapLoading(request.createdAt, formatDateTime)} />
            </p>
          </li>
        {/each}
      </ul>
    </section>
  </div>
</MaybeError>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    padding: 0 1rem;
  }

  form {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 2rem;
    align-items: center;
    justify-content: center;
  }

  .requests h2 {
    margin-bottom: 1rem;
  }

  .requests li header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .requests li {
    display: flex;
    flex-direction: column;

    /* gap: 0.5rem; */
  }

  .requests ul {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .requests li em {
    font-size: 0.8em;
  }
</style>
