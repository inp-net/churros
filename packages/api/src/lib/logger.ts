import { prisma, publish } from '#lib';
import { inDevelopment } from './env.js';

export async function log(
  area: string,
  action: string,
  message: Record<string, unknown>,
  target?: string | null,
  user?: { uid: string } | null,
) {
  console.info(
    `<${area}> ${action} ${target ? `on ${target}: ` : ''}${JSON.stringify(message, null, inDevelopment() ? 2 : undefined)}`,
  );
  await prisma.logEntry.create({
    data: {
      area,
      action,
      message: JSON.stringify(message),
      target,
      user: user ? { connect: { uid: user.uid } } : undefined,
    },
  });
  if (area === 'oauth' && target) await publish(target, 'updated', message);
}
