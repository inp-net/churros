import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class School {
	/**
	 * The identifier of the school.
	 */
	@Field(() => ID)
	id: string;

	/**
	 * The unique identifier of the school.
	 */
	uid: string;

	/**
	 * The name of the school.
	 */
	name: string;

	/**
	 * The color of the school.
	 */
	color: string;

	/**
	 * The domain name of the school.
	 */
	internalMailDomain: string;

	/**
	 * The description of the school.
	 */
	description: string;

	/**
	 * The address of the school.
	 */
	address: string;

	// marjos
	// majorsLdapSchool
	// studentAssociations
	// accessibleTickets
	// contributionOptions
	// services
}
