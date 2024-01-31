import { EventFrequency, type Event as EventPrisma } from '@prisma/client';
import {
  addDays,
  differenceInDays,
  differenceInWeeks,
  endOfWeek,
  getDay,
  getMonth,
  getYear,
  isBefore,
  setDay,
  setMonth,
  setYear,
  weeksToDays,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export function findNextRecurringEvent(event: EventPrisma): EventPrisma {
  const today = utcToZonedTime(new Date(), 'Europe/Berlin');
  const { startsAt, endsAt, frequency } = event;
  let newStartsAt = startsAt;
  switch (frequency) {
    case EventFrequency.Weekly: {
      const todayWeek = setDay(today, getDay(startsAt), { weekStartsOn: 1 });
      const dayDelta = differenceInDays(todayWeek, startsAt);
      newStartsAt = addDays(startsAt, dayDelta);
      const correctedDelta = isBefore(today, newStartsAt) ? dayDelta : dayDelta + 7;
      return {
        ...event,
        startsAt: addDays(startsAt, correctedDelta),
        endsAt: addDays(endsAt, correctedDelta),
      };
    }

    case EventFrequency.Biweekly: {
      // move event from its original startsAt to today's week.
      const todayWeek = setDay(today, getDay(startsAt), { weekStartsOn: 1 });
      const weekDelta = differenceInWeeks(todayWeek, startsAt);
      const tempStartsAt = addDays(startsAt, weeksToDays(weekDelta));
      const correctedDelta = isBefore(today, tempStartsAt) ? weekDelta : weekDelta + 2;
      const newStartsAt = addDays(startsAt, weeksToDays(correctedDelta));
      const newEndsAt = addDays(endsAt, weeksToDays(correctedDelta));
      return { ...event, startsAt: newStartsAt, endsAt: newEndsAt };
    }

    case EventFrequency.Monthly: {
      const monthCorrect =
        getMonth(today) === getMonth(endOfWeek(today, { weekStartsOn: 1 })) ? 0 : 1;
      const yearCorrect = getYear(today) === getYear(endOfWeek(today, { weekStartsOn: 1 })) ? 0 : 1;

      const tempStartsAt = setMonth(startsAt, getMonth(today) + monthCorrect);
      const correctedDelta = isBefore(today, tempStartsAt) ? monthCorrect : monthCorrect + 1;
      const newStartsAt = setMonth(startsAt, getMonth(today) + correctedDelta);
      const newEndsAt = setMonth(endsAt, getMonth(today) + correctedDelta);
      return {
        ...event,
        startsAt: setYear(newStartsAt, getYear(today) + yearCorrect),
        endsAt: setYear(newEndsAt, getYear(today) + yearCorrect),
      };
    }

    default: {
      return event;
    }
  }
}
