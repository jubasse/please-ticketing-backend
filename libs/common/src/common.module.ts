import { Module } from '@nestjs/common';
import { CommonJWTModule } from './jwt/common-jwt.module';
import { CommonConfigModule } from './config/common-config.module';

@Module({
  imports: [CommonConfigModule, CommonJWTModule],
  exports: [CommonConfigModule, CommonJWTModule],
})
export class CommonModule {}
