import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from "mongoose";
import { TicketPriority } from '../enums/ticket-priority.enum';
import { TicketSeverity } from '../enums/ticket-severity.enum';
import { TicketType } from '../enums/ticket-type.enum';

export type TicketDocument = HydratedDocument<Ticket>;

@Schema()
export class Ticket {
    @Prop({ required: true })
    issue: string;

    @Prop({ type: String, required: true, enum: TicketPriority })
    priority: TicketPriority

    @Prop({ type: String, required: true, enum: TicketSeverity })
    severity: TicketSeverity

    @Prop({ type: String, required: true, enum: TicketType })
    type: TicketType

    @Prop({ type: Types.ObjectId, required: true, ref: 'TicketUser' })
    createdBy: Types.ObjectId
    
    @Prop({ type: Types.ObjectId, ref: 'TicketUser' })
    assignedTo?: Types.ObjectId
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);