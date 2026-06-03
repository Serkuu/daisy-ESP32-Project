import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

function AddPlant() {
  const [file, setFile] = useState(null);
  const [base64Image, setBase64Image] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [gardens, setGardens] = useState([]);
  const [selectedGarden, setSelectedGarden] = useState('');

  const [plantData, setPlantData] = useState({
    plantName: '',
    plantSpecies: '',
    plantDescription: '',
    sunlightPreference: '',
    wateringIntervalSummer: '',
    wateringIntervalWinter: '',
    optimalMoistureLevel: '',
    isToxicToPets: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGardens = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return navigate('/login');

      try {
        const res = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:3000') + '/garden', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGardens(data);
          if (data.length > 0) setSelectedGarden(data[0].id);
        }
      } catch (e) {
        console.error("Failed to fetch gardens", e);
      }
    };
    fetchGardens();
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const identifyPlant = async () => {
    if (!base64Image) return;

    setLoadingAI(true);
    setError('');

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:3000') + '/plant/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ base64Image })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Błąd API identyfikacji');
      }

      const data = await response.json();

      setPlantData({
        plantName: data.plantName || '',
        plantSpecies: data.plantSpecies || '',
        plantDescription: data.plantDescription || '',
        sunlightPreference: data.sunlightPreference || '',
        wateringIntervalSummer: data.wateringIntervalSummer || '',
        wateringIntervalWinter: data.wateringIntervalWinter || '',
        optimalMoistureLevel: data.optimalMoistureLevel || '',
        isToxicToPets: data.isToxicToPets || false
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSavePlant = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:3000') + '/plant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...plantData,
          gardenId: Number(selectedGarden),
          imageUrl: base64Image
        })
      });

      if (!response.ok) {
        throw new Error('Nie udało się zapisać rośliny w bazie.');
      }

      navigate('/dashboard', { state: { successMessage: 'Roślina pomyślnie dodana!' } });

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '48px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px' }}>Skanuj Roślinę</h1>
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

      <div style={{ backgroundColor: 'var(--color-canvas)', padding: '32px', borderRadius: 'var(--rounded-xl)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Krok 1: Zrób zdjęcie rośliny</h2>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ marginBottom: '16px' }}
        />

        {base64Image && (
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <img src={base64Image} alt="Podgląd" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
          </div>
        )}

        <Button onClick={identifyPlant} disabled={!base64Image || loadingAI} fullWidth>
          {loadingAI ? 'Analizowanie' : 'Rozpoznaj gatunek automatycznie'}
        </Button>
      </div>

      {plantData.plantSpecies && (
        <form onSubmit={handleSavePlant} style={{ backgroundColor: 'var(--color-canvas)', padding: '32px', borderRadius: 'var(--rounded-xl)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Krok 2: Zweryfikuj i Zapisz</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Polska Nazwa</label>
              <input
                type="text"
                value={plantData.plantName}
                onChange={e => setPlantData({ ...plantData, plantName: e.target.value })}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-mute)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Gatunek Łaciński</label>
              <input
                type="text"
                value={plantData.plantSpecies}
                readOnly
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-mute)', backgroundColor: '#f5f5f5' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Opis pielęgnacji</label>
            <textarea
              value={plantData.plantDescription}
              onChange={e => setPlantData({ ...plantData, plantDescription: e.target.value })}
              rows="3"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-mute)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Podlewanie (Lato)</label>
              <input
                type="number"
                value={plantData.wateringIntervalSummer}
                onChange={e => setPlantData({ ...plantData, wateringIntervalSummer: Number(e.target.value) })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-mute)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Słońce</label>
              <input
                type="text"
                value={plantData.sunlightPreference}
                onChange={e => setPlantData({ ...plantData, sunlightPreference: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-mute)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Toksyczna?</label>
              <input
                type="checkbox"
                checked={plantData.isToxicToPets}
                onChange={e => setPlantData({ ...plantData, isToxicToPets: e.target.checked })}
                style={{ marginTop: '12px', transform: 'scale(1.5)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Przypisz do ogrodu</label>
            <select
              value={selectedGarden}
              onChange={e => setSelectedGarden(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-mute)' }}
            >
              <option value="">Wybierz ogród...</option>
              {gardens.map(g => <option key={g.id} value={g.id}>{g.gardenName || g.name}</option>)}
            </select>
          </div>

          <Button type="submit" fullWidth disabled={saving || !selectedGarden}>
            {saving ? 'Zapisywanie w bazie...' : 'Zapisz Roślinę'}
          </Button>
        </form>
      )}

    </div>
  );
}

export default AddPlant;
