<script lang="ts">
  import { fragment, graphql, type InputMajor, type InputMajorInitialSchool } from '$houdini';
  import AvatarMajor from '$lib/components/AvatarMajor.svelte';
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import PickMajor from '$lib/components/PickMajor.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import IconChevronRight from '~icons/msl/chevron-right';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

  /** Selected major uid */
  export let major: string;

  export let initialSchool: InputMajorInitialSchool | null;
  $: dataInitialSchool = fragment(
    initialSchool,
    graphql(`
      fragment InputMajorInitialSchool on School {
        name
        pictureURL
        ...AvatarSchool
      }
    `),
  );

  export let options: InputMajor | null;
  $: data = fragment(
    options,
    graphql(`
      fragment InputMajor on Query @loading {
        majors {
          uid
          name
          ...AvatarMajor
          ...PickMajor @mask_disable
        }
      }
    `),
  );

  $: selected = $data?.majors.find((m) => m.uid === major) ?? null;
</script>

<div class="input-major">
  {#if $dataInitialSchool}
    <div class="school">
      <AvatarSchool school={$dataInitialSchool} />
      <LoadingText value={$dataInitialSchool.name} />
    </div>
    <IconChevronRight />
  {/if}
  <div class="major">
    {#if selected}
      <AvatarMajor major={selected} />
      <LoadingText value={selected.name} />
    {:else}
      <p class="muted">Filière...</p>
    {/if}
  </div>
  <div class="choose-btn">
    {#if $data}
      <PickMajor
        on:finish={({ detail }) => {
          major = detail;
        }}
        value={major}
        options={$data.majors}
      >
        <ButtonSecondary>
          {#if major}Changer{:else}Choisir{/if}
        </ButtonSecondary>
      </PickMajor>
    {:else}
      <ButtonSecondary disabled>Chargement...</ButtonSecondary>
    {/if}
  </div>
</div>
