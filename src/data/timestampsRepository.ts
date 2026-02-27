import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { db } from '../services/firebase';

export interface TimestampWriteInput {
  videoId: string;
  sourceUrl: string;
  rawSeconds: number;
  formattedTime: string;
  note: string | null;
}

function timestampsCollectionRef(userId: string) {
  return collection(db, 'users', userId, 'timestamps');
}

export const timestampsRepository = {
  async createTimestamp(userId: string, payload: TimestampWriteInput): Promise<string> {
    const snapshot = await addDoc(timestampsCollectionRef(userId), {
      videoId: payload.videoId,
      sourceUrl: payload.sourceUrl,
      rawSeconds: payload.rawSeconds,
      formattedTime: payload.formattedTime,
      note: payload.note,
      createdAt: serverTimestamp()
    });

    return snapshot.id;
  }
};
