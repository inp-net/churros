<script lang="ts">
  import { onMount } from 'svelte';
  import InputSearchObject from './InputSearchObject.svelte';
  import { zeus } from '$lib/zeus';
  import Fuse from 'fuse.js';
  import InputField from './InputField.svelte';

  type School = { uid: string; name: string; color: string };
  export let object: School | undefined;
  export let uid: string | undefined;

  export let label: string;
  export let clearable = false;

  let schools: School[] = [];
  onMount(async () => {
    ({ schools } = await $zeus.query({
      schools: {
        uid: true,
        name: true,
        color: true,
      },
    }));
  });
</script>

<InputField {label}>
  <InputSearchObject
    {clearable}
    search={(q) =>
      new Fuse(schools, {
        keys: ['name', 'color', 'uid'],
      })
        .search(q)
        .map((r) => r.item)}
    bind:object
    bind:value={uid}
    valueKey="uid"
    labelKey="name"
  />
</InputField>
