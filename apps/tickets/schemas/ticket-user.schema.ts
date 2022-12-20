import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from "mongoose";

export type TicketUserDocument = HydratedDocument<TicketUser>;

@Schema()
export class TicketUser {
    @Prop({ required: true, type: Types.ObjectId })
    user_id: Types.ObjectId;

    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    email: string;
}

export const TicketUserSchema = SchemaFactory.createForClass(TicketUser);