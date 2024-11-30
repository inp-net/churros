<script lang="ts">
  import { fragment, graphql, type InputMajor, type InputMajorInitialSchool } from '$houdini';
  import AvatarMajor from '$lib/components/AvatarMajor.svelte';
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import PickMajor from '$lib/components/PickMajor.svelte';
  import { loading, type MaybeLoading } from '$lib/loading';
  import { createEventDispatcher } from 'svelte';
  import IconChevronRight from '~icons/msl/chevron-right';

  const dispatch = createEventDispatcher<{ open: undefined }>();

  /** Selected major uid */
  export let major: string;

  /** Allow clearing selection */
  export let clearable = false;

  /** Text on the clear button */
  export let clearLabel: MaybeLoading<string> = 'Effacer';

  export let initialSchool: InputMajorInitialSchool | null;
  $: dataInitialSchool = fragment(
    initialSchool,
    graphql(`
      fragment InputMajorInitialSchool on School {
        uid
        name
        pictureURL
        ...AvatarSchool
        majors {
          uid
        }
      }
    `),
  );

  // Preselect major if there's only one
  $: if (
    !major &&
    loading($dataInitialSchool?.majors?.at(0)?.uid, null) &&
    $dataInitialSchool?.majors.length === 1
  )
    major = $dataInitialSchool!.majors.at(0)!.uid;

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

<div class="input-major" class:has-school={$dataInitialSchool}>
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
      <p class="muted">
        {#if clearable}
          Sans filière (externe)
        {:else}
          Filière...
        {/if}
      </p>
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
        favorSchool={$dataInitialSchool?.uid ?? null}
        let:open
      >
        {#if clearable && major}
          <slot name="clear-button">
            <ButtonSecondary
              on:click={() => {
                dispatch('open');
                major = '';
              }}
            >
              <LoadingText value={clearLabel} />
            </ButtonSecondary>
          </slot>
        {/if}
        <ButtonSecondary
          on:click={() => {
            open?.();
            dispatch('open');
          }}
        >
          {#if major || clearable}Changer{:else}Choisir{/if}
        </ButtonSecondary>
      </PickMajor>
    {:else}
      <ButtonSecondary disabled>Chargement...</ButtonSecondary>
    {/if}
  </div>
</div>

<style>
  .input-major,
  .school,
  .major {
    display: flex;
    gap: 1rem 0.5rem;
    align-items: center;
  }

  .has-school .school,
  .has-school .major {
    max-width: 40%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .choose-btn {
    margin-left: auto;
  }
</style>
