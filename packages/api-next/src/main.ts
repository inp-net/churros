import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { SchoolsModule } from './objects/schools';

@Module({
	imports: [
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: true,
		}),

		SchoolsModule,
	],
})
export class AppModule {}

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(4000);
}
bootstrap();
