import { Listener } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CustomStrategy } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieSession from 'cookie-session';
import morgan from 'morgan';
import { UsersModule } from './users.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(UsersModule, {
    cors: true
  });
  app.set('trust proxy', true);
  app.use(morgan('combined'));
  app.use(cookieSession({
    signed: false,
    secure: false,
  }));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const config = new DocumentBuilder()
    .setTitle('Users microservice documentation')
    .setDescription('The users API description')
    .setVersion('1.0')
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/users/swagger', app, document);

  const options: CustomStrategy = {
    strategy: new Listener(
      process.env.NATS_CLUSTER_ID,
      `${process.env.NATS_CLIENT_ID}_users`,
      process.env.NATS_QUEUE_GROUP_NAME,
      {
        url: process.env.NATS_CONNECT_URL
      },
      {
        durableName: `${process.env.NATS_QUEUE_GROUP_NAME}_users`,
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
