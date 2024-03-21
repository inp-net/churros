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

export function answerToString({
  answer,
  number,
  question: { scaleEnd, scaleStart, type },
}: {
  answer: string[];
  number: number | null;
  question: { type: QuestionKind; scaleStart: number | null; scaleEnd: number | null };
}): string {
  return type === 'Scale'
    ? `${Math.floor(scaleStart! + number! * (scaleEnd! - scaleStart!))}/${scaleEnd!}`
    : number
      ? number.toString()
      : answer.join(',');
}
