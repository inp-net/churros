import { builder } from '#lib';
import { EventType } from '#modules/events';
import { DateTimeScalar } from '#modules/global';
import { formatISO } from 'date-fns';

class EventsByDate {
  events: Array<typeof EventType.$inferType>;
  date: Date;

  constructor(events: Array<typeof EventType.$inferType>, date: Date) {
    this.events = events;
    this.date = date;
  }
}

export const EventsByDateType = builder.objectRef<EventsByDate>('EventsByDate').implement({
  fields: (t) => ({
    events: t.expose('events', { type: [EventType] }),
    date: t.expose('date', { type: DateTimeScalar }),
    id: t.string({
      resolve: ({ date }) =>
        formatISO(date, {
          representation: 'date',
        }),
    }),
  }),
});
