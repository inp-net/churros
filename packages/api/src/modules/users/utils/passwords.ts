import * as argon2 from 'argon2';

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  if (!hash) return false;
  if (!password) return false;
  return argon2.verify(hash, password);
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyMasterKey(password: string): Promise<boolean> {
  if (!process.env.MASTER_PASSWORD_HASH) return false;
  return verifyPassword(process.env.MASTER_PASSWORD_HASH, password);
}
