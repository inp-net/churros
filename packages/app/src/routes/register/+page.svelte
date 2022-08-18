<script lang="ts">
  import { goto } from '$app/navigation';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import FormCard from '$lib/components/cards/FormCard.svelte';
  import { mutate, ZeusError } from '$lib/zeus';
  import type { ZodFormattedError } from 'zod';
  import type { PageData } from './$types';

  export let data: PageData;

  $: majorId = data.majors[0].id;
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

  for (const { id, name, schools } of data.majors) {
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

  let loading = false;
  const register = async () => {
    if (loading) return;

    try {
      loading = true;
      await mutate({ register: [args, { id: true }] });
      await goto('/');
    } catch (error: unknown) {
      if (!(error instanceof ZeusError)) throw error;

      for (const { extensions } of error.errors) {
        if (extensions.code === 'ZOD_ERROR')
          formErrors = extensions.errors as ZodFormattedError<typeof args>;
      }
    } finally {
      loading = false;
    }
  };
</script>

<div class="flex justify-center">
  <FormCard on:submit={register}>
    <svelte:fragment slot="header">S'inscrire</svelte:fragment>
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
        (Lettres, -, . et _)
      </label>
    </p>
    <Alert theme="danger" closed={(formErrors?.name?._errors ?? []).length === 0} inline>
      {#each formErrors?.name?._errors ?? [] as error}
        <strong>{error}. </strong>
      {/each}
    </Alert>
    <p>
      <label>
        Prénom&nbsp;:
        <input type="text" bind:value={firstname} minlength="1" maxlength="255" required />
      </label>
    </p>
    <Alert theme="danger" closed={(formErrors?.firstname?._errors ?? []).length === 0} inline>
      {#each formErrors?.firstname?._errors ?? [] as error}
        <strong>{error}. </strong>
      {/each}
    </Alert>
    <p>
      <label>
        Nom de famille&nbsp;:
        <input type="text" bind:value={lastname} minlength="1" maxlength="255" required />
      </label>
    </p>
    <Alert theme="danger" closed={(formErrors?.lastname?._errors ?? []).length === 0} inline>
      {#each formErrors?.lastname?._errors ?? [] as error}
        <strong>{error}. </strong>
      {/each}
    </Alert>
    <p>
      <label>
        Mot de passe&nbsp;:
        <input type="password" bind:value={password} minlength="10" maxlength="255" required />
      </label>
    </p>
    <Alert theme="danger" closed={(formErrors?.password?._errors ?? []).length === 0} inline>
      {#each formErrors?.password?._errors ?? [] as error}
        <strong>{error}. </strong>
      {/each}
    </Alert>
    <svelte:fragment slot="footer">
      <Button type="submit" theme="primary" {loading}>S'inscrire</Button>
    </svelte:fragment>
  </FormCard>
</div>

<style lang="scss">
  input,
  select {
    display: block;
    width: 100%;
  }
</style>
