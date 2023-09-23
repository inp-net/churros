<script lang="ts">
    import { formatRelative } from 'date-fns';
    import fr from 'date-fns/locale/fr/index.js';

    type Minor = {
        uid: string;
        name: string;
        shortName: string;
    }
    export let href: string
    export let documentsCount: number;
    export let name: string
    export let shortName: string
    export let majors: Array<{uid: string; name: string}>
    export let minors: Minor[]
  export let nextExamAt: Date | undefined=undefined;
</script>

    <a {href}>
<article class="document">
        <header>
            <h3>{shortName||name}</h3>
        </header>
        <p class="infos">
{#if nextExamAt}
                <span class="exam-date">Partiel {formatRelative(nextExamAt, new Date(), {
                    locale: fr,
                    weekStartsOn: 1,
                })}</span> · 
{/if}
<span class="documents-count">{#if documentsCount}{documentsCount} document{documentsCount > 1 ? 's' :''}{:else}Aucun document{/if}</span> · <span class="majors-and-minors">
    {[...minors, ...majors].map(m => m.name).join(', ')}
</span>
        </p>
</article>
    </a>
<style lang="scss">
    article {
        padding: 0.5em 1em;
        border: var(--border-block) solid var(--muted-border);
        border-radius: 0.5em;
    }

    a:hover, a:focus-visible {
        article {
            background-color: var(--hover-bg);
            border-color: var(--border);
        }
    }

    .infos {
        display: flex;
        flex-wrap: wrap;
        column-gap: 0.5em;
        align-items: center;
    }

</style>
