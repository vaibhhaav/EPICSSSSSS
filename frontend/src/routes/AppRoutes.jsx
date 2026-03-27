import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Profiles from '../pages/Profiles.jsx';
import Matching from '../pages/Matching.jsx';
import Connections from '../pages/Connections.jsx';
import Sessions from '../pages/Sessions.jsx';
import Feedback from '../pages/Feedback.jsx';
import { getToken } from '../utils/auth.js';

function ProtectedRoute() {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="profiles" replace />} />
          <Route path="profiles" element={<Profiles />} />
          <Route path="matching" element={<Matching />} />
          <Route path="connections" element={<Connections />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
