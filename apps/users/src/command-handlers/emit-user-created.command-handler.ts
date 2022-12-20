import { Publisher } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DLQMessage,
  DLQOrigin,
  NatsEventType,
  UserCreatedEvent,
} from '@ticketing/nats';
import { Logger } from '@nestjs/common';
import { timeout, catchError, tap } from 'rxjs/operators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@CommandHandler(UserCreatedEvent)
export class EmitUserCreatedCommandHandler
  implements ICommandHandler<UserCreatedEvent>
{
  private readonly logger = new Logger(EmitUserCreatedCommandHandler.name);
  public constructor(
    private readonly natsPublisher: Publisher,
    @InjectModel(DLQMessage.name) private readonly dlqModel: Model<DLQMessage>,
  ) {}
  public async execute(event: UserCreatedEvent) {
    this.natsPublisher
      .emit(NatsEventType.USER_CREATED, event)
      .pipe(
        timeout(1000),
        tap((guid) => {
          this.logger.log(
            `nats ${UserCreatedEvent.name} emitted with guid #${guid}`,
          );
        }),
        catchError(async () => {
          this.logger.log(
            `nats event [${UserCreatedEvent.name}] failed move to dlq`,
          );
          await this.dlqModel.create({
            eventName: UserCreatedEvent.name,
            payload: JSON.stringify(event),
            origin: DLQOrigin.SELF,
            retries: 0,
          });
        }),
      )
      .subscribe();
  }
}
