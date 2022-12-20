import { Listener } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CustomStrategy } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieSession from 'cookie-session';
import morgan from 'morgan';
import { TicketsModule } from './tickets.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(TicketsModule, {
    cors: true
  });
  app.set('trust proxy', true);
  app.use(cookieSession({
    signed: false,
    secure: false,
  }));
  app.use(morgan('combined'));
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Tickets microservice documentation')
    .setDescription('The tickets API description')
    .setVersion('1.0')
    .addTag('tickets')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/tickets/swagger', app, document);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const options: CustomStrategy = {
    strategy: new Listener(
      process.env.NATS_CLUSTER_ID,
      `${process.env.NATS_CLIENT_ID}_tickets`,
      process.env.NATS_QUEUE_GROUP_NAME,
      {
        url: process.env.NATS_CONNECT_URL
      },
      {
        durableName: `${process.env.NATS_QUEUE_GROUP_NAME}_tickets`,
        deliverAllAvailable: true,
        maxInFligth: 10
      }
    ),
  };
 
  app.connectMicroservice(options);

  await app.startAllMicroservices();

  await app.listen(3000);
}
bootstrap();
