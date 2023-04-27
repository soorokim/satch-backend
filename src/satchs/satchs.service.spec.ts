import { Test, TestingModule } from '@nestjs/testing';
import { SatchsService } from './satchs.service';

describe('SatchsService', () => {
  let service: SatchsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SatchsService],
    }).compile();

    service = module.get<SatchsService>(SatchsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
