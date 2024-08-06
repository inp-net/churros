import { builder, splitID } from '#lib';
import { EventType } from '#modules/events';
import { ArticleType } from '#modules/posts';
import { TicketType } from '#modules/ticketing';

export const HasLinks = builder.unionType('HasLinks', {
  types: [EventType, ArticleType, TicketType],
  resolveType({ id }) {
    switch (splitID(id)[0]) {
      case 'Event': {
        return EventType;
      }
      case 'Article': {
        return ArticleType;
      }
      case 'Ticket': {
        return TicketType;
      }
      default: {
        throw new Error(
          `Invalid ID: ${id} is of resoure ${splitID(id)[0]}, which is not part of HasLinks type`,
        );
      }
    }
  },
});
