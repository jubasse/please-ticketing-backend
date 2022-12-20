import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { CommonConfigModule } from '@ticketing/common/config/common-config.module';
import { CommonModule } from '@ticketing/common';
import { DLQMessage, DLQMessageSchema, NatsModule } from '@ticketing/nats';
import { CqrsModule } from '@nestjs/cqrs';
import { Auth, AuthSchema } from './schemas/auth.schema';

@Module({
  imports: [
    CqrsModule,
    NatsModule,
    CommonModule,
    MongooseModule.forRootAsync({
      imports: [CommonConfigModule],
      inject: [ConfigService],
      useFactory: (configService) => ({
        uri: `mongodb://${configService.get('AUTH_MONGO_URI')}`,
      }),
    }),
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: DLQMessage.name, schema: DLQMessageSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
