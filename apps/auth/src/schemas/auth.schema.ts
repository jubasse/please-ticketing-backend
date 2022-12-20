import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { HydratedDocument, Types } from 'mongoose';

export interface AuthMethods {
    validatePassword(password: string): Promise<boolean>;
}

export type AuthDocument = HydratedDocument<Auth> & AuthMethods;

@Schema()
export class Auth {
  @Prop({ required: true, type: Types.ObjectId })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, type: [String] })
  roles: string[];

  @Prop({ required: true })
  password: string;

  @Prop()
  jwt_token?: string;

  @Prop()
  refresh_token?: string;
}

const schema = SchemaFactory.createForClass(Auth);

schema.methods.validatePassword = async function (
  password: string,
): Promise<boolean> {
  return compare(password, this.get('password'));
};

export const AuthSchema = schema;
