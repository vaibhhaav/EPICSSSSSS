// utils/auth.js
// Simple helpers for storing and retrieving the backend JWT.

import { getAuth } from "firebase/auth";

const TOKEN_KEY = 'kc_admin_token';

export function saveToken(token) {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// NEW: Firebase → Backend login
// --------------------
export async function loginAdminWithFirebase() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No Firebase user logged in");
  }

  // 1️⃣ Firebase ID token
  const firebaseToken = await user.getIdToken(true);

  // 2️⃣ Exchange for backend JWT
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firebaseToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Backend login failed");
  }

  const { token } = await res.json();

  // 3️⃣ Store backend JWT
  saveToken(token);

  return token;
}
