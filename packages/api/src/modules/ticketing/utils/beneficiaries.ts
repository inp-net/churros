export function authorIsBeneficiary(
  author: { uid: string; fullName: string; firstName: string; lastName: string; email: string },
  beneficiary: string,
  authorEmail: string,
) {
  return (
    !beneficiary.trim() ||
    author.uid === beneficiary ||
    author.fullName === beneficiary ||
    `${author.firstName} ${author.lastName}` === beneficiary ||
    authorEmail === author.email
  );
}
