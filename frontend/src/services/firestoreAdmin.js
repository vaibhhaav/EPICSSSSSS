import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../components/firebase.js';

/** Firestore institution types (spec). */
export const INSTITUTION_TYPES = {
  ORPHANAGE: 'orphanage',
  OLDAGE: 'oldage',
};

/** Profile `type` for ML / legacy compatibility. */
export function profileTypeFromInstitutionType(institutionType) {
  if (institutionType === INSTITUTION_TYPES.ORPHANAGE) return 'orphan';
  if (institutionType === INSTITUTION_TYPES.OLDAGE) return 'elder';
  return null;
}

export function profilesCollectionForInstitution(institutionType) {
  if (institutionType === INSTITUTION_TYPES.ORPHANAGE) return 'orphans';
  if (institutionType === INSTITUTION_TYPES.OLDAGE) return 'elders';
  return null;
}

/**
 * One institution per admin. Creates institution + links user in a transaction.
 */
export async function createInstitutionForAdmin({
  adminId,
  name,
  type,
}) {
  const userRef = doc(db, 'users', adminId);
  const institutionsRef = collection(db, 'institutions');

  return runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error('User record not found.');
    }
    const data = userSnap.data();
    if (data.institutionId) {
      throw new Error('Institution already exists for this account.');
    }

    const instRef = doc(institutionsRef);
    const institutionId = instRef.id;

    transaction.set(instRef, {
      institutionId,
      name: String(name).trim(),
      type,
      adminId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.update(userRef, {
      institutionId,
      institutionType: type,
      updatedAt: serverTimestamp(),
    });

    return institutionId;
  });
}

export async function updateInstitutionName(institutionId, name) {
  const ref = doc(db, 'institutions', institutionId);
  await updateDoc(ref, {
    name: String(name).trim(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes institution doc, clears user link, removes profiles for that institution.
 */
export async function deleteInstitutionCascade({ institutionId, adminId }) {
  const instRef = doc(db, 'institutions', institutionId);
  const userRef = doc(db, 'users', adminId);

  const orphansQ = query(collection(db, 'orphans'), where('institutionId', '==', institutionId));
  const eldersQ = query(collection(db, 'elders'), where('institutionId', '==', institutionId));

  const [orphanSnap, elderSnap] = await Promise.all([getDocs(orphansQ), getDocs(eldersQ)]);

  const batch = writeBatch(db);
  orphanSnap.forEach((d) => batch.delete(d.ref));
  elderSnap.forEach((d) => batch.delete(d.ref));
  batch.delete(instRef);
  batch.update(userRef, {
    institutionId: deleteField(),
    institutionType: deleteField(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function addProfileDocument({
  institutionType,
  institutionId,
  createdBy,
  payload,
}) {
  const col = profilesCollectionForInstitution(institutionType);
  if (!col) throw new Error('Invalid institution type');

  const type = profileTypeFromInstitutionType(institutionType);
  const cleaned = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== null && v !== undefined && v !== ''),
  );
  const docRef = await addDoc(collection(db, col), {
    ...cleaned,
    institutionId,
    createdBy,
    institutionType,
    type,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}
