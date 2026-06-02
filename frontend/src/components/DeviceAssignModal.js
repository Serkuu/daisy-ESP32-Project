import React, { useState, useEffect } from 'react';
import Button from './Button';

function DeviceAssignModal({ isOpen, onClose, deviceType, deviceMac, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targets, setTargets] = useState([]);
  const [selectedTargetId, setSelectedTargetId] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchTargets = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const endpoint = deviceType === 'headunit' ? 'http://localhost:3000/garden' : 'http://localhost:3000/plant';
        const res = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Nie udało się pobrać opcji przypisania.');
        const data = await res.json();
        setTargets(data);
        if (data.length > 0) setSelectedTargetId(data[0].id);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchTargets();
  }, [isOpen, deviceType]);

  const handleAssign = async () => {
    if (!selectedTargetId) {
      setError('Wybierz cel przypisania.');
      return;
    }

    setLoading(true);
    setError('');
    const token = localStorage.getItem('access_token');

    try {
      const endpoint = deviceType === 'headunit' ? 'http://localhost:3000/head-unit' : 'http://localhost:3000/sensor';
      const body = deviceType === 'headunit'
        ? { macAddress: deviceMac, gardenId: parseInt(selectedTargetId) }
        : { macAddress: deviceMac, plantId: parseInt(selectedTargetId) };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        throw new Error('Błąd podczas parowania. Upewnij się, że urządzenie nie jest już powiązane.');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 'var(--rounded-xl)', padding: '32px',
        width: '400px', maxWidth: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
          Przypisz urządzenie
        </h2>
        <p style={{ color: 'var(--color-mute)', marginBottom: '16px' }}>
          Znaleziono {deviceType === 'headunit' ? 'Bazę (HeadUnit)' : 'Czujnik Gleby (Sensor)'}. Adres MAC: <strong>{deviceMac}</strong>
        </p>

        {error && <p style={{ color: 'var(--color-negative)', marginBottom: '16px', fontWeight: 'bold' }}>{error}</p>}

        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Wybierz {deviceType === 'headunit' ? 'Ogród' : 'Roślinę'}:
        </label>
        <select
          value={selectedTargetId}
          onChange={(e) => setSelectedTargetId(e.target.value)}
          style={{
            width: '100%', padding: '12px', borderRadius: 'var(--rounded-md)',
            border: '1px solid #e2e8f0', marginBottom: '24px', fontSize: '16px'
          }}
        >
          {targets.length === 0 && <option disabled value="">Brak dostępnych opcji</option>}
          {targets.map(t => (
            <option key={t.id} value={t.id}>
              {deviceType === 'headunit' ? t.gardenName : t.plantName}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Anuluj</Button>
          <Button onClick={handleAssign} disabled={loading || targets.length === 0}>
            {loading ? 'Parowanie...' : 'Przypisz'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeviceAssignModal;
