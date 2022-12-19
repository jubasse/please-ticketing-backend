import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import cookieSession from 'cookie-session';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);
  app.set('trust proxy', true);
  app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  }))
  await app.listen(3000);
}
bootstrap();
