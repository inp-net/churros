import path from 'node:path';

export function formAnswerFilePath(
  root: string,
  form: { id: string },
  question: { id: string },
  answer: { id: string },
  extension: string,
) {
  return path.join(root, 'forms', form.id, question.id, `${answer.id}.${extension}`);
}
