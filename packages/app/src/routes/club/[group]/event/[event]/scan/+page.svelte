<script lang="ts">
  import Tabs from '$lib/components/navigation/Tabs.svelte';
</script>

<Tabs
  tabs={[
    { name: 'Infos', href: `../edit` },
    { name: 'Réservations', href: '../registrations' },
    { name: 'Vérifier', href: '.' }
  ]}
/>
