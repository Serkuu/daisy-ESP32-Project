import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

function Register() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:3000') + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = Array.isArray(data.message) ? data.message[0] : data.message;
        throw new Error(errorMessage || 'Wystąpił błąd podczas rejestracji.');
      }

      navigate('/login', { state: { successMessage: 'Konto zostało pomyślnie utworzone! Możesz się teraz zalogować.' } });

    } catch (err) {
      setError(err.message);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: 'var(--rounded-md)',
    border: '1px solid var(--color-mute)',
    fontSize: '16px',
    fontFamily: 'var(--font-family-body)',
    outlineColor: 'var(--color-primary)'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    fontSize: '14px'
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
        <h1 style={{ fontSize: '40px', marginBottom: '8px', textAlign: 'center' }}>Dołącz do nas</h1>
        <p style={{ color: 'var(--color-mute)', textAlign: 'center', marginBottom: '32px', fontSize: '16px' }}>
          Stwórz konto, by dodać swój pierwszy ogród.
        </p>

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Nickname</label>
            <input
              type="text"
              value={nickname} onChange={e => setNickname(e.target.value)}
              placeholder="Nazwa Twojego konta" style={inputStyle} required minLength={3} maxLength={20}
            />
          </div>

          <div>
            <label style={labelStyle}>Adres e-mail</label>
            <input
              type="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com" style={inputStyle} required
            />
          </div>

          <div>
            <label style={labelStyle}>Hasło</label>
            <input
              type="password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inputStyle} required minLength={6}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <Button type="submit" fullWidth>Zarejestruj się</Button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'var(--color-mute)' }}>
          Masz już konto?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary-active)', fontWeight: '600', textDecoration: 'none' }}>
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
