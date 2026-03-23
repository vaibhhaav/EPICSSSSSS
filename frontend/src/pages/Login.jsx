import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { loginWithFirebaseIdToken } from '../services/api.js';
import { saveToken } from '../utils/auth.js';

// Firebase client config is expected via Vite env variables.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

let firebaseApp;
let auth;

function ensureFirebase() {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    console.log('Firebase initialized:', !!auth);
  }
  return auth;
}

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const authInstance = ensureFirebase();
      const cred = await signInWithEmailAndPassword(
        authInstance,
        form.email,
        form.password,
      );
      const idToken = await cred.user.getIdToken();
      const data = await loginWithFirebaseIdToken(idToken);
      saveToken(data.token);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Login failed. Check credentials or admin access.');
    } finally {
      setLoading(false);
    }
    const data = await loginWithFirebaseIdToken(idToken);

console.log('Backend JWT:', data.token);

saveToken(data.token);
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-slate-200 p-6">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Kindred Connect</h1>
        <p className="text-sm text-slate-500 mb-4">
          Admins only. Please sign in with your institutional email.
        </p>

        {error && (
          <p className="mb-3 text-xs text-red-600 border border-red-200 bg-red-50 rounded-md px-2 py-1">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <label className="space-y-1 block">
            <span className="block text-slate-700 font-medium">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-md border-slate-300 focus:ring-primary-500 focus:border-primary-500"
            />
          </label>
          <label className="space-y-1 block">
            <span className="block text-slate-700 font-medium">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-md border-slate-300 focus:ring-primary-500 focus:border-primary-500"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 disabled:bg-slate-300"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-500">
          This platform is for facilitating safe, admin-mediated bonds between elders and
          children. All interactions are logged. If you believe you should have access,
          contact your programme coordinator.
        </p>
      </div>
    </div>
  );
};

export default Login;

