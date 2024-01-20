<script lang="ts">
  import { page } from '$app/stores';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import IconCheck from '~icons/mdi/check';
  import IconError from '~icons/mdi/close';
  import IconLoading from '~icons/mdi/loading';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import { zeus } from '$lib/zeus';

  enum State {
    Adding,
    Errored,
    Success,
  }

  let membersToAdd = '';
  let adding = false;
  // [line, state, message to show, uid of user]
  let result: Array<[string, State, string, string | undefined]> = [];

  function unaccent(str: string): string {
    return str.normalize('NFD').replaceAll(/[\u0300-\u036F]/g, '');
  }

  async function addMember(line: string) {
    const resultIndex = result.length;
    result[resultIndex] = [line, State.Adding, 'Ajout en cours…', undefined];
    let uid: string | undefined = undefined;
    try {
      membersToAdd = membersToAdd
        .split('\n')
        .filter((l) => l !== line)
        .join('\n');
      if (line.startsWith('@')) {
        const { user } = await $zeus.query({
          user: [
            {
              uid: line.slice(1),
            },
            {
              uid: true,
            },
          ],
        });
        uid = user.uid;
      } else if (line.includes('@')) {
        const { userByEmail } = await $zeus.query({
          userByEmail: [
            {
              email: line,
            },
            {
              uid: true,
            },
          ],
        });
        uid = userByEmail.uid;
      } else {
        let { searchUsers } = await $zeus.query({
          searchUsers: [{ q: line }, { user: { uid: true, firstName: true, lastName: true } }],
        });
        const compare = (s: string) => unaccent(s).trim().toLowerCase().replaceAll(/\s+/g, ' ');
        searchUsers = searchUsers.filter(
          ({ user: { firstName, lastName } }) =>
            compare(`${firstName} ${lastName}`) === compare(line),
        );
        if (searchUsers.length === 0) {
          throw new Error(`Utilisateur·ice introuvable`);
        } else if (searchUsers.length > 1) {
          throw new Error(
            `Plusieurs utilisateur·ice·s trouvé·e·s, utilise plutôt l'adresse e-mail ou l'@`,
          );
        }

        ({
          user: { uid },
        } = searchUsers[0]);
      }

      if (!uid) throw new Error(`Utilisateur·ice introuvable`);

      const { addGroupMember } = await $zeus.mutate({
        addGroupMember: [
          {
            groupUid: $page.params.uid,
            title: 'Membre',
            uid,
          },
          {
            '__typename': true,
            '...on Error': { message: true },
            '...on MutationAddGroupMemberSuccess': { data: { __typename: true } },
          },
        ],
      });
      if (addGroupMember.__typename === 'Error') throw new Error(addGroupMember.message);

      result[resultIndex] = [line, State.Success, 'Ajouté!', uid];
    } catch (error) {
      result[resultIndex] = [line, State.Errored, error?.toString() ?? 'Erreur inconnue', uid];
    }
  }

  async function addMembers() {
    adding = true;
    const lines = membersToAdd.split('\n').filter((l) => l.trim());
    try {
      // Empty the results
      result = [];
      await Promise.all(lines.map(async (line) => addMember(line)));
      membersToAdd = lines
        .filter((l) => result.some(([line, status]) => l === line && status === State.Errored))
        .join('\n');
    } finally {
      adding = false;
    }
  }
</script>

<div class="content">
  <h1>
    <ButtonBack></ButtonBack>
    Ajouter des membres en masse
  </h1>
  <form on:submit|preventDefault={addMembers}>
    <InputLongText
      bind:value={membersToAdd}
      placeholder={'annie.versaire@etu.inp-n7.fr\nrick.astley@etu.inp-n7.fr\nines.alamaternite@gmail.com'}
      label="Membres"
      hint="Une adresse e-mail, @identifiant ou Prénom Nom de famille par ligne"
    ></InputLongText>

    <section class="submit">
      <ButtonPrimary submits loading={adding}>Inscrire</ButtonPrimary>
    </section>
  </form>

  <section class="results">
    <ul class="nobullet">
      {#each result as [line, status, message, uid]}
        <li
          class:muted={status === State.Adding}
          class:danger={status === State.Errored}
          class:success={status === State.Success}
        >
          <span class:loading={status === State.Adding} class="status"
            >{#if status === State.Errored}<IconError></IconError>
            {:else if status === State.Success}
              <IconCheck></IconCheck>
            {:else}
              <IconLoading></IconLoading>
            {/if}</span
          >
          <p>
            {line}
            {#if uid}
              <a href="/users/{uid}"
                >{#if line.trim() === `@${uid}`}profil{:else}@{uid}{/if}</a
              >
            {/if}
            {#if status === State.Errored}
              <br />
              <div class="message">
                {#if !uid}Utilisateur·ice introuvable{:else}{message}{/if}
              </div>
            {/if}
          </p>
        </li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .content {
    max-width: 1000px;
    padding: 0 1rem;
    margin: 0 auto;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .results ul {
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
  }

  .results li {
    display: flex;
    column-gap: 0.25rem;
    align-items: center;
  }

  .results li .status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0.25rem;
    margin-right: 0.5rem;
    color: var(--text);
    background: var(--bg);
    border-radius: 50%;
  }

  .results li .status.loading {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .results li .message {
    margin-top: -0.25rem;
    font-size: 0.75rem;
    color: var(--link);
  }
</style>
