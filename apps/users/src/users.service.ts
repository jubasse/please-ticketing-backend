import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  public constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    return this.userModel.create(createUserDto);
  }

  public async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const mongooseId = new Types.ObjectId(id);
    const existingUser = await this.findById(id);
    if (!existingUser) {
        throw new HttpException(`User with id #${id} not found`, HttpStatus.NOT_FOUND);
    }
    return this.userModel.findByIdAndUpdate(mongooseId, { $set: updateUserDto });
  }

  public async findById(id: string): Promise<UserDocument> {
    const mongooseId = new Types.ObjectId(id);
    return this.userModel.findById(mongooseId);
  }

  public async findAll(): Promise<UserDocument[]> {
    return this.userModel.find({});
  }

  public async delete(id: string): Promise<void> {
    const mongooseId = new Types.ObjectId(id);
    return this.userModel.findOneAndDelete({ _id: mongooseId });
  }
}
