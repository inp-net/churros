import type { QuestionKind } from '@prisma/client';

export function castAnswer(
  value: string[],
  {
    scaleEnd,
    scaleStart,
    type,
  }: {
    scaleEnd: number | null;
    scaleStart: number | null;
    type: QuestionKind;
  },
): { answer: string[]; number: number | undefined } {
  return {
    answer: value,
    number: value[0]
      ? type === 'Number'
        ? Number.parseFloat(value[0])
        : type === 'Scale'
          ? Number.parseInt(value[0]) / (scaleEnd! - scaleStart!)
          : undefined
      : undefined,
  };
}
