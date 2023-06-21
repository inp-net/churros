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
