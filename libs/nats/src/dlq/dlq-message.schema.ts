import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { DLQOrigin } from './dlq-origin.enum';

export type DLQMessageDocument = HydratedDocument<DLQMessage>;

@Schema({
  timestamps: true,
})
export class DLQMessage {
  @Prop({ type: String, enum: DLQOrigin })
  origin: DLQOrigin;

  @Prop({ required: true })
  eventName: string;

  @Prop({ required: true })
  payload: string;

  @Prop({ required: true })
  retries: number;
}

export const DLQMessageSchema = SchemaFactory.createForClass(DLQMessage);
