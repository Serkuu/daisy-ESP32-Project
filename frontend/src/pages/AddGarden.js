import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

function AddGarden() {
  const [gardenName, setGardenName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSaveGarden = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:3000') + '/garden', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gardenName })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Nie udało się stworzyć ogrodu.');
      }

      navigate('/dashboard', { state: { successMessage: 'Ogród został stworzony!' } });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
      <div className="mobile-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', gap: '16px' }}>
        <h1 style={{ fontSize: 'var(--font-size-h1, 36px)', textAlign: 'center' }}>Nowy Ogród</h1>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>Wróć</Button>
      </div>

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

      <form onSubmit={handleSaveGarden} style={{ backgroundColor: 'var(--color-canvas)', padding: '32px', borderRadius: 'var(--rounded-xl)' }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Nazwa Ogrodu</label>
          <input
            type="text"
            value={gardenName}
            onChange={e => setGardenName(e.target.value)}
            placeholder="Nazwa Twojego ogrodu"
            required
            minLength={3}
            maxLength={30}
            style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-mute)', fontSize: '16px' }}
          />
        </div>

        <Button type="submit" fullWidth disabled={loading || gardenName.length < 3}>
          {loading ? 'Tworzenie...' : 'Stwórz Ogród'}
        </Button>
      </form>
    </div>
  );
}

export default AddGarden;
