import { ExecutionContext } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonJWTService } from './common-jwt.service';

@Injectable()
export class JwtGuard implements CanActivate {
  public constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: CommonJWTService
  ) {}
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwtToken = request.session?.jwt_token;
    if (!jwtToken) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    try {
      const jwtSecret = new TextEncoder().encode(
        this.configService.get('JWT_SECRET'),
      );

      const { payload } = await this.jwtService.verify(jwtToken);
      request.session.currentUser = payload;
      return payload ? true : false;
    } catch (e) {
      return false;
    }
  }
}
