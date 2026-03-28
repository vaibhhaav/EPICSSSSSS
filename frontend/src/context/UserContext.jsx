import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../components/firebase.js';
import { clearToken } from '../utils/auth.js';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userDocLoading, setUserDocLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      setUserDoc(null);
      setUserDocLoading(false);
      return undefined;
    }

    setUserDocLoading(true);
    const userRef = doc(db, 'users', firebaseUser.uid);

    const unsub = onSnapshot(
      userRef,
      async (snap) => {
        try {
          if (!snap.exists()) {
            await setDoc(
              userRef,
              {
                userId: firebaseUser.uid,
                email: firebaseUser.email || '',
                role: 'admin',
                institutionId: null,
                institutionType: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            );
            return;
          }
          setUserDoc({ id: snap.id, ...snap.data() });
        } catch (e) {
          console.error(e);
          setUserDoc(null);
        } finally {
          if (snap.exists()) {
            setUserDocLoading(false);
          }
        }
      },
      () => {
        setUserDocLoading(false);
      },
    );

    return () => unsub();
  }, [firebaseUser]);

  const logout = useCallback(async () => {
    clearToken();
    await signOut(auth);
    setUserDoc(null);
    setFirebaseUser(null);
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      userDoc,
      userId: firebaseUser?.uid ?? userDoc?.userId ?? null,
      email: firebaseUser?.email ?? userDoc?.email ?? null,
      institutionId: userDoc?.institutionId ?? null,
      institutionType: userDoc?.institutionType ?? null,
      authLoading,
      userDocLoading,
      loading: authLoading || (!!firebaseUser && userDocLoading),
      logout,
    }),
    [
      firebaseUser,
      userDoc,
      authLoading,
      userDocLoading,
      logout,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}
