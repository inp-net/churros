<script lang="ts">
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import { format } from 'date-fns';
  import type { PageData } from './$types';
  import fr from 'date-fns/locale/fr';
  import ButtonBack from '$lib/components/ButtonBack.svelte';

  export let data: PageData;

  const groupedByBirthday: Record<string, Array<typeof data['birthdays'][number]>> = {};

  $: {
    for (const user of data.birthdays) {
      if (!user.birthday) continue;
      let key = format(user.birthday, 'dd MMMM', { locale: fr });
      if (key === format(new Date(), 'dd MMMM', { locale: fr })) key = "Aujourd'hui";

      if (key in groupedByBirthday) groupedByBirthday[key].push(user);
      else groupedByBirthday[key] = [user];
    }
  }
</script>

<h1><ButtonBack /> Anniversaires</h1>

<ul class="nobullet birthdays">
  {#each Object.entries(groupedByBirthday) as [birthday, users]}
    <li>
      <h2>{birthday}</h2>
      <ul class="nobullet">
        {#each users.filter(Boolean) as { uid, major, birthday, ...user } (uid)}
          <li>
            <AvatarPerson
              href="/user/{uid}"
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

<style>
  h1 {
    margin-bottom: 2rem;
    text-align: center;
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
</style>
