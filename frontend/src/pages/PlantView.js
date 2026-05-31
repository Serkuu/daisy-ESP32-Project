import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { WateringCanIcon, CalendarIcon, CrossIcon } from '../components/Icons';

function PlantView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dateInputRef = useRef(null);

  useEffect(() => {
    const fetchPlantDetails = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/plant/${id}`, {
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
          throw new Error('Nie udało się pobrać szczegółów rośliny.');
        }

        const data = await response.json();
        setPlant(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantDetails();
  }, [id, navigate]);

  const handleDeletePlant = async () => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę roślinę?')) {
      return;
    }

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:3000/plant/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Nie udało się usunąć rośliny.');
      }

      navigate(-1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateWatering = async (newDate) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:3000/plant/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lastWateredAt: newDate ? new Date(newDate).toISOString() : null })
      });

      if (!response.ok) {
        throw new Error('Nie udało się zaktualizować daty podlewania.');
      }

      const updatedPlant = await response.json();
      setPlant(updatedPlant);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <p style={{ color: 'var(--color-mute)', fontSize: '18px' }}>Wczytywanie rośliny...</p>
      </div>
    );
  }

  if (error || !plant) {
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
          <span>{error || 'Roślina nie istnieje.'}</span>
          <button type="button" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
        </div>
        <Button onClick={() => navigate(-1)}>Wróć</Button>
      </div>
    );
  }

  const calculateNextWatering = () => {
    if (!plant.lastWateredAt) return "Brak danych o podlewaniu";

    const interval = plant.wateringIntervalSummer || 7;
    const lastWateredDate = new Date(plant.lastWateredAt);
    const nextWateringDate = new Date(lastWateredDate.getTime() + interval * 24 * 60 * 60 * 1000);
    const today = new Date();

    const diffTime = nextWateringDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Spóźniono o ${Math.abs(diffDays)} dni`;
    if (diffDays === 0) return "Podlej dzisiaj";
    if (diffDays === 1) return "Podlej jutro";
    return `Za ${diffDays} dni`;
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>{plant.plantName}</h1>
          <p style={{ color: 'var(--color-primary-active)', fontSize: '18px', fontWeight: '600' }}>
            {plant.plantSpecies}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button variant="secondary" onClick={() => navigate(-1)}>Wróć</Button>
          <Button variant="danger" onClick={handleDeletePlant}>Usuń roślinę</Button>
        </div>
      </div>

      <div style={{
        backgroundColor: 'var(--color-canvas)',
        borderRadius: 'var(--rounded-xl)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '40px'
      }}>
        {plant.imageUrl ? (
          <img src={plant.imageUrl} alt={plant.plantName} style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
        ) : (
          <div style={{
            height: '400px',
            backgroundColor: 'var(--color-mute)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '64px'
          }}>
            🌱
          </div>
        )}

        <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Opis pielęgnacji</h2>
            <p style={{ color: 'var(--color-mute)', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
              {plant.plantDescription || 'Brak opisu dla tej rośliny.'}
            </p>

            <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>Podlewanie</h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={() => handleUpdateWatering(new Date())}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%', border: 'none',
                  backgroundColor: '#3b82f6', color: '#fff', fontSize: '32px',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
                  transition: 'transform 0.1s'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Podlej teraz"
              >
                <WateringCanIcon size={48} />
              </button>

              {plant.lastWateredAt && (
                <>
                  <div style={{ position: 'relative' }}>
                    <input
                      ref={dateInputRef}
                      type="date"
                      onChange={(e) => {
                        if (e.target.value) handleUpdateWatering(e.target.value);
                      }}
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '0', height: '0',
                        opacity: 0, pointerEvents: 'none'
                      }}
                      title="Zmień datę podlania"
                    />
                    <button
                      onClick={() => {
                        if (dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') {
                          dateInputRef.current.showPicker();
                        } else {
                          alert("Twoja przeglądarka nie obsługuje automatycznego otwierania kalendarza.");
                        }
                      }}
                      style={{
                        width: '64px', height: '64px', borderRadius: '50%', border: 'none',
                        backgroundColor: '#f59e0b', color: '#fff', fontSize: '24px',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        cursor: 'pointer', boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      <CalendarIcon size={32} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleUpdateWatering(null)}
                    style={{
                      width: '64px', height: '64px', borderRadius: '50%', border: 'none',
                      backgroundColor: '#966995', color: '#fff', fontSize: '24px',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      cursor: 'pointer', boxShadow: '0 4px 10px rgba(150, 105, 149, 0.3)',
                      transition: 'transform 0.1s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    title="Cofnij podlanie"
                  >
                    <CrossIcon size={32} />
                  </button>
                </>
              )}
            </div>
            {plant.lastWateredAt && (
              <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--color-mute)' }}>
                Ostatnio podlano: {new Date(plant.lastWateredAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <span style={{ fontWeight: '600' }}>Stanowisko:</span>
              <span style={{ color: 'var(--color-mute)' }}>{plant.sunlightPreference || 'Nieznane'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <span style={{ fontWeight: '600' }}>Podlewanie (lato):</span>
              <span style={{ color: 'var(--color-mute)' }}>Co {plant.wateringIntervalSummer} dni</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <span style={{ fontWeight: '600' }}>Podlewanie (zima):</span>
              <span style={{ color: 'var(--color-mute)' }}>Co {plant.wateringIntervalWinter} dni</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <span style={{ fontWeight: '600' }}>Toksyczność:</span>
              <span style={{ color: 'var(--color-mute)' }}>{plant.isToxicToPets ? 'Toksyczna dla zwierząt' : 'Bezpieczna dla zwierząt'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--color-surface)', padding: '16px', borderRadius: 'var(--rounded-md)', marginTop: '8px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--color-primary-active)' }}>Kiedy podlać?</span>
              <span style={{ fontWeight: 'bold' }}>{calculateNextWatering()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlantView;
