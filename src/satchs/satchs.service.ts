import { Inject, Injectable } from '@nestjs/common';
import { CreateSatchDto } from './dto/create-satch.dto';
import { UpdateSatchDto } from './dto/update-satch.dto';
import { Request } from 'express';
import { UsersDocument } from 'src/firestore/documents/users';
import { CollectionReference, Timestamp } from '@google-cloud/firestore';
import { AuthService } from 'src/auth/auth.service';
import * as dayjs from 'dayjs';
@Injectable()
export class SatchsService {
  constructor(
    @Inject(UsersDocument.collectionName)
    private usersCollection: CollectionReference<UsersDocument>,
    private authService: AuthService,
  ) {}

  async create(goalId: string, createSatchDto: CreateSatchDto, req: Request) {
    const token = this.authService.getRefreshTokenByCookie(req.headers.cookie);
    const userId = await this.authService.getUserIdByRefreshToken(token);

    const ref = this.usersCollection
      .doc(`${userId}`)
      .collection(`goals`)
      .doc(goalId)
      .collection('satchs');

    const response = await ref.add({
      name: createSatchDto.name,
      price: createSatchDto.price, // 골의 목표 금액
      date: Timestamp.fromDate(dayjs(createSatchDto.date).toDate()),
    });

    return response.id;
  }

  async list(goalId: string, req: Request) {
    const token = this.authService.getRefreshTokenByCookie(req.headers.cookie);
    const userId = await this.authService.getUserIdByRefreshToken(token);

    const ref = this.usersCollection
      .doc(`${userId}`)
      .collection(`goals`)
      .doc(`${goalId}`)
      .collection('satchs');

    const snapshot = await ref.get();
    const res = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      res.push({ id: doc.id, ...data, date: dayjs(data.date.toDate()) });
    });
    return {
      success: true,
      data: res,
    };
  }

  update(id: number, updateSatchDto: UpdateSatchDto) {
    return `This action updates a #${id} satch`;
  }

  async remove(goalId: string, id: string, req: Request) {
    const token = this.authService.getRefreshTokenByCookie(req.headers.cookie);
    const userId = await this.authService.getUserIdByRefreshToken(token);

    const ref = this.usersCollection
      .doc(`${userId}`)
      .collection(`goals`)
      .doc(goalId)
      .collection('satchs')
      .doc(id);
    await ref.delete();

    return 200;
  }
}
