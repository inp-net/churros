<script context="module" lang="ts">
  import { goto } from '$app/navigation'
  import { GraphQLError, mutate } from '$lib/zeus'
  import type { Load } from '@sveltejs/kit'
  import type { ZodFormattedError } from 'zod'

  export const load: Load = ({ session }) => (session.me ? { status: 307, redirect: '/' } : {})
</script>

<script lang="ts">
  let name = ''
  let firstname = ''
  let lastname = ''
  let password = ''
  let formErrors: ZodFormattedError<typeof args>

  $: args = { name, firstname, lastname, password }

  const register = async () => {
    try {
      await mutate({ register: [args, { id: true }] })
      await goto('/')
    } catch (error) {
      if (!(error instanceof GraphQLError)) throw error

      const errors = error.response.errors as Array<{
        message: string
        extensions: {
          code: 'VALIDATION_ERROR'
          errors: ZodFormattedError<typeof formErrors, string>
        }
      }>

      for (const error of errors) {
        if (error.extensions.code === 'VALIDATION_ERROR') formErrors = error.extensions.errors
      }
    }
  }
</script>

<form on:submit|preventDefault={register}>
  <p>
    <label>
      Nom d'utilisateur :
      <input
        type="text"
        bind:value={name}
        minlength="3"
        maxlength="20"
        pattern="[a-z][a-z_.-]*"
        required
      />
      (Lettres, -, . et _)
    </label>
    {#each formErrors?.name?._errors ?? [] as error}
      <strong>{error}.</strong>
    {/each}
  </p>
  <p>
    <label>
      Prénom :
      <input type="text" bind:value={firstname} minlength="1" maxlength="255" required />
    </label>
    {#each formErrors?.firstname?._errors ?? [] as error}
      <strong>{error}.</strong>
    {/each}
  </p>
  <p>
    <label>
      Nom de famille :
      <input type="text" bind:value={lastname} minlength="1" maxlength="255" required />
    </label>
    {#each formErrors?.lastname?._errors ?? [] as error}
      <strong>{error}.</strong>
    {/each}
  </p>
  <p>
    <label>
      Mot de passe :
      <input type="password" bind:value={password} minlength="10" maxlength="255" required />
    </label>
    {#each formErrors?.password?._errors ?? [] as error}
      <strong>{error}.</strong>
    {/each}
  </p>
  <p><button type="submit">S'inscrire</button></p>
</form>
