<script lang="ts">
  import { goto, pushState } from '$app/navigation';
  import { graphql } from '$houdini';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import AvatarStudentAssociation from '$lib/components/AvatarStudentAssociation.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import PickStudentAssociation from '$lib/components/PickStudentAssociation.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { LoadingText, loading } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import IconHidden from '~icons/msl/visibility-off-outline';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import IconAdd from '~icons/msl/add';
  import type { PageData } from './$houdini';
  import { tooltip } from '$lib/tooltip';

  export let data: PageData;
  $: ({ PageServicesManage } = data);

  const CreateService = graphql(`
    mutation CreateService($studentAssociationUID: UID!) {
      upsertServiceV2(input: { studentAssociation: $studentAssociationUID }) {
        ...MutationErrors
        ... on MutationUpsertServiceV2Success {
          data {
            localID
          }
        }
      }
    }
  `);
</script>

<MaybeError result={$PageServicesManage} let:data={{ services, studentAssociations }}>
  <PickStudentAssociation
    value={null}
    title="AE responsable du service"
    options={studentAssociations.filter(({ canCreateServices }) => canCreateServices)}
    on:finish={async ({ detail }) => {
      const result = await mutate(CreateService, {
        studentAssociationUID: detail,
      });
      if (toasts.mutation(result, 'upsertServiceV2', '', 'Impossible de créer un service'))
        await goto(refroute('/services/[id]/edit', result.data.upsertServiceV2.data.localID));
    }}
    statebound="NAVTOP_CREATING_SERVICE"
  ></PickStudentAssociation>

  <div class="contents">
    <Submenu>
      <SubmenuItem
        icon={IconAdd}
        clickable
        on:click={() => {
          pushState('', {
            NAVTOP_CREATING_SERVICE: true,
          });
        }}>Nouveau service</SubmenuItem
      >
      {#each services as service}
        <SubmenuItem icon={null} href={route('/services/[id]/edit', loading(service.localID, ''))}>
          <img
            src={loading(service.logoSourceType === 'ExternalLink' ? service.logo : '', '')}
            alt=""
            class="service-icon"
            slot="icon"
          />
          <span class="name">
            {#if loading(service.hidden, false)}
              <span class="hidden-icon" use:tooltip={'Caché de la liste des services'}>
                <IconHidden />
              </span>
            {/if}
            <LoadingText value={service.name} />
          </span>
          <span slot="subtext">
            {#if service.owner.__typename === 'Group'}
              <AvatarGroup
                href={route('/services/[id]/edit', loading(service.localID, ''))}
                name
                group={service.owner}
              />
            {:else if service.owner.__typename === 'StudentAssociation'}
              <AvatarStudentAssociation
                href={route('/services/[id]/edit', loading(service.localID, ''))}
                name
                studentAssociation={service.owner}
              />
            {:else if service.owner.__typename === 'School'}
              <AvatarSchool
                href={route('/services/[id]/edit', loading(service.localID, ''))}
                name
                school={service.owner}
              />
            {/if}
          </span>
        </SubmenuItem>
      {/each}
      <SubmenuItem
        icon={IconAdd}
        clickable
        on:click={() => {
          pushState('', {
            NAVTOP_CREATING_SERVICE: true,
          });
        }}>Nouveau service</SubmenuItem
      >
    </Submenu>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .service-icon {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: var(--radius-block);
  }
</style>
