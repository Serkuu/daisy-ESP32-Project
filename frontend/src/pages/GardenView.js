import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import { Thermometer, Droplets, Wifi, WifiOff } from 'lucide-react';

function GardenView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [garden, setGarden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [liveData, setLiveData] = useState({ temp: null, moist: null });

  const fetchGardenDetails = React.useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/garden/${id}`, {
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
  }, [id, navigate]);

  useEffect(() => {
    fetchGardenDetails();

    const ws = new WebSocket((process.env.REACT_APP_WS_URL || 'ws://localhost:3000') + '/head-unit');

    ws.onopen = () => console.log('Połączono z serwerem WebSocket (HeadUnit)');

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event === 'telemetry_update' && message.data) {
          setLiveData({
            temp: message.data.tempLevel,
            moist: message.data.moistLevel,
            macAddress: message.data.macAddress
          });
        }
      } catch (err) {
        console.error('Błąd parsowania WS', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [fetchGardenDetails]);

  const handleDeleteGardenClick = () => {
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteModalOpen(false);
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/garden/${id}`, {
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
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="secondary" onClick={() => navigate('/dashboard')} style={{ padding: '12px 32px', backgroundColor: 'var(--color-canvas)', border: '2px solid var(--color-ink)', color: 'var(--color-ink)' }}>Wróć</Button>
            <h1 style={{ fontSize: '32px', margin: 0, fontWeight: '800' }}>{garden.gardenName}</h1>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <Button onClick={() => navigate('/add-plant')} style={{ flex: 1 }}>Dodaj roślinę</Button>
            <Button onClick={handleDeleteGardenClick} style={{ flex: 1, backgroundColor: '#fcd34d', color: '#000', border: 'none' }}>Usuń ogród</Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-h1, 32px)', marginBottom: '8px', textAlign: 'left' }}>{garden.gardenName}</h1>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Wróć</Button>
            <Button onClick={() => navigate('/add-plant')}>Dodaj roślinę</Button>
            <Button variant="danger" onClick={handleDeleteGardenClick}>Usuń ogród</Button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <div>
          {garden.headUnit ? (() => {
            const headUnitHistory = garden.headUnit.history?.[0];
            const isHeadUnitLive = (liveData.macAddress === garden.headUnit.macAddress) || 
                                   (headUnitHistory && (new Date() - new Date(headUnitHistory.createdAt) < 60 * 1000));
            const displayTemp = (liveData.macAddress === garden.headUnit.macAddress && liveData.temp !== null) 
                                ? liveData.temp 
                                : (headUnitHistory ? headUnitHistory.tempLevel : null);
            const displayMoist = (liveData.macAddress === garden.headUnit.macAddress && liveData.moist !== null) 
                                 ? liveData.moist 
                                 : (headUnitHistory ? headUnitHistory.moistLevel : null);

            return (
            <div>
              <div className="mobile-col" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <p style={{ color: 'var(--color-primary-active)', fontWeight: '600', fontSize: '16px', textAlign: 'center' }}>
                  daisyHeadUnit sparowana: {garden.headUnit.macAddress}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: 'var(--rounded-pill)', backgroundColor: isHeadUnitLive ? 'var(--color-primary-pale)' : 'var(--color-canvas)', color: isHeadUnitLive ? 'var(--color-positive-deep)' : 'var(--color-mute)', fontSize: '12px', fontWeight: 'bold' }}>
                  {isHeadUnitLive ? <Wifi size={14} /> : <WifiOff size={14} />}
                  {isHeadUnitLive ? 'LIVE' : 'Brak połączenia'}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                <div className="glass-card" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c2410c' }}>
                    <Thermometer size={32} />
                  </div>
                  <div>
                    <p style={{ color: 'var(--color-mute)', fontSize: '14px', marginBottom: '4px' }}>Temperatura</p>
                    <p style={{ fontSize: '36px', fontWeight: '800' }}>{displayTemp !== null ? `${displayTemp.toFixed(1)}°C` : '--°C'}</p>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1' }}>
                    <Droplets size={32} />
                  </div>
                  <div>
                    <p style={{ color: 'var(--color-mute)', fontSize: '14px', marginBottom: '4px' }}>Wilgotność pow.</p>
                    <p style={{ fontSize: '36px', fontWeight: '800' }}>{displayMoist !== null ? `${displayMoist}%` : '--%'}</p>
                  </div>
                </div>
              </div>
            </div>
            );
          })() : (
            <p style={{ color: 'var(--color-mute)', fontSize: '16px' }}>
              Brak sparowanego daisyHeadUnit dla tego ogrodu
            </p>
          )}
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
            Dodaj swoją pierwszą roślinę
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
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Usuń ogród"
        message="Czy na pewno chcesz usunąć ten ogród? Znajdujące się w nim rośliny zostaną zachowane bez przypisanego miejsca."
        confirmText="Usuń"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default GardenView;
