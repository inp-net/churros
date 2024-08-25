<script lang="ts">
  import type { AreaContribute_StudentAssociation, AreaContribute_User } from '$houdini';
  import AreaContribute from '$lib/components/AreaContribute.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';

  export let open: () => void = () => {};

  export let me: AreaContribute_User | null;
  export let studentAssociation: AreaContribute_StudentAssociation | null;
</script>

<ModalOrDrawer bind:open>
  <header slot="header">Cotiser</header>
  <div class="content">
    <AreaContribute user={me} {studentAssociation} />
  </div>
</ModalOrDrawer>

{#if $$slots.default}
  <slot {open} />
{/if}
