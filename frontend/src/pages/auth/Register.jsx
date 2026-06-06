import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, Globe, ArrowRight, CheckCircle2, Upload, ClipboardList, BadgeCheck, Building2, ShieldCheck } from 'lucide-react';
import { register as registerApi, verifyOtp as verifyOtpApi } from '../../services/authApi.js';
import { setCredentials } from '../../store/authSlice.js';
import { uploadFile } from '../../services/api.js';
import { showToast } from '../../components/common/Toast.jsx';

const ROLES = [
  { value: 'officer', label: 'Procurement Officer', desc: 'Creates RFQs, manages vendors', Icon: ClipboardList },
  { value: 'manager', label: 'Procurement Manager', desc: 'Approves quotes & purchase orders', Icon: BadgeCheck },
  { value: 'vendor', label: 'Vendor Partner', desc: 'Submits quotations for RFQs', Icon: Building2 },
  { value: 'admin', label: 'Administrator', desc: 'Full system access', Icon: ShieldCheck },
];

const FieldInput = ({ label, type = 'text', placeholder, value, onChange, icon: Icon, rightNode, half }) => (
  <div style={{ marginBottom: '16px', ...(half ? {} : {}) }}>
    {label && (
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B6860', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      {Icon && <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#9B9890' }}><Icon size={15} /></span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%', padding: Icon ? '10px 38px 10px 36px' : '10px 14px',
          paddingRight: rightNode ? '40px' : undefined,
          fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
          color: '#111111', backgroundColor: '#F7F6F3',
          border: '1.5px solid #E5E3DE', borderRadius: '7px',
          outline: 'none', transition: 'all 0.15s',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#E8A020'; e.target.style.boxShadow = '0 0 0 3px rgba(232,160,32,0.12)'; e.target.style.backgroundColor = '#FFFFFF'; }}
        onBlur={(e) => { e.target.style.borderColor = '#E5E3DE'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#F7F6F3'; }}
      />
      {rightNode && <span style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9B9890' }}>{rightNode}</span>}
    </div>
  </div>
);

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=form 2=otp

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState('officer');
  const [phone, setPhone]         = useState('');
  const [country, setCountry]     = useState('');
  const [avatar, setAvatar]       = useState(null);
  const [otp, setOtp]             = useState('');

  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) { setError('Please fill in all required fields.'); return; }
    setLoading(true); setError('');
    try {
      await registerApi({ firstName, lastName, email, password, role, phone, country, avatar });
      showToast('Account created! Check your email for the OTP.');
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg); showToast(msg, 'error');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) { setError('Please enter the OTP.'); return; }
    setLoading(true); setError('');
    try {
      const res = await verifyOtpApi({ email, otp });
      const { accessToken, user } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      dispatch(setCredentials({ user }));
      showToast('Account verified! Welcome to VendorBridge.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP.';
      setError(msg); showToast(msg, 'error');
    } finally { setLoading(false); }
  };

  const handleAvatarUpload = async (file) => {
    setUploading(true);
    try {
      const res = await uploadFile(file, '/avatars');
      setAvatar({ url: res.url, fileId: res.fileId, name: res.name });
      showToast('Photo uploaded!');
    } catch { showToast('Upload failed', 'error'); }
    finally { setUploading(false); }
  };

  /* ── OTP Step ── */
  if (step === 2) {
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(232,160,32,0.1)', border: '2px solid #E8A020', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={28} color="#E8A020" />
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', fontWeight: 400, color: '#111111', marginBottom: '8px' }}>
            Verify your email
          </h2>
          <p style={{ fontSize: '14px', color: '#6B6860', lineHeight: 1.6 }}>
            We sent a 6-digit code to<br /><strong style={{ color: '#111111' }}>{email}</strong>
          </p>
        </div>

        {error && (
          <div style={{ padding: '11px 14px', backgroundColor: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '7px', color: '#DC2626', fontSize: '13px', marginBottom: '20px', fontWeight: 500 }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B6860', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="• • • • • •"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              style={{
                width: '100%', padding: '16px', textAlign: 'center',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '28px', fontWeight: 700, letterSpacing: '16px',
                color: '#111111', backgroundColor: '#F7F6F3',
                border: '1.5px solid #E5E3DE', borderRadius: '7px', outline: 'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#E8A020'; e.target.style.boxShadow = '0 0 0 3px rgba(232,160,32,0.12)'; e.target.style.backgroundColor = '#FFFFFF'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E3DE'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#F7F6F3'; }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', backgroundColor: loading ? '#C8880A' : '#E8A020', border: 'none', borderRadius: '7px', fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 700, color: '#111111', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? 'Verifying…' : (<>Verify & Continue <ArrowRight size={16} /></>)}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#9B9890', marginTop: '20px' }}>
          Wrong email?{' '}
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#E8A020', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
            Go back
          </button>
        </p>
      </div>
    );
  }

  /* ── Registration Step ── */
  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', fontWeight: 400, color: '#111111', marginBottom: '6px' }}>
          Create your account
        </h2>
        <p style={{ fontSize: '14px', color: '#6B6860' }}>
          Already have one?{' '}
          <Link to="/login" style={{ color: '#E8A020', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>

      {error && (
        <div style={{ padding: '11px 14px', backgroundColor: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '7px', color: '#DC2626', fontSize: '13px', marginBottom: '20px', fontWeight: 500 }}>
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleRegister}>
        {/* Avatar upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px', padding: '14px', backgroundColor: '#F7F6F3', borderRadius: '8px', border: '1px solid #E5E3DE' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #E5E3DE', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatar ? (
              <img src={avatar.url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={22} color="#9B9890" />
            )}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#111111', margin: '0 0 4px' }}>Profile Photo</p>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#E8A020', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
              <Upload size={13} />{uploading ? 'Uploading…' : 'Upload photo'}
              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={(e) => e.target.files[0] && handleAvatarUpload(e.target.files[0])} />
            </label>
          </div>
        </div>

        {/* Name row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldInput label="First Name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} icon={User} />
          <FieldInput label="Last Name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <FieldInput label="Email Address" type="email" placeholder="john@company.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={Mail} />

        <FieldInput
          label="Password"
          type={showPwd ? 'text' : 'password'}
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          rightNode={<span onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</span>}
        />

        {/* Role selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B6860', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Your Role
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {ROLES.map(({ value, label, desc, Icon: RoleIcon }) => (
              <button
                key={value} type="button"
                onClick={() => setRole(value)}
                style={{
                  padding: '11px 12px', borderRadius: '7px', cursor: 'pointer', textAlign: 'left',
                  border: role === value ? '1.5px solid #E8A020' : '1.5px solid #E5E3DE',
                  backgroundColor: role === value ? 'rgba(232,160,32,0.06)' : '#F7F6F3',
                  transition: 'all 0.12s', display: 'flex', alignItems: 'flex-start', gap: '10px',
                }}
              >
                <div style={{ marginTop: '1px', color: role === value ? '#E8A020' : '#9B9890', flexShrink: 0 }}>
                  <RoleIcon size={15} strokeWidth={2} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: role === value ? '#111111' : '#6B6860', margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>
                    {label}
                  </p>
                  <p style={{ fontSize: '11px', color: '#9B9890', margin: 0, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Phone + Country */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldInput label="Phone" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} icon={Phone} />
          <FieldInput label="Country" placeholder="India" value={country} onChange={(e) => setCountry(e.target.value)} icon={Globe} />
        </div>

        <button
          type="submit" disabled={loading || uploading}
          style={{ width: '100%', padding: '13px', backgroundColor: (loading || uploading) ? '#C8880A' : '#E8A020', border: 'none', borderRadius: '7px', fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 700, color: '#111111', cursor: (loading || uploading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', transition: 'background 0.15s' }}
          onMouseEnter={(e) => { if (!loading && !uploading) e.currentTarget.style.backgroundColor = '#C8880A'; }}
          onMouseLeave={(e) => { if (!loading && !uploading) e.currentTarget.style.backgroundColor = '#E8A020'; }}
        >
          {loading ? 'Creating account…' : (<>Create Account <ArrowRight size={16} /></>)}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '12px', color: '#9B9890', marginTop: '20px', lineHeight: 1.6 }}>
        By registering you agree to our{' '}
        <span style={{ color: '#6B6860', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span>
        {' '}&amp;{' '}
        <span style={{ color: '#6B6860', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>.
      </p>
    </div>
  );
}
