import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces';
import cookieSession from 'cookie-session';
import { UsersModule } from './users.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(UsersModule);
  app.set('trust proxy', true);
  app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  }));
  await app.listen(3000);
}
bootstrap();
