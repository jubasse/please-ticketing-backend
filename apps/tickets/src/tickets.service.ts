import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { UpdateTicketDto } from '../dtos/update-ticket.dto';
import { Ticket, TicketDocument } from '../schemas/ticket.schema';

@Injectable()
export class TicketsService {
  public constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<TicketDocument>,
  ) {}

  public async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const createdBy = new Types.ObjectId(createTicketDto.createdBy);
    const assignedTo = new Types.ObjectId(createTicketDto.assignedTo);
    return this.ticketModel.create({
      assignedTo,
      createdBy,
      priority: createTicketDto.priority,
      severity: createTicketDto.severity,
      type: createTicketDto.type,
      issue: createTicketDto.issue
    });
  }

  public async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const mongooseId = new Types.ObjectId(id);
    const existingTicket = await this.findById(id);
    if (!existingTicket) {
        throw new HttpException(`Ticket with id #${id} not found`, HttpStatus.NOT_FOUND);
    }
    const updatedFields: Partial<Ticket> = {};
    if (updateTicketDto.assignedTo) {
      updatedFields.assignedTo = new Types.ObjectId(updateTicketDto.assignedTo);
    }
    if (updateTicketDto.createdBy) {
      updatedFields.createdBy = new Types.ObjectId(updateTicketDto.createdBy);
    }
    updatedFields.issue = updateTicketDto.issue;
    updatedFields.severity = updateTicketDto.severity;
    updatedFields.priority = updateTicketDto.priority;
    updatedFields.type = updateTicketDto.type;
    return this.ticketModel.findByIdAndUpdate(mongooseId, { $set: updatedFields });
  }

  public async findById(id: string): Promise<Ticket> {
    const mongooseId = new Types.ObjectId(id);
    return this.ticketModel.findById(mongooseId);
  }

  public async findAll(): Promise<Ticket[]> {
    return this.ticketModel.find({});
  }

  public async delete(id: string): Promise<void> {
    const mongooseId = new Types.ObjectId(id);
    return this.ticketModel.findOneAndDelete({ _id: mongooseId });
  }
}
