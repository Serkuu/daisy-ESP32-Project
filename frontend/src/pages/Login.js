import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(location.state?.successMessage || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:3000') + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Błędny email lub hasło.');
      }

      console.log("Success, saving JWT token.");
      localStorage.setItem('access_token', data.access_token);
      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'var(--color-canvas)',
        padding: '48px',
        borderRadius: 'var(--rounded-xl)',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ fontSize: '40px', marginBottom: '8px', textAlign: 'center' }}>Witaj z powrotem</h1>
        <p style={{ color: 'var(--color-mute)', textAlign: 'center', marginBottom: '40px', fontSize: '16px' }}>
          Zaloguj się
        </p>

        {success && (
          <div style={{
            backgroundColor: 'var(--color-positive)',
            color: '#ffffff',
            padding: '16px',
            borderRadius: 'var(--rounded-md)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: '600'
          }}>
            <span>{success}</span>
            <button type="button" onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: 'var(--color-negative-deep)',
            color: '#ffffff',
            padding: '16px',
            borderRadius: 'var(--rounded-md)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: '600'
          }}>
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Adres e-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 'var(--rounded-md)',
                border: '1px solid var(--color-mute)',
                fontSize: '16px',
                fontFamily: 'var(--font-family-body)',
                outlineColor: 'var(--color-primary)'
              }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Hasło</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 'var(--rounded-md)',
                border: '1px solid var(--color-mute)',
                fontSize: '16px',
                fontFamily: 'var(--font-family-body)',
                outlineColor: 'var(--color-primary)'
              }}
              required
            />
          </div>

          <div style={{ marginTop: '8px' }}>
            <Button type="submit" fullWidth>Zaloguj się</Button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'var(--color-mute)' }}>
          Nie masz jeszcze konta?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary-active)', fontWeight: '600', textDecoration: 'none' }}>
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
