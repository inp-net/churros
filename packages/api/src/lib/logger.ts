import { prisma } from '#lib';

export async function log(
  area: string,
  action: string,
  message: Record<string, unknown>,
  target?: string | null,
  user?: { uid: string },
) {
  // eslint-disable-next-line no-console
  console.log(`<${area}> ${action} ${target ? `on ${target}: ` : ''}${JSON.stringify(message)}`);
  await prisma.logEntry.create({
    data: {
      area,
      action,
      message: JSON.stringify(message),
      target,
      user: user ? { connect: { uid: user.uid } } : undefined,
    },
  });
}
