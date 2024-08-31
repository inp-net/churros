<script lang="ts">
  import { graphql } from '$houdini';
  import Fuse from 'fuse.js';
  import { onMount } from 'svelte';
  import InputField from './InputField.svelte';
  import InputSearchObject from './InputSearchObject.svelte';

  type Subject = {
    uid?: string;
    name: string;
    shortName: string;
    yearTier: number | null;
    forApprentices?: boolean;
    minors: Array<{ name: string; uid: string; shortName: string }>;
    majors: Array<{ name: string; uid: string; shortName: string }>;
  };
  export let object: Subject | null;
  export let uid: string | undefined;

  export let label: string;
  export let clearable = false;

  export let restrainToYearTier: number | undefined = undefined;
  export let restrainToMajorUid: string | undefined = undefined;

  let subjects: Subject[] = [];
  onMount(async () => {
    ({ subjects } = await graphql(`
      query InputSubject_Subjects {
        subjects {
          uid
          name
          shortName
          yearTier
          forApprentices
          majors {
            uid
            name
            shortName
          }
          minors {
            uid
            name
            shortName
            yearTier
          }
        }
      }
    `)
      .fetch()
      .then((d) => d.data ?? { subjects: [] }));
  });
</script>

<InputField {label}>
  <InputSearchObject
    {clearable}
    search={(q) =>
      new Fuse(
        subjects
          .filter((s) => {
            if (restrainToYearTier) return s.yearTier === restrainToYearTier;

            if (restrainToMajorUid) return s.majors.some((m) => m.uid === restrainToMajorUid);

            return true;
          })
          .map((s) => ({
            ...s,
          })),
        {
          keys: [
            'name',
            'uid',
            'shortName',
            'majors.name',
            'minors.name',
            'majors.shortName',
            'minors.shortName',
          ],
        },
      )
        .search(q)
        .map((r) => r.item)}
    bind:object
    bind:value={uid}
    valueKey="uid"
    labelKey="name"
  >
    <span class="label" slot="item" let:item
      >{item.shortName || item.name} · {item.yearTier}A {item.forApprentices
        ? 'FISA '
        : ''}{item.majors.map((s) => s.shortName).join(', ')}
      {#if item.minors.length > 0}({item.minors.map((s) => s.shortName).join(', ')}){/if}</span
    >
  </InputSearchObject>
</InputField>
