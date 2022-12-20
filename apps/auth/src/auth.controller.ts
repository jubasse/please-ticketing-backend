import { NatsStreamingContext } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { Controller, Get, Post, Body, Logger, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { ApiBody } from '@nestjs/swagger';
import { AbstractRestController } from '@ticketing/common';
import { JwtGuard } from '@ticketing/common/jwt';
import { NatsEventType, UserCreatedEvent } from '@ticketing/nats';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/sign-in.dto';

@Controller('auth')
export class AuthController extends AbstractRestController {
  constructor(private readonly authService: AuthService) {
    super(new Logger(AuthController.name));
  }

  @ApiBody({ type: SignInDto })
  @Post('signIn')
  public async signIn(
    @Body() signInDto: SignInDto,
    @Req() request: Request,
  ): Promise<string> {
    try {
      const token = await this.authService.signIn(signInDto);
      request.session.jwt_token = token;
      return token;
    } catch (error) {
      this._handleError(
        error,
        error.message,
        error.status ?? HttpStatus.FORBIDDEN,
      );
    }
  }

  @Get('signOut')
  @UseGuards(JwtGuard)
  public signOut(@Req() request: Request): void {
    request.session = null;
  }

  @EventPattern(NatsEventType.USER_CREATED)
  public async userCreatedHandler(
    @Payload() createdUser: UserCreatedEvent,
    @Ctx() context: NatsStreamingContext,
  ) {
    await this.authService.handleUserCreated(createdUser);
    context.message.ack();
  }
}
