<script lang="ts">
  import { onMount } from 'svelte';
  import InputSearchObject from './InputSearchObject.svelte';
  import { zeus } from '$lib/zeus';
  import Fuse from 'fuse.js';
  import InputField from './InputField.svelte';

type Subject = { uid?: string; name: string; shortName: string; minors: Array<{ name: string }>; majors: Array<{name: string}> };
  export let object: Subject | undefined;
  export let uid: string | undefined;

  export let label: string;
  export let clearable = false;

  let subjects: Subject[] = [];
  onMount(async () => {
    ({ subjects } = await $zeus.query({
      subjects: {
        uid: true,
        name: true,
        shortName: true,
        majors: {
          name: true
        },
        minors: {
          name: true
        }
      },
    }));
  });
</script>

<InputField {label}>
  <InputSearchObject
    {clearable}
    search={(q) =>
      new Fuse(subjects.map(s => ({
        ...s,
      })), {
        keys: ['name', 'uid', 'shortName'],
      })
        .search(q)
        .map((r) => r.item)}
    bind:object
    bind:value={uid}
    valueKey="uid"
    labelKey="name"
    >
<span class="label" slot="item" let:item>{item.shortName || item.name} · {[...item.majors, ...item.minors].map(s => s.name).join(', ')}</span>
</InputSearchObject>
</InputField>
