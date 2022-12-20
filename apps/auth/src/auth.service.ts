import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignInDto } from './dtos/sign-in.dto';
import { Auth, AuthDocument, AuthMethods } from './schemas/auth.schema';
import { CommonJWTService } from '@ticketing/common/jwt/common-jwt.service';
import { DLQMessage, DLQOrigin, UserCreatedEvent } from '@ticketing/nats';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  public constructor(
    @InjectModel(Auth.name)
    private readonly authModel: Model<Auth & AuthMethods & AuthDocument>,
    @InjectModel(DLQMessage.name) private readonly dlqModel: Model<DLQMessage>,
    private readonly jwtService: CommonJWTService,
  ) {}
  public async signIn(signInDto: SignInDto): Promise<string> {
    const existingAuth = await this.authModel.findOne({
      email: signInDto.email,
    });
    if (!existingAuth) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    const passwordIsValid = await existingAuth.validatePassword(
      signInDto.password,
    );
    if (!passwordIsValid) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    try {
      return this.jwtService.sign(existingAuth.user_id.toString(), {
        _id: existingAuth.user_id.toString(),
        email: existingAuth.email,
        roles: existingAuth.roles,
      });
    } catch (error) {
      throw new HttpException(
        'Could not generate a token',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  public async handleUserCreated(createdUser: UserCreatedEvent): Promise<void> {
    try {
      const createdAuth = await this.authModel.create({
        user_id: createdUser._id.toString(),
        username: createdUser.username,
        email: createdUser.email,
        password: createdUser.password,
        roles: ['user'],
      });
      this.logger.log('(handleUserCreated) - auth created');
    } catch (error) {
      this.logger.log(
        '(handleUserCreated) - auth creation failed, move to dlq',
      );
      await this.dlqModel.create({
        eventName: UserCreatedEvent.name,
        payload: JSON.stringify(createdUser),
        origin: DLQOrigin.EXTERNAL,
        retries: 0,
      });
    }
  }
}
