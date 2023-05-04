import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersDocument } from 'src/firestore/documents/users';
import { CollectionReference, Timestamp } from '@google-cloud/firestore';
import * as dayjs from 'dayjs';

@Injectable()
export class UserService {
  constructor(
    @Inject(UsersDocument.collectionName)
    private usersCollection: CollectionReference<UsersDocument>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const ref = this.usersCollection.doc(`${createUserDto.id}`);
    ref.set({
      id: createUserDto.id,
      vendor: createUserDto.vendor,
      created_at: Timestamp.fromDate(dayjs().toDate()),
    });

    const user = await ref.get();

    return user.id;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    const ref = this.usersCollection.doc(`${id}`);
    const user = await ref.get();
    const data = user.data();

    return data;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
