<script context="module" lang="ts">
  import { goto } from '$app/navigation';
  import { ZeusError, mutate, Query, query, type PropsType } from '$lib/zeus';
  import type { Load } from './__types/register';
  import type { ZodFormattedError } from 'zod';

  const propsQuery = () =>
    Query({
      majors: {
        id: true,
        name: true,
        schools: { id: true, name: true },
      },
    });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, session }) =>
    session.me ? { status: 307, redirect: '/' } : { props: await query(fetch, propsQuery()) };
</script>

<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';

  export let majors: Props['majors'];

  let majorId = majors[0].id;
  let name = '';
  let firstname = '';
  let lastname = '';
  let password = '';
  let formErrors: ZodFormattedError<typeof args> | undefined;

  /** Groups majors by school or tuple of schools. */
  const majorGroups = new Map<
    string,
    { schoolsNames: string[]; majors: Array<{ id: string; name: string }> }
  >();

  for (const { id, name, schools } of majors) {
    const key = schools
      .map(({ id }) => id)
      .sort()
      .join(',');

    if (!majorGroups.has(key)) {
      const schoolsNames = schools.map(({ name }) => name).sort();
      majorGroups.set(key, { schoolsNames, majors: [] });
    }

    majorGroups.get(key)!.majors.push({ id, name });
  }

  $: args = { majorId, name, firstname, lastname, password };

  const register = async () => {
    try {
      await mutate({ register: [args, { id: true }] });
      await goto('/');
    } catch (error: unknown) {
      if (!(error instanceof ZeusError)) throw error;

      for (const { extensions } of error.errors) {
        if (extensions.code === 'ZOD_ERROR')
          formErrors = extensions.errors as ZodFormattedError<typeof args>;
      }
    }
  };
</script>

<div class="flex justify-center">
  <form class="max-w-[24rem]" on:submit|preventDefault={register}>
    <Card>
      <h1 slot="header" class="text-center">S'inscrire</h1>
      <p>
        <label>
          Filière&nbsp;:
          <select bind:value={majorId}>
            {#each [...majorGroups.values()] as { majors, schoolsNames }}
              <optgroup label={schoolsNames.join(', ')}>
                {#each majors as { id, name }}
                  <option value={id}>{name}</option>
                {/each}
              </optgroup>
            {/each}
          </select>
        </label>
      </p>
      <p>
        <label>
          Adresse e-mail&nbsp;:
          <input
            type="text"
            bind:value={name}
            minlength="3"
            maxlength="20"
            pattern="[a-z][a-z_.-]*"
            required
          />
          (Lettres, -, . et _, e-mail bientôt)
        </label>
      </p>
      <Alert theme="danger" closed={(formErrors?.name?._errors ?? []).length === 0}>
        <p>
          {#each formErrors?.name?._errors ?? [] as error}
            <strong>{error}. </strong>
          {/each}
        </p>
      </Alert>
      <p>
        <label>
          Prénom&nbsp;:
          <input type="text" bind:value={firstname} minlength="1" maxlength="255" required />
        </label>
      </p>
      <Alert theme="danger" closed={(formErrors?.firstname?._errors ?? []).length === 0}>
        <p>
          {#each formErrors?.firstname?._errors ?? [] as error}
            <strong>{error}. </strong>
          {/each}
        </p>
      </Alert>
      <p>
        <label>
          Nom de famille&nbsp;:
          <input type="text" bind:value={lastname} minlength="1" maxlength="255" required />
        </label>
      </p>
      <Alert theme="danger" closed={(formErrors?.lastname?._errors ?? []).length === 0}>
        <p>
          {#each formErrors?.lastname?._errors ?? [] as error}
            <strong>{error}. </strong>
          {/each}
        </p>
      </Alert>
      <p>
        <label>
          Mot de passe&nbsp;:
          <input type="password" bind:value={password} minlength="10" maxlength="255" required />
        </label>
      </p>
      <Alert theme="danger" closed={(formErrors?.password?._errors ?? []).length === 0}>
        <p>
          {#each formErrors?.password?._errors ?? [] as error}
            <strong>{error}. </strong>
          {/each}
        </p>
      </Alert>
      <p class="text-center">
        <Button type="submit" theme="primary">S'inscrire</Button>
      </p>
    </Card>
  </form>
</div>

<style lang="scss">
  form {
    width: 24rem;
    max-width: 100%;
    padding: 0 1rem;
  }

  h1 {
    padding: 1rem;
    margin-top: 0;
    overflow: hidden;
    background-color: #eee;
    box-shadow: 0 0 0.25rem #0006;
  }

  input,
  select {
    display: block;
    width: 20rem;
  }
</style>
