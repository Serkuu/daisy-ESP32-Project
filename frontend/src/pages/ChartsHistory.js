import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, Sprout, Filter, AlertCircle } from 'lucide-react';

function ChartsHistory() {
  const [headUnits, setHeadUnits] = useState([]);
  const [sensors, setSensors] = useState([]);

  const [selectedHeadUnit, setSelectedHeadUnit] = useState('');
  const [headUnitPeriod, setHeadUnitPeriod] = useState('1w');
  const [headUnitHistory, setHeadUnitHistory] = useState([]);

  const [selectedSensor, setSelectedSensor] = useState('');
  const [sensorPeriod, setSensorPeriod] = useState('1w');
  const [sensorHistory, setSensorHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const periods = [
    { value: '1h', label: '1 godzina' },
    { value: '1d', label: '1 dzień' },
    { value: '1w', label: '1 tydzień' },
    { value: '1m', label: '1 miesiąc' }
  ];

  useEffect(() => {
    const fetchDevices = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const [headUnitRes, sensorRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/head-unit`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/sensor`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (headUnitRes.status === 401 || sensorRes.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
          return;
        }

        if (headUnitRes.ok && sensorRes.ok) {
          const headUnitsData = await headUnitRes.json();
          const sensorsData = await sensorRes.json();

          setHeadUnits(headUnitsData);
          setSensors(sensorsData);

          if (headUnitsData.length > 0) setSelectedHeadUnit(headUnitsData[0].id.toString());
          if (sensorsData.length > 0) setSelectedSensor(sensorsData[0].id.toString());
        }
      } catch (err) {
        console.error('Błąd pobierania urządzeń', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [navigate]);

  useEffect(() => {
    const fetchHeadUnitHistory = async () => {
      if (!selectedHeadUnit) return;
      const token = localStorage.getItem('access_token');
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/head-unit/${selectedHeadUnit}/history?period=${headUnitPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map(d => ({
            ...d,
            time: new Date(d.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          }));
          setHeadUnitHistory(formatted);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHeadUnitHistory();
  }, [selectedHeadUnit, headUnitPeriod]);

  useEffect(() => {
    const fetchSensorHistory = async () => {
      if (!selectedSensor) return;
      const token = localStorage.getItem('access_token');
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/sensor/${selectedSensor}/history?period=${sensorPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map(d => ({
            ...d,
            time: new Date(d.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          }));
          setSensorHistory(formatted);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSensorHistory();
  }, [selectedSensor, sensorPeriod]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Wczytywanie...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'var(--font-size-h1, 32px)', marginBottom: '8px' }}>Wykresy i historia</h1>
        <p style={{ color: 'var(--color-mute)', fontSize: '16px' }}>Analizuj dane z Twoich urządzeń w czasie</p>
      </div>

      <div style={{ marginBottom: '64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Thermometer size={28} color="var(--color-primary-active)" />
            daisyHeadUnit (Temperatura i Wilgotność powietrza)
          </h2>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          {headUnits.length > 0 ? (
            <>
              <div className="mobile-col" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
                <select
                  value={selectedHeadUnit}
                  onChange={(e) => setSelectedHeadUnit(e.target.value)}
                  style={{ padding: '12px', borderRadius: 'var(--rounded-md)', border: '1px solid var(--color-mute)', fontSize: '16px', flex: 1, minWidth: '200px' }}
                >
                  {headUnits.map(hu => (
                    <option key={hu.id} value={hu.id}>
                      {hu.garden ? `Ogród: ${hu.garden.gardenName}` : 'Brak ogrodu'} ({hu.macAddress})
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', backgroundColor: 'var(--color-canvas-soft)', borderRadius: 'var(--rounded-md)', padding: '4px', overflowX: 'auto', maxWidth: '100%' }}>
                  {periods.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setHeadUnitPeriod(p.value)}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        backgroundColor: headUnitPeriod === p.value ? 'var(--color-canvas)' : 'transparent',
                        color: headUnitPeriod === p.value ? 'var(--color-primary-active)' : 'var(--color-mute)',
                        fontWeight: headUnitPeriod === p.value ? 'bold' : 'normal',
                        borderRadius: 'var(--rounded-sm)',
                        cursor: 'pointer',
                        boxShadow: headUnitPeriod === p.value ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {headUnitHistory.length > 0 ? (
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={headUnitHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--color-mute)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-mute)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="tempLevel" name="Temperatura (°C)" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="moistLevel" name="Wilgotność pow. (%)" stroke="#0ea5e9" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--color-mute)' }}>
                  <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p style={{ fontSize: '18px' }}>Brak danych z wybranego okresu.</p>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: 'var(--color-mute)' }}>Brak zarejestrowanych głowic daisyHeadUnit.</p>
          )}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sprout size={28} color="var(--color-primary-active)" />
            daisySensor (Wilgotność gleby)
          </h2>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          {sensors.length > 0 ? (
            <>
              <div className="mobile-col" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
                <select
                  value={selectedSensor}
                  onChange={(e) => setSelectedSensor(e.target.value)}
                  style={{ padding: '12px', borderRadius: 'var(--rounded-md)', border: '1px solid var(--color-mute)', fontSize: '16px', flex: 1, minWidth: '200px' }}
                >
                  {sensors.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.plant ? `Roślina: ${s.plant.plantName}` : 'Brak przypisanej rośliny'} ({s.macAddress})
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', backgroundColor: 'var(--color-canvas-soft)', borderRadius: 'var(--rounded-md)', padding: '4px', overflowX: 'auto', maxWidth: '100%' }}>
                  {periods.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setSensorPeriod(p.value)}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        backgroundColor: sensorPeriod === p.value ? 'var(--color-canvas)' : 'transparent',
                        color: sensorPeriod === p.value ? 'var(--color-primary-active)' : 'var(--color-mute)',
                        fontWeight: sensorPeriod === p.value ? 'bold' : 'normal',
                        borderRadius: 'var(--rounded-sm)',
                        cursor: 'pointer',
                        boxShadow: sensorPeriod === p.value ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {sensorHistory.length > 0 ? (
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensorHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--color-mute)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-mute)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="moistureLevel" name="Wilgotność gleby (%)" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="batteryLevel" name="Bateria (%)" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--color-mute)' }}>
                  <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p style={{ fontSize: '18px' }}>Brak danych z wybranego okresu.</p>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: 'var(--color-mute)' }}>Brak zarejestrowanych czujników daisySensor.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChartsHistory;
