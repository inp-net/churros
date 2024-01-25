<script lang="ts">
    import CardService from '$lib/components/CardService.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    const { services } = data;
</script>

<div class="content">
    <h1> Gérer les services </h1>

    <ul class="nobullet">
        {#each services as service}
            <li>
                <CardService service={{...service, url:`/services/${service?.id}/edit/`}} />
            </li>
        {/each}
    </ul>
</div>
      
<style>
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
    }

    h1 {
        margin-bottom: 2rem;
        text-align: center;
    }

    ul {
        display: flex;
        flex-basis: 100%;
        gap: 1rem;
        justify-content: center;
    }

    li:hover,
    li:focus-visible {
        cursor: pointer;
        }
</style>