import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Star, Thermometer, Droplets, ArrowRight, Sprout, Plus, Wifi, WifiOff, Trees } from 'lucide-react';

function Dashboard() {
  const [gardens, setGardens] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [headUnits, setHeadUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [liveData, setLiveData] = useState({ temp: null, moist: null, macAddress: null });
  const navigate = useNavigate();

  const fetchGardens = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const gardenRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/garden`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sensorRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/sensor`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const headUnitRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/head-unit`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (gardenRes.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login');
        return;
      }

      if (gardenRes.ok) {
        const data = await gardenRes.json();
        setGardens(data);
      }
      if (sensorRes.ok) setSensors(await sensorRes.json());
      if (headUnitRes.ok) setHeadUnits(await headUnitRes.json());

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchGardens();

    const ws = new WebSocket((process.env.REACT_APP_WS_URL || 'ws://localhost:3000') + '/head-unit');
    ws.onopen = () => console.log('Połączono z serwerem WebSocket (HeadUnit - Dashboard)');
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
      } catch (err) { }
    };
    return () => ws.close();
  }, [fetchGardens]);

  const handleToggleFavorite = async (e, gardenId) => {
    e.stopPropagation();

    setGardens(prevGardens => prevGardens.map(g => ({
      ...g,
      isFavorite: g.id === gardenId ? !g.isFavorite : false
    })));

    const token = localStorage.getItem('access_token');
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/garden/${gardenId}/favorite`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchGardens();
    } catch (err) {
      console.error(err);
      fetchGardens();
    }
  };

  const favoriteGarden = gardens.find(g => g.isFavorite);
  const totalPlants = gardens.reduce((acc, g) => acc + (g.plants?.length || 0), 0);
  const headUnitHistory = favoriteGarden?.headUnit?.history?.[0];
  const isLive = favoriteGarden?.headUnit && (
    (liveData.macAddress === favoriteGarden.headUnit.macAddress) ||
    (headUnitHistory && (new Date() - new Date(headUnitHistory.createdAt) < 60 * 1000))
  );
  const displayTemp = (liveData.macAddress === favoriteGarden?.headUnit?.macAddress && liveData.temp !== null)
    ? liveData.temp
    : (headUnitHistory ? headUnitHistory.tempLevel : null);
  const displayMoist = (liveData.macAddress === favoriteGarden?.headUnit?.macAddress && liveData.moist !== null)
    ? liveData.moist
    : (headUnitHistory ? headUnitHistory.moistLevel : null);
  if (loading) {
    return <p style={{ color: 'var(--color-mute)', fontSize: '18px' }}>Wczytywanie...</p>;
  }

  const renderSwitch = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '14px', color: !showFavoriteOnly ? 'var(--color-primary-active)' : 'var(--color-mute)', fontWeight: !showFavoriteOnly ? 'bold' : 'normal' }}>Wszystkie</span>
      <div
        onClick={() => setShowFavoriteOnly(!showFavoriteOnly)}
        style={{ width: '48px', height: '24px', backgroundColor: showFavoriteOnly ? 'var(--color-primary-active)' : '#cbd5e1', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s' }}
      >
        <div style={{ width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: showFavoriteOnly ? '26px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}></div>
      </div>
      <span style={{ fontSize: '14px', color: showFavoriteOnly ? 'var(--color-primary-active)' : 'var(--color-mute)', fontWeight: showFavoriteOnly ? 'bold' : 'normal' }}>Ulubiony</span>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

      <div className="mobile-wrap mobile-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', gap: '16px' }}>
        <div className="mobile-center">
          <h1 style={{ fontSize: 'var(--font-size-h1, 32px)', marginBottom: '8px' }}>Twoje ogrody</h1>
          <p className="hide-on-mobile" style={{ color: 'var(--color-mute)', fontSize: '16px' }}>Monitoruj swoje rośliny</p>
        </div>
        {!showFavoriteOnly && (
          <Button onClick={() => navigate('/add-garden')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} />
            Dodaj Ogród
          </Button>
        )}
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--color-negative-deep)', color: '#ffffff', padding: '16px', borderRadius: 'var(--rounded-md)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600' }}>
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
        </div>
      )}



      {showFavoriteOnly ? (
        favoriteGarden ? (
          <div style={{ marginBottom: '64px' }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'center', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Star size={28} color="var(--color-secondary)" fill="var(--color-secondary)" />
                  <h2 style={{ fontSize: '28px', margin: 0 }}>{favoriteGarden.gardenName}</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: 'var(--rounded-pill)', backgroundColor: isLive ? 'var(--color-primary-pale)' : 'var(--color-canvas)', color: isLive ? 'var(--color-positive-deep)' : 'var(--color-mute)', fontSize: '12px', fontWeight: 'bold', marginLeft: isMobile ? '0' : '16px' }}>
                  {isLive ? <Wifi size={14} /> : <WifiOff size={14} />}
                  {isLive ? 'LIVE' : 'Brak połączenia'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
                {renderSwitch()}
                <Button variant="secondary" onClick={() => navigate(`/add-plant`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-canvas)', border: '1px solid rgba(0,0,0,0.1)' }}>
                  <Plus size={16} /> Dodaj roślinę
                </Button>
              </div>
            </div>



            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
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
                  <p style={{ color: 'var(--color-mute)', fontSize: '14px', marginBottom: '4px' }}>Wilgotność powietrza</p>
                  <p style={{ fontSize: '36px', fontWeight: '800' }}>{displayMoist !== null ? `${displayMoist}%` : '--%'}</p>
                </div>
              </div>
            </div>


            {favoriteGarden.plants && favoriteGarden.plants.length > 0 && (
              <div>
                <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Rośliny w ogrodzie:</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                  {favoriteGarden.plants.map(plant => (
                    <div key={plant.id} className="glass-card" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/plant/${plant.id}`)}>
                      <div style={{ height: '160px', backgroundColor: 'var(--color-mute)', backgroundImage: plant.imageUrl ? `url(${plant.imageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                      <div style={{ padding: '20px' }}>
                        <h4 style={{ fontSize: '20px', marginBottom: '4px' }}>{plant.plantName}</h4>
                        <p style={{ color: 'var(--color-primary-active)', fontWeight: '600', fontSize: '14px', marginBottom: '12px' }}>{plant.plantSpecies}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-mute)', fontSize: '12px' }}>
                          <span>Co {plant.wateringIntervalSummer} dni</span>
                          <span>{plant.isToxicToPets ? 'Toksyczna' : 'Bezpieczna'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '64px', textAlign: 'center', marginBottom: '48px', position: 'relative' }}>
            <div className="mobile-center" style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              {renderSwitch()}
            </div>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: 'var(--color-primary-pale)', color: 'var(--color-positive-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Star size={40} />
            </div>
            <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Brak ulubionego ogrodu</h2>
            <p style={{ color: 'var(--color-mute)', fontSize: '18px', maxWidth: '500px', margin: '0 auto 32px' }}>
              Wybierz ulubiony ogród gwiazdką, aby wyświetlić tutaj szczegółowe informacje.
            </p>
          </div>
        )
      ) : (
        gardens.length > 0 && (
          <div>
            <div className="mobile-wrap mobile-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>Wszystkie Ogrody</h2>
              {renderSwitch()}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {gardens.map(garden => (
                <div key={garden.id} style={{ position: 'relative' }}>
                  <div
                    style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '32px', color: garden.isFavorite ? 'var(--color-secondary)' : '#cbd5e1', cursor: 'pointer', zIndex: 10, lineHeight: 1, userSelect: 'none' }}
                    onClick={(e) => handleToggleFavorite(e, garden.id)}
                    title={garden.isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                  >
                    {garden.isFavorite ? '★' : '☆'}
                  </div>
                  <div className="glass-card" style={{ padding: '32px', cursor: 'pointer', height: '100%' }} onClick={() => navigate(`/garden/${garden.id}`)}>
                    <h3 style={{ fontSize: '24px', marginBottom: '8px', paddingRight: '32px' }}>{garden.gardenName}</h3>
                    <p style={{ color: 'var(--color-mute)', fontSize: '16px' }}>Liczba roślin: {garden.plants?.length || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {gardens.length === 0 && (
        <div className="glass-card" style={{ padding: '64px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Nie masz jeszcze żadnego ogrodu</h2>
          <Button onClick={() => navigate('/add-garden')}>Stwórz pierwszy ogród</Button>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
