import { load_PageShopItemEdit } from '$houdini';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
  const { data, errors } = await load_PageShopItemEdit({ event, variables: event.params }).then(
    (stores) => get(stores.PageShopItemEdit),
  );
  if (!data) error(500, { message: JSON.stringify(errors) });
  if (!data.group) error(404, { message: 'Boutique introuvable' });
  if (!data.group.shopItem) error(404, { message: 'Article indisponible' });
  return data as typeof data & {
    group: NonNullable<(typeof data)['group']> & {
      shopItem: NonNullable<(typeof data)['group']['shopItem']>;
    };
  };
}
