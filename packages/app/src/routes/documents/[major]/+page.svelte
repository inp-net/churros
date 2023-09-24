<script lang="ts">
    import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
    import Breadcrumb from "$lib/components/Breadcrumb.svelte";
    import type { PageData } from "./$types";
    import CardMajor from "$lib/components/CardMajor.svelte";
export let data: PageData;
</script>
<Breadcrumbs root="/documents">
    <Breadcrumb>{data.major.shortName}</Breadcrumb>
</Breadcrumbs>

<ul class="nobullet">
    <li>
    <CardMajor name="1A" href="./1a"/>
    </li>
    <li>
    <CardMajor name="2A" href="./2a"/>
    </li>
    <li>
    <CardMajor name="3A" href="./3a"/>
    </li>
</ul>

<style>
    ul {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 2rem;
    }
</style>
