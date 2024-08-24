import type { User } from '@churros/db/prisma';
import type { Context } from './context.js';

export interface AuthScopes {
  loggedIn: boolean;
  student: boolean;
  admin: boolean;
  canAccessDocuments: boolean;
  studentAssociationAdmin: boolean;
}

export interface AuthContexts {
  loggedIn: Context & { user: User };
  student: Context & { user: User };
}

export const authScopes = ({ user }: Context) => ({
  loggedIn: Boolean(user),
  student: Boolean(user?.majorId),
  admin: Boolean(user?.admin),
  studentAssociationAdmin: Boolean(user?.adminOfStudentAssociations.length),
  canAccessDocuments: Boolean(user?.admin || user?.canAccessDocuments),
});

// TODO
// export function permissionField<Resolver>(d: {
//   description: string,
//   resolve: Resolver,

// }) {
//   return {
//     type: 'Boolean',
//     description: d.description,
//       args: {
//         assert: t.arg.string({
//           required: false,
//           description: "Lève une erreur avec le message donné si la permission n'est pas accordée",
//         }),
//       },

//     }
// }
