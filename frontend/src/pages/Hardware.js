import React, { useState, useEffect, useCallback } from 'react';
import Button from '../components/Button';
import XiaoEsp32 from '../components/XiaoEsp32';
import EspDevboard from '../components/EspDevboard';
import DeviceAssignModal from '../components/DeviceAssignModal';
import ConfirmModal from '../components/ConfirmModal';
import { X } from 'lucide-react';

function Hardware() {
  const [gardens, setGardens] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [headUnits, setHeadUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [scannedDeviceType, setScannedDeviceType] = useState(null);
  const [scannedMacAddress, setScannedMacAddress] = useState(null);
  const [gattServer, setGattServer] = useState(null);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

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

      if (gardenRes.ok) setGardens(await gardenRes.json());
      if (sensorRes.ok) setSensors(await sensorRes.json());
      if (headUnitRes.ok) setHeadUnits(await headUnitRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteClick = (type, id, mac) => {
    setDeviceToDelete({ type, id, mac });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deviceToDelete) return;

    setDeleteModalOpen(false);
    const token = localStorage.getItem('access_token');

    try {
      const endpoint = deviceToDelete.type === 'sensor'
        ? `/sensor/${deviceToDelete.id}`
        : `/head-unit/${deviceToDelete.id}`;

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Nie udało się usunąć urządzenia.');
      }

      setSuccess(`Urządzenie ${deviceToDelete.mac} zostało usunięte.`);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const scanBluetoothDevice = async (type) => {
    try {
      setError('');
      setSuccess('');
      console.log(`Rozpoczynam skanowanie BLE dla ${type}...`);

      const serviceUuid = "12345678-1234-5678-1234-56789abcdef0";
      const charUuid = "12345678-1234-5678-1234-56789abcdef2";

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: type === 'sensor' ? 'daisySensor' : 'daisyHeadUnit' }],
        optionalServices: [serviceUuid]
      });

      console.log('Znaleziono urządzenie:', device.name);

      const server = await device.gatt.connect();
      console.log('Połączono z serwerem GATT');
      setGattServer(server);

      const service = await server.getPrimaryService(serviceUuid);
      const characteristic = await service.getCharacteristic(charUuid);
      const value = await characteristic.readValue();
      const decoder = new TextDecoder('utf-8');
      const mac = decoder.decode(value);

      console.log('Odczytany MAC:', mac);

      setScannedDeviceType(type);
      setScannedMacAddress(mac);
      setAssignModalOpen(true);

    } catch (err) {
      console.log('Bluetooth error: ', err);
      if (err.name !== 'NotFoundError') {
        setError('Błąd Bluetooth: ' + err.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="mobile-col mobile-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', gap: '16px' }}>
        <div className="mobile-center">
          <h1 style={{ fontSize: 'var(--font-size-h1, 32px)', marginBottom: '8px' }}>Twoje Urządzenia</h1>
          <p style={{ color: 'var(--color-mute)', fontSize: '16px' }}>Połącz się z swoimi czujnikami daisySensor i stacjami daisyHeadUnit, aby monitorować i optymalizować nawadnianie roślin</p>
        </div>
      </div>

      {success && (
        <div style={{ backgroundColor: 'var(--color-positive)', color: '#ffffff', padding: '16px', borderRadius: 'var(--rounded-md)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600' }}>
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: 'var(--color-negative-deep)', color: '#ffffff', padding: '16px', borderRadius: 'var(--rounded-md)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600' }}>
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }}>
        <Button onClick={() => scanBluetoothDevice('headunit')} style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
          Sparuj daisyHeadUnit
        </Button>
        <Button onClick={() => scanBluetoothDevice('sensor')} style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
          Sparuj daisySensor
        </Button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-mute)' }}>Wczytywanie urządzeń...</p>
      ) : (sensors.length > 0 || headUnits.length > 0) ? (
        <div>
          <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Sparowane urządzenia</h2>
          <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>

            {sensors.map(sensor => {
              const plant = gardens.flatMap(g => g.plants || []).find(p => p.id === sensor.plantId);
              return (
                <div key={`sensor-${sensor.id}`} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <button
                    onClick={() => handleDeleteClick('sensor', sensor.id, sensor.macAddress)}
                    style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-mute)' }}
                    title="Usuń urządzenie"
                  >
                    <X size={20} />
                  </button>
                  <h4 style={{ fontSize: '18px', marginBottom: '24px', color: 'var(--color-primary-active)' }}>daisySensor</h4>
                  <XiaoEsp32 />
                  <div style={{ marginTop: '24px', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--color-mute)', fontSize: '14px' }}>MAC:</span>
                      <strong style={{ fontSize: '14px' }}>{sensor.macAddress}</strong>
                    </div>
                    {plant && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ color: 'var(--color-mute)', fontSize: '14px' }}>Roślina:</span>
                        <strong style={{ fontSize: '14px' }}>{plant.plantName}</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {headUnits.map(unit => {
              const garden = gardens.find(g => g.id === unit.gardenId);
              return (
                <div key={`headunit-${unit.id}`} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <button
                    onClick={() => handleDeleteClick('headunit', unit.id, unit.macAddress)}
                    style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-mute)' }}
                    title="Usuń urządzenie"
                  >
                    <X size={20} />
                  </button>
                  <h4 style={{ fontSize: '18px', marginBottom: '24px', color: 'var(--color-secondary)' }}>daisyHeadUnit</h4>
                  <EspDevboard />
                  <div style={{ marginTop: '24px', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--color-mute)', fontSize: '14px' }}>MAC:</span>
                      <strong style={{ fontSize: '14px' }}>{unit.macAddress}</strong>
                    </div>
                    {garden && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--color-mute)', fontSize: '14px' }}>Ogród:</span>
                        <strong style={{ fontSize: '14px' }}>{garden.gardenName}</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-mute)', fontSize: '18px' }}>Brak przypisanych urządzeń. Sparuj urządzenie przez Bluetooth, aby dodać nowe.</p>
        </div>
      )}

      <DeviceAssignModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          if (gattServer) gattServer.disconnect();
          setGattServer(null);
        }}
        deviceType={scannedDeviceType}
        deviceMac={scannedMacAddress}
        gattServer={gattServer}
        onSuccess={() => {
          setSuccess('Udało się sparować urządzenie!');
          fetchData();
        }}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Usuń urządzenie"
        message={deviceToDelete ? `Czy na pewno chcesz usunąć urządzenie o adresie MAC: ${deviceToDelete.mac}? Jego historia pomiarów również zostanie skasowana.` : ''}
        confirmText="Usuń"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default Hardware;
