<script lang="ts">
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import { format, parse } from 'date-fns';
  import type { PageData } from './$types';
  import fr from 'date-fns/locale/fr/index.js';
  import ButtonBack from '$lib/components/ButtonBack.svelte';

  export let data: PageData;

  const groupedByBirthday: Record<string, Array<(typeof data)['birthdays'][number]>> = {};

  $: {
    for (const user of data.birthdays) {
      if (!user.birthday) continue;
      let key = format(user.birthday, 'd MMMM', { locale: fr });
      if (key === format(new Date(), 'd MMMM', { locale: fr })) key = "Aujourd'hui";

      if (key in groupedByBirthday) groupedByBirthday[key].push(user);
      else groupedByBirthday[key] = [user];
    }
  }

  const parseBackDisplayedDate = (date: string) => {
    if (date === "Aujourd'hui") return new Date();
    return parse(date, 'd MMMM', new Date(), { locale: fr });
  };

  const sortWithDisplayDate = (a: string, b: string) =>
    parseBackDisplayedDate(b).valueOf() - parseBackDisplayedDate(a).valueOf();
</script>

<div class="content">
  <h1><ButtonBack /> Anniversaires</h1>

  <ul class="nobullet birthdays">
    {#each Object.entries(groupedByBirthday)
      .sort(([a, _], [b, _2]) => sortWithDisplayDate(a, b))
      .reverse() as [birthday, users] (birthday)}
      <li class="birthday">
        <h2>{birthday}</h2>
        <ul class="nobullet">
          {#each users.filter(Boolean) as { uid, major, birthday, ...user } (uid)}
            <li>
              <AvatarPerson
                href="/users/{uid}"
                {...user}
                role="{major.shortName} · {new Date().getFullYear() -
                  (birthday?.getFullYear() ?? 0)} ans"
              />
            </li>
          {/each}
        </ul>
      </li>
    {/each}
  </ul>
</div>

<style>
  .content {
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
  }

  .birthdays {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
  }

  h2 {
    text-align: center;
  }

  @media (max-width: 1200px) {
    .birthdays {
      flex-direction: column;
    }

    .birthday ul {
      max-width: 400px;
      margin: 0 auto;
    }
  }
</style>
