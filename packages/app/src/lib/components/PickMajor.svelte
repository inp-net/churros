<script lang="ts">
  import { graphql, type PickMajor$data } from '$houdini';
  import Avatar from '$lib/components/Avatar.svelte';
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import { loaded, loading, LoadingText, mapLoading, type MaybeLoading } from '$lib/loading';
  import { tooltip } from '$lib/tooltip';
  import { createEventDispatcher } from 'svelte';
  import PickThings from './PickThings.svelte';

  const dispatch = createEventDispatcher<{ pick: string; finish: Value }>();

  export let multiple = false;
  // eslint-disable-next-line no-undef
  type Value = $$Generic<multiple extends true ? string[] : string | null>;
  export let title = 'Filières';

  /** Intitial value only (no 2-way binding, listen to on:finish instead)*/
  export let value: MaybeLoading<Value>;

  export let options: Array<PickMajor$data>;
  graphql(`
    fragment PickMajor on Major @loading {
      uid
      id
      shortName
      name
      pictureURL
      schools {
        uid
        pictureURL
        name
      }
    }
  `);

  // Sort majors by school, and ensure each major that is in multiple schools appears once per school. Return an array of PickMajor$data
  function groupedBySchool(options: Array<PickMajor$data>): Array<PickMajor$data> {
    const majorsBySchool = [] as Array<PickMajor$data>;
    const allSchoolsUids = new Set(
      options.flatMap((major) => major.schools.map((school) => school.uid)).filter(loaded),
    );

    for (const schoolUid of allSchoolsUids) {
      for (const major of options) 
        if (major.schools.some((school) => school.uid === schoolUid)) majorsBySchool.push(major);
      
    }
    return majorsBySchool;
  }
</script>

<PickThings
  options={groupedBySchool(options)}
  category={(option) => ({
    id: loading(option.schools[0].uid, ''),
    label: loading(option.schools[0].name, ''),
  })}
  {value}
  {multiple}
  {title}
  on:finish={(e) => dispatch('finish', e.detail)}
  on:pick={(e) => dispatch('pick', e.detail)}
  let:open
>
  <svelte:fragment slot="category" let:category let:firstOption>
    {@const school = firstOption.schools.find((s) => s.uid === category.id)}
    <AvatarSchool {school} />
    {category.label}
  </svelte:fragment>
  <div
    slot="option"
    let:selected
    let:option
    class="option"
    class:selected
    use:tooltip={loading(option.name, 'Chargement…')}
  >
    <Avatar
      href=""
      selectable
      {selected}
      src={loading(option.pictureURL, '')}
      alt={mapLoading(option.name, (n) => `Logo de ${n}`)}
      help=""
    />
    <LoadingText value={option.shortName} />
  </div>

  <slot {open}></slot>
</PickThings>

<style>
  .option.selected {
    color: var(--primary);
  }

  .option {
    --avatar-size: 5rem;
    --avatar-radius: var(--radius-block);

    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
  }
</style>
