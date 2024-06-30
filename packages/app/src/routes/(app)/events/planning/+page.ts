import { formatISO } from 'date-fns';
import type { PageEventsPlanningVariables } from './$houdini';

export const ssr = true;

export const _PageEventsPlanningVariables: PageEventsPlanningVariables = async () => {
  return {
    now: formatISO(new Date(), { representation: 'date' }),
  };
};
