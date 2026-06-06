import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import { login as loginApi } from '../../services/authApi.js';
import { setCredentials } from '../../store/authSlice.js';
import { showToast } from '../../components/common/Toast.jsx';

/* ── Google SSO Icon ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.707a5.41 5.41 0 010-3.414V4.961H.957a8.997 8.997 0 000 8.078l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.896 11.426 0 9 0A8.997 8.997 0 00.957 4.961l3.007 2.332C10.673 5.166 8.688 3.58 6.344 3.58H9z" fill="#EA4335"/>
  </svg>
);

/* ── Labeled Input with icon ── */
const FieldInput = ({ label, type = 'text', placeholder, value, onChange, icon: Icon, rightNode }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6B6860', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      {Icon && (
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9B9890' }}>
          <Icon size={16} />
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
        style={{
          width: '100%',
          padding: Icon ? '11px 40px 11px 38px' : '11px 14px',
          paddingRight: rightNode ? '42px' : '14px',
          fontSize: '14px',
          fontFamily: "'DM Sans', sans-serif",
          color: '#111111',
          backgroundColor: '#F7F6F3',
          border: '1.5px solid #E5E3DE',
          borderRadius: '7px',
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#E8A020'; e.target.style.boxShadow = '0 0 0 3px rgba(232,160,32,0.12)'; e.target.style.backgroundColor = '#FFFFFF'; }}
        onBlur={(e) => { e.target.style.borderColor = '#E5E3DE'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#F7F6F3'; }}
      />
      {rightNode && (
        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9B9890' }}>
          {rightNode}
        </span>
      )}
    </div>
  </div>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const res = await loginApi({ email, password });
      const { accessToken, user } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      dispatch(setCredentials({ user }));
      showToast(`Welcome back, ${user.firstName}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg); showToast(msg, 'error');
    } finally { setLoading(false); }
  };

  const handleGoogle = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    window.location.href = `${apiUrl.replace(/\/api$/, '')}/api/auth/google`;
  };

  return (
    <div>
      {/* Heading */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', fontWeight: 400, color: '#111111', marginBottom: '6px' }}>
          Sign in to your account
        </h2>
        <p style={{ fontSize: '14px', color: '#6B6860' }}>
          Don't have one?{' '}
          <Link to="/register" style={{ color: '#E8A020', fontWeight: 600, textDecoration: 'none' }}>Create an account</Link>
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ padding: '11px 14px', backgroundColor: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '7px', color: '#DC2626', fontSize: '13px', marginBottom: '20px', fontWeight: 500 }}>
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <FieldInput
          label="Email address"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
        />

        <FieldInput
          label="Password"
          type={showPwd ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          rightNode={
            <span onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </span>
          }
        />

        {/* Forgot link */}
        <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '24px' }}>
          <Link to="/forgot-password" style={{ fontSize: '13px', color: '#E8A020', fontWeight: 600, textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        {/* Sign In button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '13px',
            backgroundColor: loading ? '#C8880A' : '#E8A020',
            border: 'none', borderRadius: '7px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '15px', fontWeight: 700,
            color: '#111111', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'background 0.15s, transform 0.1s',
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#C8880A'; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#E8A020'; }}
        >
          {loading ? 'Signing in…' : (<>Sign In <ArrowRight size={16} /></>)}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E3DE' }} />
        <span style={{ fontSize: '12px', color: '#9B9890', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>or continue with</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E3DE' }} />
      </div>

      {/* Google SSO */}
      <button
        type="button"
        onClick={handleGoogle}
        style={{
          width: '100%', padding: '12px',
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #E5E3DE',
          borderRadius: '7px',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px', fontWeight: 600,
          color: '#111111', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C9C7C0'; e.currentTarget.style.backgroundColor = '#F7F6F3'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E3DE'; e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
      >
        <GoogleIcon /> Sign in with Google Workspace
      </button>

      {/* Footer note */}
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#9B9890', marginTop: '28px', lineHeight: 1.6 }}>
        By signing in you agree to our{' '}
        <span style={{ color: '#6B6860', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span>{' '}
        &amp;{' '}
        <span style={{ color: '#6B6860', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>.
      </p>
    </div>
  );
}
