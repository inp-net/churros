import { builder, splitID } from '#lib';
import { EventType } from '#modules/events';
import { ArticleType } from '#modules/posts';

// interface _HasLinks {
//   links: Array<typeof LinkType.$inferType>;
// }

// export const HasLinks = builder.interfaceRef<_HasLinks>('HasLinks').implement({
//   fields: (t) => ({
//     links: t.expose('links', { type: [LinkType] }),
//   }),
// });

export const HasLinks = builder.unionType('HasLinks', {
  types: [EventType, ArticleType],
  resolveType({ id }) {
    switch (splitID(id)[0]) {
      case 'Event': {
        return EventType;
      }
      case 'Article': {
        return ArticleType;
      }
      default: {
        throw new Error(
          `Invalid ID: ${id} is of resoure ${splitID(id)[0]}, which is not part of HasLinks type`,
        );
      }
    }
  },
});
