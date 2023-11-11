import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsResolver } from './schools.resolver';

describe('SchoolsResolver', () => {
	let resolver: SchoolsResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [SchoolsResolver],
		}).compile();

		resolver = module.get<SchoolsResolver>(SchoolsResolver);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});
});
