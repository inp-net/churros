import { addDays, formatISO, parseISO, startOfWeek } from 'date-fns';
import type { PageEventsListVariables } from './$houdini';

export function _weekArg(current: Date, daysOffset: number): string {
  return formatISO(
    addDays(
      startOfWeek(current, {
        weekStartsOn: 1,
      }),
      daysOffset,
    ),
    { representation: 'date' },
  );
}

export const _PageEventsListVariables: PageEventsListVariables = async ({ params }) => {
  const week = params.week ? parseISO(params.week) : null;
  if (!week) {
    return {
      after: formatISO(new Date(), { representation: 'date' }),
    };
  }

  return { after: _weekArg(week, 0) };
};
