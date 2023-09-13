<script lang="ts">
  import { onMount } from 'svelte';
  import InputSearchObject from './InputSearchObject.svelte';
  import { zeus } from '$lib/zeus';
  import Fuse from 'fuse.js';
  import InputField from './InputField.svelte';

  type StudentAsociation = { uid?: string; name: string };
  export let object: StudentAsociation | undefined;
  export let uid: string | undefined;

  export let label: string;
  export let clearable = false;

  let studentAssociations: StudentAsociation[] = [];
  onMount(async () => {
    ({ studentAssociations } = await $zeus.query({
      studentAssociations: {
        uid: true,
        name: true,
      },
    }));
  });
</script>

<InputField {label}>
  <InputSearchObject
    {clearable}
    search={(q) =>
      new Fuse(studentAssociations, {
        keys: ['name', 'uid'],
      })
        .search(q)
        .map((r) => r.item)}
    bind:object
    bind:value={uid}
    valueKey="uid"
    labelKey="name"
  />
</InputField>
