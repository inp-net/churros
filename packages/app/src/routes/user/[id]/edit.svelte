<script context="module" lang="ts">
  import { session } from '$app/stores'
  import { $ as Zvar, mutate, query, Query, type PropsType } from '$lib/zeus'
  import type { Load } from './__types/edit'

  const propsQuery = (id: string) =>
    Query({
      user: [{ id }, { id: true, firstname: true, lastname: true, nickname: true }],
    })

  type Props = PropsType<typeof propsQuery>

  export const load: Load = async ({ fetch, params, session }) =>
    params.id === session.me?.id || session.me?.canEditUsers
      ? { props: await query(fetch, propsQuery(params.id), session) }
      : { status: 307, redirect: '..' }
</script>

<script lang="ts">
  export let user: Props['user']

  $: ({ id, firstname, lastname, nickname } = user)
  let files: FileList
  let userPicture: string | undefined

  const updateUser = async () => {
    const { updateUser } = await mutate(
      {
        updateUser: [
          { id, nickname },
          { id: true, firstname: true, lastname: true, nickname: true },
        ],
      },
      $session
    )
    user = updateUser
  }

  const updateUserPicture = async () => {
    const { updateUserPicture } = await mutate(
      {
        updateUserPicture: [{ id, file: Zvar('file', 'File!') }, true],
      },
      { token: $session.token, variables: { file: files[0] } }
    )
    userPicture = updateUserPicture
  }
</script>

<h1>Éditer {firstname} {nickname} {lastname}</h1>

{#if userPicture}
  <img src="http://localhost:4000/storage/{userPicture}" alt="{firstname} {lastname}" />
{/if}

<form on:submit|preventDefault={updateUser}>
  <p>
    <label>Surnom : <input type="text" bind:value={nickname} /></label>
  </p>
  <p>
    <button>Sauvegarder</button>
  </p>
</form>

<h2>Photo de profil</h2>

<input type="file" bind:files on:change={updateUserPicture} />
