import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

describe('TicketsController', () => {
  let ticketsController: TicketsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [TicketsService],
    }).compile();

    ticketsController = app.get<TicketsController>(TicketsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(ticketsController.getHello()).toBe('Hello World!');
    });
  });
});
