import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

const schema = SchemaFactory.createForClass(User);

schema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashedPassword = await hash(this.get('password'), 10);
    this.set('password', hashedPassword);
  }
  done();
});

export const UserSchema = schema;
