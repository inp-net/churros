import { isMonday, parse, previousMonday } from 'date-fns';
import type { AfterLoadEvent, EventsOfWeekVariables } from './$houdini';

function closestMonday(date: Date) {
  if (isMonday(date)) return date;
  return previousMonday(date);
}

function shownWeek(monday: string | undefined | null): Date {
  const result = monday ? parse(monday, 'yyyy-MM-dd', new Date()) : closestMonday(new Date());

  result.setHours(23);
  result.setMinutes(59);

  return result;
}

export const _EventsOfWeekVariables: EventsOfWeekVariables = ({ params }) => {
  return {
    monday: shownWeek(params.monday),
  };
};

export function _houdini_afterLoad({ data, event: { params } }: AfterLoadEvent) {
  return {
    ...data,
    shownWeek: shownWeek(params.monday),
  };
}
