export const FILTERS = ['unpaid', 'paid', 'verified'] as const;

export const tabToFilter = new Map([
  ['paid', 'Paid'],
  ['unpaid', 'Unpaid'],
  ['verified', 'Verified'],
]) as Map<string, 'Paid' | 'Unpaid' | 'Verified'>;
