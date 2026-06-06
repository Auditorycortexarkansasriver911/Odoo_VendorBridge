import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import ChatPanel from '../chat/ChatPanel.jsx';

export default function AppLayout() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
      <ChatPanel />
    </div>
  );
}
