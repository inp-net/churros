import { nanoid } from 'nanoid';

export function generateThirdPartyToken(): string {
  return `churros_${nanoid()}`;
}
