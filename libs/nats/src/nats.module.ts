import { NatsStreamingTransport } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonConfigModule } from '@ticketing/common/config/common-config.module';
import { NatsService } from './nats.service';

@Module({
  imports: [
    NatsStreamingTransport.registerAsync({
      imports: [CommonConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        clientId: configService.get('NATS_CLIENT_ID'),
        clusterId: configService.get('NATS_CLUSTER_ID'),
        connectOptions: {
          url: configService.get('NATS_CONNECT_URL'),
        },
      })
    }),
  ],
  providers: [NatsService],
  exports: [NatsService, NatsStreamingTransport],
})
export class NatsModule {}
