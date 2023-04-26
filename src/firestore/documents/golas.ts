import { Timestamp } from '@google-cloud/firestore';

type GoalStatus = 'finished' | 'current';

export class GoalsDocument {
  static collectionName = 'goals';
  id?: string;
  emoticon?: string; // 이모티콘
  status: GoalStatus; // finished, current
  name: string; // 맥북 미국여행
  price: number; // 골의 목표 금액
  percent: number; // 달성률
  created_at: Timestamp; // 언제시작
  ended_at?: Timestamp; // 언제 달성했어?
}
