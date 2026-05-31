import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

function GardenView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [garden, setGarden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGardenDetails = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/garden/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Nie udało się pobrać szczegółów ogrodu.');
        }

        const data = await response.json();
        setGarden(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGardenDetails();
  }, [id, navigate]);

  const handleDeleteGarden = async () => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten ogród? Rośliny zostaną zachowane bez przypisanego miejsca.')) {
      return;
    }

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:3000/garden/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Nie udało się usunąć ogrodu.');
      }

      navigate('/dashboard', { state: { successMessage: 'Ogród został pomyślnie usunięty.' } });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <p style={{ color: 'var(--color-mute)', fontSize: '18px' }}>Wczytywanie ogrodu...</p>
      </div>
    );
  }

  if (error || !garden) {
    return (
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
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
          <span>{error || 'Ogród nie istnieje.'}</span>
          <button type="button" onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
        </div>
        <Button onClick={() => navigate('/dashboard')}>Wróć na Dashboard</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>{garden.gardenName}</h1>
          <p style={{ color: 'var(--color-mute)', fontSize: '16px' }}>
            {garden.plants?.length || 0} roślin w tym ogrodzie
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>Wróć</Button>
          <Button onClick={() => navigate('/add-plant')}>Dodaj roślinę</Button>
          <Button variant="danger" onClick={handleDeleteGarden}>Usuń ogród</Button>
        </div>
      </div>

      {!garden.plants || garden.plants.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--color-canvas)',
          padding: '64px',
          borderRadius: 'var(--rounded-xl)',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Twój ogród jest pusty</h2>
          <p style={{ color: 'var(--color-mute)', marginBottom: '32px', fontSize: '16px' }}>
            Dodaj swoją pierwszą roślinę i zacznij ją monitorować.
          </p>
          <Button onClick={() => navigate('/add-plant')}>Zeskanuj roślinę</Button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {garden.plants.map(plant => (
            <div key={plant.id} style={{
              backgroundColor: 'var(--color-canvas)',
              borderRadius: 'var(--rounded-xl)',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => navigate(`/plant/${plant.id}`)}
            >
              <div style={{
                height: '200px',
                backgroundColor: 'var(--color-mute)',
                backgroundImage: plant.imageUrl ? `url(${plant.imageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
              </div>
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '24px', marginBottom: '4px' }}>{plant.plantName}</h3>
                <p style={{ color: 'var(--color-primary-active)', fontWeight: '600', marginBottom: '16px' }}>{plant.plantSpecies}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-mute)', fontSize: '14px' }}>
                  <span>Co {plant.wateringIntervalSummer} dni (lato)</span>
                  <span>{plant.isToxicToPets ? 'Toksyczna dla zwierząt' : 'Bezpieczna dla zwierząt'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GardenView;
