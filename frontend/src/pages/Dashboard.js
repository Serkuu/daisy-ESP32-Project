import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import DeviceAssignModal from '../components/DeviceAssignModal';

function Dashboard() {
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.successMessage || '');
  const navigate = useNavigate();

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [scannedDeviceType, setScannedDeviceType] = useState('');
  const [scannedMacAddress, setScannedMacAddress] = useState('');

  useEffect(() => {
    const fetchGardens = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/garden', {
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
          throw new Error('Nie udało się pobrać danych z serwera.');
        }

        const data = await response.json();
        setGardens(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGardens();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const scanBluetoothDevice = async (type) => {
    try {
      if (!navigator.bluetooth) {
        throw new Error("Twoja przeglądarka nie obsługuje Web Bluetooth API. Otwórz aplikację w Google Chrome na komputerze/Androidzie.");
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      });

      //UWAGA MOCK PAMIETAJ
      const mockedMac = device.id.substring(0, 17) || "00:1B:44:11:3A:B7";

      setScannedDeviceType(type);
      setScannedMacAddress(mockedMac);
      setAssignModalOpen(true);
    } catch (err) {
      console.log('Bluetooth error: ', err);
      if (err.name === 'NotFoundError') {
      } else {
        setError('Błąd Bluetooth: ' + err.message);
      }
    }
  };

  return (
    <div style={{ padding: '48px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>Twoje Ogrody</h1>
          <p style={{ color: 'var(--color-mute)', fontSize: '16px' }}>Zarządzaj swoimi roślinami i urządzeniami.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button onClick={() => navigate('/add-garden')}>Nowy ogród</Button>
          <Button onClick={() => navigate('/add-plant')}>Dodaj roślinę</Button>
          <Button variant="secondary" onClick={handleLogout}>Wyloguj się</Button>
        </div>
      </div>

      {success && (
        <div style={{
          backgroundColor: 'var(--color-positive)',
          color: '#ffffff',
          padding: '16px',
          borderRadius: 'var(--rounded-md)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: '600'
        }}>
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
        </div>
      )}

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

      {loading ? (
        <p style={{ color: 'var(--color-mute)', fontSize: '18px' }}>Wczytywanie ogrodów...</p>
      ) : gardens.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--color-canvas)',
          padding: '64px',
          borderRadius: 'var(--rounded-xl)',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Nie masz jeszcze żadnego ogrodu!</h2>
          <p style={{ color: 'var(--color-mute)', marginBottom: '32px', fontSize: '18px' }}>
            Dodaj swój pierwszy ogród i tchnij życie w to miejsce.
          </p>
          <Button onClick={() => navigate('/add-garden')}>Stwórz pierwszy ogród</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {gardens.map(garden => (
            <div key={garden.id} style={{
              backgroundColor: 'var(--color-canvas)',
              padding: '32px',
              borderRadius: 'var(--rounded-xl)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => navigate(`/garden/${garden.id}`)}
            >
              <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>{garden.gardenName}</h3>
              <p style={{ color: 'var(--color-mute)', fontSize: '16px' }}>Liczba roślin: {garden.plants?.length || 0}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '64px', borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Twoje Urządzenia</h2>
        <p style={{ color: 'var(--color-mute)', fontSize: '16px', marginBottom: '24px' }}>
          Skanuj w poszukiwaniu urządzeń.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button onClick={() => scanBluetoothDevice('headunit')} style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
            <span style={{ fontSize: '20px', marginRight: '8px' }}></span> Szukaj daisyHeadUnit
          </Button>
          <Button onClick={() => scanBluetoothDevice('sensor')} style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
            <span style={{ fontSize: '20px', marginRight: '8px' }}></span> Szukaj daisySensor
          </Button>
        </div>
      </div>

      <DeviceAssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        deviceType={scannedDeviceType}
        deviceMac={scannedMacAddress}
        onSuccess={() => {
          setSuccess('Udało się sparować urządzenie po Bluetooth!');
        }}
      />
    </div>
  );
}

export default Dashboard;
