import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '@ticketing/common';
import { CommonConfigModule } from '@ticketing/common/config/common-config.module';
import { DLQMessage, DLQMessageSchema, NatsModule } from '@ticketing/nats';
import { EmitUserCreatedCommandHandler } from './command-handlers/emit-user-created.command-handler';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const commandHandlers = [EmitUserCreatedCommandHandler];

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
      { name: User.name, schema: UserSchema },
      { name: DLQMessage.name, schema: DLQMessageSchema },
    ]),
  ],
  providers: [UsersService, ...commandHandlers],
  controllers: [UsersController],
})
export class UsersModule {}
