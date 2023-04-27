import { Test, TestingModule } from '@nestjs/testing';
import { SatchsController } from './satchs.controller';
import { SatchsService } from './satchs.service';

describe('SatchsController', () => {
  let controller: SatchsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SatchsController],
      providers: [SatchsService],
    }).compile();

    controller = module.get<SatchsController>(SatchsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
