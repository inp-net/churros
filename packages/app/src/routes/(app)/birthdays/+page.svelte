<script lang="ts">
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { format, parse } from 'date-fns';
  import fr from 'date-fns/locale/fr/index.js';
  import type { PageData } from './$houdini';
  import { notNull } from '$lib/typing';
  import { loaded } from '$lib/loading';

  export let data: PageData;
  $: ({ PageBirthdays } = data);

  function groupedByBirthday(birthdays: NonNullable<(typeof $PageBirthdays)['data']>['birthdays']) {
    const grouped: Record<
      string,
      Array<
        (typeof birthdays)[number] & {
          uid: string;
          birthday: Date | null;
        }
      >
    > = {};
    for (const user of birthdays) {
      if (!user.birthday) continue;
      if (!loaded(user.birthday)) continue;
      if (!loaded(user.uid)) continue;
      let key = format(user.birthday, 'd MMMM', { locale: fr });
      if (key === format(new Date(), 'd MMMM', { locale: fr })) key = "Aujourd'hui";

      if (key in grouped) {
        grouped[key].push({ ...user, birthday: user.birthday, uid: user.uid });
      } else {
        grouped[key] = [
          {
            ...user,
            birthday: user.birthday,
            uid: user.uid,
          },
        ];
      }
    }
    return grouped;
  }

  const parseBackDisplayedDate = (date: string) => {
    if (date === "Aujourd'hui") return new Date();
    return parse(date, 'd MMMM', new Date(), { locale: fr });
  };

  const sortWithDisplayDate = (a: string, b: string) =>
    parseBackDisplayedDate(b).valueOf() - parseBackDisplayedDate(a).valueOf();
</script>

<MaybeError result={$PageBirthdays} let:data={{ birthdays }}>
  <div class="content">
    <ul class="nobullet birthdays">
      {#each Object.entries(groupedByBirthday(birthdays))
        .sort(([a, _], [b, _2]) => sortWithDisplayDate(a, b))
        .reverse() as [birthday, users] (birthday)}
        <li class="birthday">
          <h2 class="typo-field-label">{birthday}</h2>
          <ul class="nobullet">
            {#each users.filter(notNull) as user (user.uid)}
              <li>
                <AvatarUser name {user} />
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  </div>
</MaybeError>

<style>
  .birthdays {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    font-size: 1.2rem;
  }
</style>
