<script lang="ts">
  import { onMount } from 'svelte';
  import InputSearchObject from './InputSearchObject.svelte';
  import { zeus } from '$lib/zeus';
  import Fuse from 'fuse.js';
  import InputField from './InputField.svelte';

  type Subject = {
    uid?: string;
    name: string;
    shortName: string;
    yearTier: number;
    minors: Array<{ name: string; uid: string }>;
    majors: Array<{ name: string; uid: string }>;
  };
  export let object: Subject | undefined;
  export let uid: string | undefined;

  export let label: string;
  export let clearable = false;

  export let restrainToYearTier: number | undefined = undefined;
  export let restrainToMajorUid: string | undefined = undefined;

  let subjects: Subject[] = [];
  onMount(async () => {
    ({ subjects } = await $zeus.query({
      subjects: {
        uid: true,
        name: true,
        shortName: true,
        yearTier: true,
        majors: {
          uid: true,
          name: true,
          shortName: true,
        },
        minors: {
          name: true,
          shortName: true,
          yearTier: true,
        },
      },
    }));
  });
</script>

<InputField {label}>
  <InputSearchObject
    {clearable}
    search={(q) =>
      new Fuse(
        subjects
          .filter((s) => {
            if (restrainToYearTier) 
              return s.yearTier === restrainToYearTier;
            
            if (restrainToMajorUid) 
              return s.majors.some((m) => m.uid === restrainToMajorUid);
            
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
      >{item.shortName || item.name} · {item.yearTier}A {item.majors
        .map((s) => s.shortName)
        .join(', ')}
      {#if item.minors.length > 0}({item.minors.map((s) => s.shortName).join(', ')}){/if}</span
    >
  </InputSearchObject>
</InputField>
