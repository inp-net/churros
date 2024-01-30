import { EventFrequency, type Event as EventPrisma } from '@prisma/client';
import {
  addMonths,
  addWeeks,
  differenceInWeeks,
  getMonth,
  getWeek,
  isBefore,
  setDay,
  setMonth,
  setWeek,
  setYear,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
export function findNextRecurringEvent(event: EventPrisma): EventPrisma {
  const today = utcToZonedTime(new Date(), 'Europe/Berlin');
  const { startsAt, endsAt, frequency, recurringUntil } = event;
  let newStartsAt = startsAt;
  switch (frequency) {
    case EventFrequency.Weekly: {
      if (startsAt.getFullYear() !== today.getFullYear())
        newStartsAt = setYear(newStartsAt, today.getFullYear());
      newStartsAt = setWeek(startsAt, getWeek(today, { weekStartsOn: 1 }));
      break;
    }

    case EventFrequency.Biweekly: {
      if (startsAt.getFullYear() !== today.getFullYear())
        newStartsAt = setYear(newStartsAt, today.getFullYear());
      newStartsAt = setWeek(startsAt, getWeek(today, { weekStartsOn: 1 }));
      if (isBefore(newStartsAt, today)) newStartsAt = addWeeks(newStartsAt, 2);
      if (differenceInWeeks(newStartsAt, startsAt) % 2 !== 0)
        newStartsAt = addWeeks(newStartsAt, 1);
      break;
    }

    case EventFrequency.Monthly: {
      if (startsAt.getFullYear() !== today.getFullYear())
        newStartsAt = setYear(newStartsAt, today.getFullYear());
      newStartsAt = setMonth(startsAt, getMonth(today));
      if (isBefore(newStartsAt, today)) newStartsAt = addMonths(newStartsAt, 1);
      break;
    }
  }
  if (recurringUntil !== null && isBefore(newStartsAt, recurringUntil))
    return { ...event, startsAt: newStartsAt, endsAt: setDay(endsAt, newStartsAt.getDay()) };
  return { ...event };
}
