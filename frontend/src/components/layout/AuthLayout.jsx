import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AuthLayout() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--content-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      fontFamily: "var(--font-sans)",
    }}>
      {/* Logo Container */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
          {/* Minimalist Professional Logo Icon */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="var(--brand-black)"/>
            {/* Elegant connection bridge vector */}
            <path d="M8 20C12 12 20 12 24 20" stroke="var(--brand-amber)" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M11 15.5L13.5 18" stroke="var(--brand-amber)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M21 15.5L18.5 18" stroke="var(--brand-amber)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ 
            fontFamily: "var(--font-brand)", 
            fontSize: '20px', 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            letterSpacing: '-0.03em' 
          }}>
            VendorBridge
          </span>
        </div>
      </div>

      {/* Modern minimal Form Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px 36px',
        boxShadow: '0 4px 6px -1px rgba(9, 9, 11, 0.05), 0 10px 15px -3px rgba(9, 9, 11, 0.03)',
      }}>
        <Outlet />
      </div>

      <p style={{ marginTop: '32px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '0.01em' }}>
        &copy; 2026 VendorBridge &middot; Enterprise Procurement Network
      </p>
    </div>
  );
}
