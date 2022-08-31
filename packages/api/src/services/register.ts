import { nanoid } from 'nanoid';
import { createTransport } from 'nodemailer';
import { prisma } from '../prisma.js';

const transporter = createTransport(process.env.SMTP_URL);

export const register = async (email: string) => {
  const { token } = await prisma.userCandidate.upsert({
    where: { email },
    create: { email, token: nanoid() },
    update: {},
  });

  const url = new URL('/register/continue', process.env.FRONTEND_URL);
  url.searchParams.append('token', token);

  const info = await transporter.sendMail({
    to: email,
    from: process.env.SUPPORT_EMAIL,
    html: `
<p>
  <a href="${url.toString()}">Finaliser mon inscription</a>
</p>
`,
    text: `Finaliser mon inscription sur ${url.toString()}`,
  });
  console.log(info);
};
