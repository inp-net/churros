import { prisma } from '#lib';
import { OAuth2Client } from 'google-auth-library';
import { google, sheets_v4 } from 'googleapis';
import { GraphQLError } from 'graphql';

export async function googleSheetsClient(userId: string): Promise<sheets_v4.Sheets> {
  const googleCredential = await prisma.credential.findFirst({
    where: { userId: userId, type: 'Google' },
  });

  if (!googleCredential)
    throw new GraphQLError('Veuillez lier votre compte Google à Churros avant de continuer');

  const authClient = new OAuth2Client();
  authClient.setCredentials({
    access_token: googleCredential.value,
    expiry_date: googleCredential.expiresAt?.valueOf(),
    refresh_token: googleCredential.refresh,
  });

  // @ts-expect-error googleapi is typed weirdly
  return google.sheets({
    version: 'v4',
    auth: authClient,
  });
}
