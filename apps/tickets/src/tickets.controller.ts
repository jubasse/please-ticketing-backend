import { NatsStreamingContext } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Logger,
  UseGuards
} from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AbstractRestController } from '@ticketing/common';
import { JwtGuard } from '@ticketing/common/jwt';
import { NatsEventType, UserCreatedEvent } from '@ticketing/nats';
import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { UpdateTicketDto } from '../dtos/update-ticket.dto';
import { Ticket } from '../schemas/ticket.schema';
import { TicketUsersService } from './ticket-users.service';
import { TicketsService } from './tickets.service';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController extends AbstractRestController {
  public constructor(
    private readonly ticketsService: TicketsService,
    private readonly ticketUsersService: TicketUsersService,
  ) {
    super(new Logger(TicketsController.name));
  }

  @ApiBody({ type: CreateTicketDto })
  @Post()
  @UseGuards(JwtGuard)
  create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    try {
      return this.ticketsService.create(createTicketDto);
    } catch (error) {
      this._handleError(error, 'Cannot create ticket');
    }
  }

  @ApiBody({ type: UpdateTicketDto })
  @Post(':id')
  @UseGuards(JwtGuard)
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket> {
    try {
      return this.ticketsService.update(id, updateTicketDto);
    } catch (error) {
      this._handleError(error, `Cannot update ticket with id #${id}`);
    }
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  find(@Param('id') id: string): Promise<Ticket> {
    try {
      return this.ticketsService.findById(id);
    } catch (error) {
      this._handleError(
        error,
        `Ticket with id #${id} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get()
  @UseGuards(JwtGuard)
  findAll(): Promise<Ticket[]> {
    try {
      return this.ticketsService.findAll();
    } catch (error) {
      this._handleError(
        error,
        `Could not find any tickets`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  delete(@Param('id') id: string): Promise<void> {
    try {
      return this.ticketsService.delete(id);
    } catch (error) {
      this._handleError(error, `Could not delete ticket with id #${id}`);
    }
  }

  @EventPattern(NatsEventType.USER_CREATED)
  public async userCreatedHandler(
    @Payload() createdUser: UserCreatedEvent,
    @Ctx() context: NatsStreamingContext,
  ) {
    await this.ticketUsersService.handleUserCreated(createdUser);
    context.message.ack(); 
  }
}
