import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DLQMessage, DLQMessageDocument, DLQOrigin, UserCreatedEvent } from '@ticketing/nats';
import { Model, Types } from 'mongoose';
import { TicketUser, TicketUserDocument } from '../schemas/ticket-user.schema';

@Injectable()
export class TicketUsersService {
  private readonly logger = new Logger(TicketUsersService.name)
  public constructor(
    @InjectModel(TicketUser.name) private readonly ticketUserModel: Model<TicketUserDocument>,
    @InjectModel(DLQMessage.name) private readonly dlqMessageModel: Model<DLQMessageDocument>
  ) {}

  public async handleUserCreated(createdUser: UserCreatedEvent): Promise<void> {
    try {
      await this.ticketUserModel.create({
        user_id: createdUser._id,
        username: createdUser.username,
        email: createdUser.email
      });
      this.logger.log('(handleUserCreated) - ticket user created');
    } catch (error) {
      this.logger.log('(handleUserCreated) - ticket user creation failed move to dlq');
      await this.dlqMessageModel.create({
        eventName: UserCreatedEvent.name,
        payload: JSON.stringify(createdUser),
        origin: DLQOrigin.EXTERNAL,
        retries: 0
      });
    }
  }
}
