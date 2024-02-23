import { prisma } from '#lib';
import { CredentialType } from '@prisma/client';
import { api } from './express.js';

// Poor man's GDPR data download
console.info(`Serving GDPR data requests on /dump`);
api.use('/dump', async (req, res) => {
  const token = String(req.query['token']);
  try {
    const credential = await prisma.credential.findFirstOrThrow({
      where: { type: CredentialType.Token, value: token },
      include: {
        user: {
          include: { groups: true, articles: true, links: true },
        },
      },
    });
    res.json({ _: `Downloaded on ${new Date().toISOString()}`, ...credential.user });
  } catch {
    res
      .status(401)
      .send('<h1>401 Unauthorized</h1><p>Usage: <code>/dump?token=[session token]</code></p>');
  }
});
