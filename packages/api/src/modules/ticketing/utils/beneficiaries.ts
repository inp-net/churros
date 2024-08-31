export function authorIsBeneficiary(
  author: {
    id: string;
    uid: string;
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
  },
  externalBeneficiary: string | null,
  internalBeneficiaryId: string | null,
  authorEmail: string,
) {
  return (
    !externalBeneficiary?.trim() ||
    !internalBeneficiaryId ||
    author.id === internalBeneficiaryId ||
    authorEmail === author.email
  );
}

export function preprocessBeneficiary(beneficiary: string) {
  return beneficiary.replace(/^@/, '').trim().toLowerCase();
}
