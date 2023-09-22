<script lang="ts">
    import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
    import Breadcrumb from "$lib/components/Breadcrumb.svelte";
    import type { PageData } from "./$types";
export let data: PageData;
</script>
<Breadcrumbs root="/documents">
    <Breadcrumb>{data.major.shortName}</Breadcrumb>
</Breadcrumbs>

<ul>
    <li><a href="./1a">1A</a></li>
    <li><a href="./2a">2A</a></li>
    <li><a href="./3a">3A</a></li>
</ul>
