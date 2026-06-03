import React, { useState, useEffect } from 'react';
import Button from './Button';

function DeviceAssignModal({ isOpen, onClose, deviceType, deviceMac, gattServer, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targets, setTargets] = useState([]);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [step, setStep] = useState(1);
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchTargets = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const endpoint = deviceType === 'headunit' ? (process.env.REACT_APP_API_URL || 'http://localhost:3000') + '/garden' : (process.env.REACT_APP_API_URL || 'http://localhost:3000') + '/plant';
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
      const endpoint = deviceType === 'headunit' ? (process.env.REACT_APP_API_URL || 'http://localhost:3000') + '/head-unit' : (process.env.REACT_APP_API_URL || 'http://localhost:3000') + '/sensor';
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

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProvisionWifi = async () => {
    if (!wifiSsid) {
      setError('Nazwa sieci Wi-Fi jest wymagana.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      if (!gattServer || !gattServer.connected) {
        throw new Error('Połączenie Bluetooth zostało utracone. Upewnij się, że urządzenie jest blisko.');
      }

      const WIFI_PROV_SERVICE = '12345678-1234-5678-1234-56789abcdef0';
      const WIFI_PROV_CHAR = '12345678-1234-5678-1234-56789abcdef1';

      const service = await gattServer.getPrimaryService(WIFI_PROV_SERVICE);
      const characteristic = await service.getCharacteristic(WIFI_PROV_CHAR);

      const payload = JSON.stringify({ ssid: wifiSsid, pass: wifiPass });
      const encoder = new TextEncoder();
      await characteristic.writeValue(encoder.encode(payload));

      onSuccess();
      onClose();
    } catch (err) {
      setError('Błąd przesyłania konfiguracji Wi-Fi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setWifiSsid('');
      setWifiPass('');
      setError('');
    }
  }, [isOpen]);

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
          {step === 1 ? 'Przypisz urządzenie' : 'Konfiguracja Wi-Fi'}
        </h2>

        {step === 1 && (
          <>
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
                {loading ? 'Parowanie...' : 'Dalej'}
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ color: 'var(--color-mute)', marginBottom: '16px' }}>
              Prześlij dane dostępowe do swojej sieci Wi-Fi bezpośrednio na urządzenie
            </p>

            {error && <p style={{ color: 'var(--color-negative)', marginBottom: '16px', fontWeight: 'bold' }}>{error}</p>}

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Nazwa sieci Wi-Fi (SSID):
            </label>
            <input
              type="text"
              value={wifiSsid}
              onChange={(e) => setWifiSsid(e.target.value)}
              placeholder="Nazwa Twojej sieci Wi-Fi"
              style={{
                width: '100%', padding: '12px', borderRadius: 'var(--rounded-md)',
                border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '16px'
              }}
            />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Hasło Wi-Fi (opcjonalne - zostaw puste, jeśli sieć jest otwarta):
            </label>
            <input
              type="password"
              value={wifiPass}
              onChange={(e) => setWifiPass(e.target.value)}
              placeholder="Hasło do Twojej sieci Wi-Fi"
              style={{
                width: '100%', padding: '12px', borderRadius: 'var(--rounded-md)',
                border: '1px solid #e2e8f0', marginBottom: '24px', fontSize: '16px'
              }}
            />

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <Button onClick={handleProvisionWifi} disabled={loading || !wifiSsid} fullWidth>
                {loading ? 'Przesyłanie...' : 'Prześlij hasło na ESP32'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DeviceAssignModal;
