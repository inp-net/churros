<script context="module" lang="ts">
  import { goto } from '$app/navigation'
  import { GraphQLError, mutate, Query, query, type PropsType } from '$lib/zeus'
  import type { Load } from './__types/register'
  import type { ZodFormattedError } from 'zod'

  const propsQuery = () => Query({ majors: { id: true, name: true, schools: { name: true } } })

  type Props = PropsType<typeof propsQuery>

  export const load: Load = async ({ fetch, session }) =>
    session.me ? { status: 307, redirect: '/' } : { props: await query(fetch, propsQuery()) }
</script>

<script lang="ts">
  export let majors: Props['majors']

  let majorId = majors[0].id
  let name = ''
  let firstname = ''
  let lastname = ''
  let password = ''
  let formErrors: ZodFormattedError<typeof args> | undefined

  $: args = { majorId, name, firstname, lastname, password }

  const register = async () => {
    try {
      await mutate({ register: [args, { id: true }] })
      await goto('/')
    } catch (error: unknown) {
      if (!(error instanceof GraphQLError)) throw error

      const errors = error.response.errors as Array<{
        message: string
        extensions: {
          code: 'VALIDATION_ERROR'
          errors: ZodFormattedError<typeof formErrors>
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
      Filière :
      <select bind:value={majorId}>
        {#each majors as { id, name, schools }}
          <option value={id}>{name} ({schools.map(({ name }) => name).join(', ')})</option>
        {/each}
      </select>
    </label>
  </p>
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
