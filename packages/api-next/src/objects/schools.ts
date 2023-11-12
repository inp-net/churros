import { Module } from '@nestjs/common';
import { Args, Field, ID, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { PrismaModule, PrismaService } from '../prisma';

@ObjectType()
export class School {
	@Field(() => ID) id: string;

	/**
	 * A unique but readable identifier. Ideal for use in URLs, for example.
	 */
	uid: string;

	name: string;
	color: string;

	/**
	 * The email domain for student's email adresses. If the student association most proeminent in this school has a separate email domain than the official school's, this is the student association's email domain.
	 */
	internalMailDomain: string;

	/**
	 * Markdown formatting is supported. The rendered HTML is available in descriptionHtml.
	 */
	description: string;

	/**
	 * Postal address of the school.
	 */
	address: string;
}

@Resolver(() => School)
export class SchoolsResolver {
	constructor(private prisma: PrismaService) {}

	@Query(() => School)
	async school(
		@Args('uid', { type: () => String }) uid: string,
	): Promise<School> {
		return this.prisma.school.findFirstOrThrow({
			where: { uid },
			include: {
				studentAssociations: true,
				services: {
					include: {
						group: true,
					},
				},
			},
		});
	}

	@Query(() => [School])
	async schools(): Promise<School[]> {
		return this.prisma.school.findMany({ orderBy: { name: 'asc' } });
	}
}

@Module({
	imports: [PrismaModule],
	providers: [SchoolsResolver],
})
export class SchoolsModule {}
