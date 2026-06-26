import { useState, useEffect } from 'react';
import { PlusCircle, Calendar, List, LogOut, Moon, Sun } from 'lucide-react';
import IosSelect from '../components/IosSelect';
import './Dashboard.css';

import { supabase } from '../supabaseClient';

const SOLICITANTES = ['Dirección', 'EPS', 'Particular', 'Institucional', 'Gobernación'];
const SOLICITUDES = ['Aseguramiento', 'Agendamiento', 'Procedimientos', 'Referencia y Contrarreferencia', 'Autorización'];
const MEDIOS = ['WhatsApp', 'Telefónica', 'Presencial', 'Correo', 'Otro'];

function Dashboard({ theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('form');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [solicitante, setSolicitante] = useState('');
  const [solicitud, setSolicitud] = useState('');
  const [medio, setMedio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [gestion, setGestion] = useState('');
  
  // Dynamic fields state
  const [fechaCita, setFechaCita] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [epsAsociada, setEpsAsociada] = useState('');
  const [otroMedio, setOtroMedio] = useState('');

  // Fetch records from Supabase on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('gestiones')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!solicitante || !solicitud || !medio) {
        alert('Por favor completa todos los campos desplegables requeridos.');
        return;
    }
    setLoading(true);

    const newRecord = {
      solicitante,
      solicitud,
      medio,
      descripcion,
      gestion_realizada: gestion,
      // Save dynamic fields only if relevant
      ...(solicitud === 'Agendamiento' && { fecha_cita: fechaCita, especialidad }),
      ...(solicitud === 'Referencia y Contrarreferencia' && { institucion }),
      ...(solicitud === 'Aseguramiento' && { eps_asociada: epsAsociada }),
      ...(medio === 'Otro' && { otro_medio: otroMedio })
    };
    
    try {
      const { data, error } = await supabase
        .from('gestiones')
        .insert([newRecord])
        .select();

      if (error) throw error;
      
      if (data) {
        setRecords([data[0], ...records]);
      }

      // Reset form
      setSolicitante('');
      setSolicitud('');
      setMedio('');
      setDescripcion('');
      setGestion('');
      setFechaCita('');
      setEspecialidad('');
      setInstitucion('');
      setEpsAsociada('');
      setOtroMedio('');
      
      alert('Gestión guardada en la nube exitosamente');
    } catch (error) {
      alert('Error guardando: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <div className="gestion-form-container">
      <h2 className="ios-large-title">Nueva Gestión</h2>
      
      <form onSubmit={handleSubmit} className="ios-form-group">
        
        <div className="ios-form-row" style={{ overflow: 'visible' }}>
          <label>Solicitante</label>
          <div className="ios-input-wrapper">
            <IosSelect 
              value={solicitante} 
              options={SOLICITANTES} 
              onChange={setSolicitante} 
            />
          </div>
        </div>

        <div className="ios-form-row" style={{ overflow: 'visible' }}>
          <label>Solicitud</label>
          <div className="ios-input-wrapper">
            <IosSelect 
              value={solicitud} 
              options={SOLICITUDES} 
              onChange={setSolicitud} 
            />
          </div>
        </div>

        {/* Conditional Fields based on Solicitud */}
        {solicitud === 'Agendamiento' && (
          <>
            <div className="ios-form-row dynamic-field">
              <label>Fecha de Cita</label>
              <div className="ios-input-wrapper">
                <input type="date" value={fechaCita} onChange={e => setFechaCita(e.target.value)} required className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Especialidad</label>
              <div className="ios-input-wrapper">
                <input type="text" placeholder="Ej: Pediatría" value={especialidad} onChange={e => setEspecialidad(e.target.value)} required className="ios-text-input" />
              </div>
            </div>
          </>
        )}

        {solicitud === 'Referencia y Contrarreferencia' && (
          <div className="ios-form-row dynamic-field">
            <label>Institución</label>
            <div className="ios-input-wrapper">
              <input type="text" placeholder="Destino u origen" value={institucion} onChange={e => setInstitucion(e.target.value)} required className="ios-text-input" />
            </div>
          </div>
        )}

        {solicitud === 'Aseguramiento' && (
          <div className="ios-form-row dynamic-field">
            <label>EPS Asociada</label>
            <div className="ios-input-wrapper">
              <input type="text" placeholder="Nombre de EPS" value={epsAsociada} onChange={e => setEpsAsociada(e.target.value)} required className="ios-text-input" />
            </div>
          </div>
        )}

        <div className="ios-form-row" style={{ overflow: 'visible' }}>
          <label>Medio</label>
          <div className="ios-input-wrapper">
            <IosSelect 
              value={medio} 
              options={MEDIOS} 
              onChange={setMedio} 
            />
          </div>
        </div>

        {/* Conditional Field based on Medio */}
        {medio === 'Otro' && (
          <div className="ios-form-row dynamic-field">
            <label>Especifique</label>
            <div className="ios-input-wrapper">
              <input type="text" placeholder="¿Qué medio?" value={otroMedio} onChange={e => setOtroMedio(e.target.value)} required className="ios-text-input" />
            </div>
          </div>
        )}

        <div className="ios-form-row ios-form-row-vertical">
          <label>Descripción de la solicitud</label>
          <textarea 
            value={descripcion} 
            onChange={e => setDescripcion(e.target.value)} 
            required 
            placeholder="Escribe los detalles aquí..."
            rows="3"
          />
        </div>

        <div className="ios-form-row ios-form-row-vertical no-border">
          <label>Gestión Realizada</label>
          <textarea 
            value={gestion} 
            onChange={e => setGestion(e.target.value)} 
            required 
            placeholder="¿Qué gestión se realizó?"
            rows="4"
          />
        </div>

      </form>
      
      <button onClick={handleSubmit} className="ios-submit-button">Guardar Registro</button>
    </div>
  );

  const filterRecords = (timeframe) => {
    const now = new Date();
    return records.filter(r => {
      const rDate = new Date(r.created_at);
      if (timeframe === 'daily') {
        return rDate.toDateString() === now.toDateString();
      }
      if (timeframe === 'weekly') {
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        return (now - rDate) < oneWeek;
      }
      if (timeframe === 'monthly') {
        return rDate.getMonth() === now.getMonth() && rDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const renderStats = (filtered) => {
    if (filtered.length === 0) return null;
    
    const countBySolicitud = filtered.reduce((acc, curr) => {
      acc[curr.solicitud] = (acc[curr.solicitud] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="stats-container glass">
        <div className="stats-total">
          <span className="stats-number">{filtered.length}</span>
          <span className="stats-label">Total Gestiones</span>
        </div>
        <div className="stats-breakdown">
          {Object.entries(countBySolicitud).map(([key, val]) => (
            <div key={key} className="stats-item">
              <span className="stats-item-label">{key}</span>
              <span className="stats-item-val">{val}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecords = (timeframe) => {
    const filtered = filterRecords(timeframe);
    const titles = { daily: 'Hoy', weekly: 'Últimos 7 días', monthly: 'Este Mes' };
    
    return (
      <div className="records-list">
        <h2 className="ios-large-title">Reporte {titles[timeframe]}</h2>
        
        {renderStats(filtered)}

        <h3 className="section-subtitle">Detalle de Gestiones</h3>
        {filtered.length === 0 ? (
          <p className="no-records">No hay registros en este periodo.</p>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="record-card glass">
              <div className="record-header">
                <span className="badge">{r.solicitud}</span>
                <span className="date">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <div className="record-body">
                <p><strong>Solicitante:</strong> {r.solicitante}</p>
                <p><strong>Medio:</strong> {r.medio === 'Otro' && r.otro_medio ? r.otro_medio : r.medio}</p>
                {r.fecha_cita && <p><strong>Fecha de Cita:</strong> {r.fecha_cita}</p>}
                {r.especialidad && <p><strong>Especialidad:</strong> {r.especialidad}</p>}
                {r.institucion && <p><strong>Institución:</strong> {r.institucion}</p>}
                {r.eps_asociada && <p><strong>EPS:</strong> {r.eps_asociada}</p>}
                <div className="record-text-blocks">
                  <div className="text-block">
                    <strong>Descripción:</strong>
                    <p>{r.descripcion}</p>
                  </div>
                  <div className="text-block">
                    <strong>Gestión:</strong>
                    <p>{r.gestion_realizada}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header glass">
        <h1>Gestión Dra. Adriana</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => supabase.auth.signOut()} className="logout-btn" title="Cerrar sesión">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {activeTab === 'form' && renderForm()}
        {activeTab === 'daily' && renderRecords('daily')}
        {activeTab === 'weekly' && renderRecords('weekly')}
        {activeTab === 'monthly' && renderRecords('monthly')}
      </main>

      <nav className="bottom-nav glass">
        <button className={`nav-item ${activeTab === 'form' ? 'active' : ''}`} onClick={() => setActiveTab('form')}>
          <PlusCircle size={24} />
          <span>Nuevo</span>
        </button>
        <button className={`nav-item ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>
          <List size={24} />
          <span>Diario</span>
        </button>
        <button className={`nav-item ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTab('weekly')}>
          <Calendar size={24} />
          <span>Semanal</span>
        </button>
        <button className={`nav-item ${activeTab === 'monthly' ? 'active' : ''}`} onClick={() => setActiveTab('monthly')}>
          <Calendar size={24} />
          <span>Mensual</span>
        </button>
      </nav>
    </div>
  );
}

export default Dashboard;
