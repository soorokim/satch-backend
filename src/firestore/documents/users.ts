import { Timestamp } from '@google-cloud/firestore';

export class UsersDocument {
  static collectionName = 'users';

  id: string;
  vendor: string;
  created_at: Timestamp;
}
