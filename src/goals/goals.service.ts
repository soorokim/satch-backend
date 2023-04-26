import { Inject, Injectable } from '@nestjs/common';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CollectionReference, Timestamp } from '@google-cloud/firestore';
import * as dayjs from 'dayjs';
import { GoalsDocument } from 'src/firestore/documents/golas';
import { UsersDocument } from 'src/firestore/documents/users';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';

// interface Goal {
//   id: number; // 식별
//   emoticon: string; // 이모티콘
//   name: string; // 맥북 미국여행
//   price: number; // 골의 목표 금액
//   percent: number; // 달성률
//   createdAt: Date; // 언제시작
//   endedAt?: Date; // 언제 달성했어?
//   satchList: Satch[]; // 이 골을 달성하기 위해서 어떤 아이템들을 갖고있어?
// }

/**
 *  TODO:
 *  1. userId를 받을 필요가 없다. accessToken확인 하면된다!
 *  2. goals Collection을 사용하고 싶은데 이거 계속해서 UserCollection을 사용해야한다.
 * */

@Injectable()
export class GoalsService {
  constructor(
    // @Inject(GoalsDocument.collectionName)
    // private goalsCollection: CollectionReference<GoalsDocument>,
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
