import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Ticket, TicketSchema } from '../schemas/ticket.schema';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CommonModule, CommonConfigModule } from '@ticketing/common';
import { DLQMessage, DLQMessageSchema, NatsModule } from '@ticketing/nats';
import { CqrsModule } from '@nestjs/cqrs';
import { TicketUsersService } from './ticket-users.service';
import { TicketUser, TicketUserSchema } from '../schemas/ticket-user.schema';

@Module({
  imports: [
    CqrsModule,
    NatsModule,
    CommonModule,
    MongooseModule.forRootAsync({
      imports: [CommonConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('TICKETS_MONGO_URI')}`,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: TicketUser.name, schema: TicketUserSchema },
      { name: DLQMessage.name, schema: DLQMessageSchema },
    ]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, TicketUsersService],
})
export class TicketsModule {}
