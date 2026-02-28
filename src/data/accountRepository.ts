import { collection, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';

import { db } from '../services/firebase';

const DELETE_BATCH_SIZE = 400;

function timestampsCollectionRef(userId: string) {
  return collection(db, 'users', userId, 'timestamps');
}

function stateDocumentRef(userId: string) {
  return doc(db, 'users', userId, 'data', 'state');
}

function userDocumentRef(userId: string) {
  return doc(db, 'users', userId);
}

async function deleteCollectionInBatches(userId: string) {
  const snapshot = await getDocs(timestampsCollectionRef(userId));

  for (let index = 0; index < snapshot.docs.length; index += DELETE_BATCH_SIZE) {
    const batch = writeBatch(db);

    snapshot.docs.slice(index, index + DELETE_BATCH_SIZE).forEach((item) => {
      batch.delete(item.ref);
    });

    await batch.commit();
  }
}

export const accountRepository = {
  async deleteAccountData(userId: string): Promise<void> {
    await deleteCollectionInBatches(userId);
    await deleteDoc(stateDocumentRef(userId));
    await deleteDoc(userDocumentRef(userId));
  }
};
