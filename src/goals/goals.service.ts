import { Inject, Injectable } from '@nestjs/common';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CollectionReference, Timestamp } from '@google-cloud/firestore';
import * as dayjs from 'dayjs';
import { GoalsDocument } from 'src/firestore/documents/golas';
import { UsersDocument } from 'src/firestore/documents/users';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';

/**
 *  TODO:
 *  2. goals Collection을 사용하고 싶은데 이거 계속해서 UserCollection을 사용해야한다.
 * */

@Injectable()
export class GoalsService {
  constructor(
    @Inject(UsersDocument.collectionName)
    private usersCollection: CollectionReference<UsersDocument>,
    private authService: AuthService,
  ) {}

  async create(createGoalDto: CreateGoalDto): Promise<string> {
    const ref = this.usersCollection
      .doc(`${createGoalDto.userId}`)
      .collection(`goals`) as CollectionReference<GoalsDocument>;

    const response = await ref.add({
      status: 'current',
      name: createGoalDto.name,
      price: createGoalDto.price, // 골의 목표 금액
      percent: 0,
      created_at: Timestamp.fromDate(dayjs().toDate()),
    });

    return response.id;
  }

  async findAll(req: Request) {
    const token = this.authService.getRefreshTokenByCookie(req.headers.cookie);
    const userId = await this.authService.getUserIdByRefreshToken(token);

    const ref = this.usersCollection.doc(`${userId}`).collection(`goals`);
    const snapshot = await ref.get();
    const res = [];
    snapshot.forEach((doc) => {
      res.push({ id: doc.id, ...doc.data() });
    });
    return res;
  }

  async findOne(req: Request) {
    const token = this.authService.getRefreshTokenByCookie(req.headers.cookie);
    const userId = await this.authService.getUserIdByRefreshToken(token);
    const ref = this.usersCollection
      .doc(`${userId}`)
      .collection(`goals`)
      .where('status', '==', 'current');
    const snapshot = await ref.limit(1).get();
    let res = {} as any;
    if (snapshot.empty) {
      return {};
    }
    snapshot.forEach((doc) => {
      res = { id: doc.id, ...doc.data() };
    });

    return {
      ...res,
      created_at: dayjs(res.created_at.toDate()),
    };
  }

  update(id: number, updateGoalDto: UpdateGoalDto) {
    return `This action updates a #${id} goal`;
  }

  async remove(req: Request, id: string) {
    const token = this.authService.getRefreshTokenByCookie(req.headers.cookie);
    const userId = await this.authService.getUserIdByRefreshToken(token);
    const ref = this.usersCollection
      .doc(`${userId}`)
      .collection(`goals`)
      .doc(id);

    await ref.delete();
    return 200;
  }
}
