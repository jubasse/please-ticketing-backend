import { NestFactory } from '@nestjs/core';
import { TicketsModule } from './tickets.module';
import cookieSession from 'cookie-session';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(TicketsModule);
  app.set('trust proxy', true);
  app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  }));
  await app.listen(3000);
}
bootstrap();
