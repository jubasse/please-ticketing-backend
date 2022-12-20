import { UseGuards } from '@nestjs/common';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Delete,
  Logger,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBody, ApiCookieAuth, ApiTags } from '@nestjs/swagger/dist';
import { AbstractRestController } from '@ticketing/common';
import { JwtGuard } from '@ticketing/common/jwt/jwt.guards';
import { UserCreatedEvent } from '@ticketing/nats';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController extends AbstractRestController {
  public constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus,
  ) {
    super(new Logger(UsersController.name));
  }

  @ApiBody({ type: CreateUserDto })
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdUser = await this.usersService.create(createUserDto);
      await this.commandBus.execute(
        new UserCreatedEvent(
          createdUser._id.toString(),
          createdUser.username,
          createdUser.email,
          createdUser.password,
        ),
      );
      return createdUser;
    } catch (error) {
      this._handleError(error, `Could not create user`);
    }
  }

  @ApiBody({ type: UpdateUserDto })
  @Post()
  @UseGuards(JwtGuard)
  upddate(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      return this.usersService.update(id, updateUserDto);
    } catch (error) {
      this._handleError(error, `Cannot update user with id #${id}`);
    }
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  find(@Param('id') id: string): Promise<User> {
    try {
      return this.usersService.findById(id);
    } catch (error) {
      this._handleError(
        error,
        `User with id #${id} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get()
  @UseGuards(JwtGuard)
  findAll(): Promise<User[]> {
    try {
      return this.usersService.findAll();
    } catch (error) {
      this._handleError(
        error,
        `Could not find any users`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  public delete(@Param('id') id: string): Promise<void> {
    try {
      return this.usersService.delete(id);
    } catch (error) {
      this._handleError(error, `Could not delete user with id #${id}`);
    }
  }
}
