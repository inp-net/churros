<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { min, update } from 'lodash';
  import AvatarPerson from './AvatarPerson.svelte';
  import { formatDuration, formatRelative, getTime, intervalToDuration } from 'date-fns';
  import { formatDateTime } from '$lib/dates';
  import { fr } from 'date-fns/locale';
  import { onDestroy, onMount } from 'svelte';

  export let pictureFile: string;
  export let title: string;
  export let descriptionHtml: string;
  export let startsAt: Date;
  export let endsAt: Date;
  export let tickets: Array<{ opensAt?: Date; closesAt?: Date }>;
  export let href: string;
  export let author:
    | {
        uid: string;
        pictureFile: string;
        fullName: string;
        groups: Array<{
          title: string;
          group: {
            name: string;
            uid: string;
          };
        }>;
      }
    | undefined = undefined;
  export let group: {
    name: string;
    uid: string;
    pictureFile: string;
  };

  let firstShotgun = tickets[0].opensAt;

  for (const ticket of tickets) {
    if (ticket.opensAt && (firstShotgun === undefined || ticket.opensAt < firstShotgun))
      firstShotgun = ticket.opensAt;
  }

  let now: Date = new Date();

  let interval: NodeJS.Timer;

  const updateTime = () => {
    now = new Date();
  };

  onMount(() => {
    updateTime(); // Appel initial pour afficher le compte à rebours dès le rendu du composant
    interval = setInterval(updateTime, 1000); // Mettre à jour toutes les secondes
  });

  onDestroy(() => {
    clearInterval(interval); // Nettoyer l'intervalle lorsque le composant est détruit
  });
</script>

<!-- Votre code HTML et CSS ici -->
<section class="event">
  <section
    class="title"
    style="
    color: {pictureFile ? '#fff' : '#000'};
    background-image: {pictureFile
      ? `linear-gradient(rgb(0 0 0 / var(--alpha)), rgb(0 0 0 / var(--alpha))), url('${PUBLIC_STORAGE_URL}${pictureFile}') `
      : undefined}
  "
  >
    <h2>{title}</h2>
  </section>
  <section class="content">
    <section class="desc">
      {@html descriptionHtml}
    </section>
    <section class="schedule">
      <h4>EVÈNEMENT</h4>
      <p>
        {Math.abs(startsAt.getTime() - now.getTime()) > 7 * 24 * 3600 * 1000
          ? formatDateTime(startsAt)
          : formatRelative(startsAt, now, {
              locale: fr,
              weekStartsOn: 1,
            })}
      </p>
    </section>

    <!-- Je vois pas pourquoi il y en aurait pas mais dans la db c'est possible -->
    {#if firstShotgun}
      <section class="shotgun">
        <h4>SHOTGUN</h4>
        <p>
          <!-- Si > 6j : affichage de la date, si inferieur à 6j : affichage en relatif, si inférieur à 15 minutes, affichage du décompte-->
          {firstShotgun.getTime() - now.getTime() > 6 * 24 * 3600 * 1000
            ? formatDateTime(firstShotgun)
            : firstShotgun.getTime() - now.getTime() > 15 * 60 * 1000
            ? formatRelative(firstShotgun, now, {
                locale: fr,
                weekStartsOn: 1,
              }).replace('prochain ', '')
            : 'dans ' +
              formatDuration(
                intervalToDuration({
                  start: now,
                  end: new Date(firstShotgun.getTime()),
                }),
                {
                  locale: fr,
                }
              )}
        </p>
      </section>
    {/if}

    <!-- Pas d'auteur si le bonhomme supprime son compte-->
    {#if author}
      <section class="author">
        <AvatarPerson
          href="/user/{author.uid}"
          role={author.groups.find((g) => g.group.uid === group.uid)?.title ?? ''}
          {...author}
        />
      </section>
    {/if}
  </section>
</section>

<style>
  .event {
    overflow: hidden;
    border-radius: var(--radius-block);
    box-shadow: var(--primary-shadow);

    --alpha: 0.5;
  }

  .title {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5em 0;
    background-position: center;
    background-size: cover;
  }

  .content {
    margin: 1em;
  }
</style>
