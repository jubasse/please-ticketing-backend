import { Module } from '@nestjs/common';
import { CommonConfigModule } from '../config/common-config.module';
import { CommonJWTService } from './common-jwt.service';

@Module({
  imports: [CommonConfigModule],
  providers: [CommonJWTService],
  exports: [CommonJWTService]
})
export class CommonJWTModule {}
