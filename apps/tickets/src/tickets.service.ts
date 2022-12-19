import { Injectable } from '@nestjs/common';

@Injectable()
export class TicketsService {
  getHello(): string {
    return 'Hello World!';
  }
}
