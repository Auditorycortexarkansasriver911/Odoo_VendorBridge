import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

/* ── Inline SVG Logo Icon ── */
const VBIcon = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Hexagon base */}
    <polygon points="20,3 35,11 35,29 20,37 5,29 5,11" fill="#E8A020" />
    {/* Bridge / V shape */}
    <polyline points="10,26 15,16 20,22 25,16 30,26" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Node dots */}
    <circle cx="20" cy="22" r="2" fill="#111111" />
  </svg>
);

/* ── Feature chip ── */
const Chip = ({ children }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', borderRadius: '4px',
    border: '1px solid rgba(232,160,32,0.35)',
    backgroundColor: 'rgba(232,160,32,0.10)',
    fontSize: '12px', fontWeight: 600,
    color: '#E8A020', letterSpacing: '0.03em',
  }}>
    {children}
  </div>
);

/* ── Stat block ── */
const Stat = ({ num, label }) => (
  <div style={{ textAlign: 'center' }}>
    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>{num}</p>
    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0', fontWeight: 500 }}>{label}</p>
  </div>
);

export default function AuthLayout() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── LEFT PANEL — dark brand panel ── */}
      <div style={{
        width: '42%', minWidth: '380px',
        backgroundColor: '#111111',
        display: 'flex', flexDirection: 'column',
        padding: '48px 52px',
        position: 'relative', overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Subtle texture dots */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Amber accent bar top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: '#E8A020' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '64px', position: 'relative', zIndex: 1 }}>
          <VBIcon size={40} />
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.04em', margin: 0 }}>
              Vendor<span style={{ color: '#E8A020' }}>Bridge</span>
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '1px 0 0', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
              Procurement ERP
            </p>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '38px', fontWeight: 400,
            color: '#FFFFFF', lineHeight: 1.2,
            marginBottom: '18px',
          }}>
            Smarter procurement,<br />
            <span style={{ color: '#E8A020' }}>trusted vendors.</span>
          </h1>

          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '340px', fontWeight: 400 }}>
            End-to-end vendor management — from RFQ to purchase order — in one unified platform.
          </p>

          {/* Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '52px' }}>
            {['Multi-vendor RFQ', 'Auto PO & Invoice', 'Role-based Access', 'Real-time Approvals'].map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            <Stat num="500+" label="Vendors managed" />
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <Stat num="₹12Cr+" label="Spend tracked" />
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <Stat num="99.2%" label="Uptime SLA" />
          </div>
        </div>

        {/* Bottom footer */}
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '32px', position: 'relative', zIndex: 1 }}>
          © 2026 VendorBridge. All rights reserved.
        </p>
      </div>

      {/* ── RIGHT PANEL — form area ── */}
      <div style={{
        flex: 1, backgroundColor: '#F7F6F3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', overflowY: 'auto',
      }}>
        <div style={{
          width: '100%', maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E3DE',
          borderRadius: '12px',
          padding: '44px 40px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        }}>
          <Outlet />
        </div>
      </div>

    </div>
  );
}
