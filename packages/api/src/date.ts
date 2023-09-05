export const dateFromNumbers = (numbers: number[]) => {
  switch (dateFromNumbers.length) {
    case 0: {
      return;
    }

    case 1: {
      const [year] = numbers as [number];
      return new Date(year, 1, 1);
    }

    case 2: {
      const [year, month] = numbers as [number, number];
      return new Date(year, month - 1);
    }

    default: {
      const [year, month, day] = numbers as [number, number, number, ...number[]];
      return new Date(year, month - 1, day);
    }
  }
};

export function schoolYearStart(): Date {
  const now = new Date();
  const thisYearSeptemberFirst = new Date(now.getFullYear(), 8, 1);
  if (now > thisYearSeptemberFirst) return thisYearSeptemberFirst;

  return new Date(now.getFullYear() - 1, 8, 1);
}

export function yearTier(graduationYear: number): number {
  return schoolYearStart().getFullYear() - graduationYear + 4;
}

export function fromYearTier(tier: number): number {
  return schoolYearStart().getFullYear() - tier + 4;
}
