import { useState, useEffect } from 'react';
import { PlusCircle, Calendar, List, LogOut, Moon, Sun } from 'lucide-react';
import IosSelect from '../components/IosSelect';
import CustomCalendar from '../components/CustomCalendar';
import './Dashboard.css';

import { supabase } from '../supabaseClient';

const SOLICITANTES = ['Dirección', 'EPS', 'Particular', 'Institucional', 'Gobernación'];
const SOLICITUDES = ['Aseguramiento', 'Agendamiento', 'Procedimientos', 'Referencia y Contrarreferencia', 'Autorización'];
const MEDIOS = ['WhatsApp', 'Telefónica', 'Presencial', 'Correo', 'Otro'];

function Dashboard({ onLogout, theme, toggleTheme }) {
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
  const [particularNombre, setParticularNombre] = useState('');
  const [particularTipoDoc, setParticularTipoDoc] = useState('');
  const [particularNumeroDoc, setParticularNumeroDoc] = useState('');
  const [particularTelefono, setParticularTelefono] = useState('');
  
  const [epsContacto, setEpsContacto] = useState('');
  const [epsTelefono, setEpsTelefono] = useState('');

  const [instDependencia, setInstDependencia] = useState('');
  const [instContacto, setInstContacto] = useState('');

  const [gobSecretaria, setGobSecretaria] = useState('');
  const [gobFuncionario, setGobFuncionario] = useState('');
  const [gobTelefono, setGobTelefono] = useState('');

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
      ...(medio === 'Otro' && { otro_medio: otroMedio }),
      ...(solicitante === 'Particular' && { 
        particular_nombre: particularNombre,
        particular_tipo_doc: particularTipoDoc,
        particular_numero_doc: particularNumeroDoc,
        particular_telefono: particularTelefono
      }),
      ...(solicitante === 'EPS' && { 
        eps_nombre: epsAsociada, // Reusing epsAsociada for EPS name if they select EPS in solicitante
        eps_contacto: epsContacto,
        eps_telefono: epsTelefono
      }),
      ...(solicitante === 'Institucional' && { 
        inst_nombre: institucion,
        inst_dependencia: instDependencia,
        inst_contacto: instContacto
      }),
      ...(solicitante === 'Gobernación' && { 
        gob_secretaria: gobSecretaria,
        gob_funcionario: gobFuncionario,
        gob_telefono: gobTelefono
      })
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
      setParticularNombre('');
      setParticularTipoDoc('');
      setParticularNumeroDoc('');
      setParticularTelefono('');

      setEpsContacto('');
      setEpsTelefono('');

      setInstDependencia('');
      setInstContacto('');

      setGobSecretaria('');
      setGobFuncionario('');
      setGobTelefono('');
      
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

        {solicitante === 'Particular' && (
          <div className="particular-fields-group">
            <h4 className="section-subtitle" style={{marginTop: '0', marginBottom: '15px', color: 'var(--ios-blue)'}}>Datos del Particular</h4>
            <div className="ios-form-row dynamic-field">
              <label>Nombre Completo</label>
              <div className="ios-input-wrapper">
                <input type="text" value={particularNombre} onChange={e => setParticularNombre(e.target.value)} required placeholder="Ej. Juan Pérez" className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field" style={{ overflow: 'visible' }}>
              <label>Tipo Documento</label>
              <div className="ios-input-wrapper">
                <IosSelect 
                  value={particularTipoDoc} 
                  options={['CC', 'TI', 'CE', 'RC', 'Pasaporte']} 
                  onChange={setParticularTipoDoc} 
                  placeholder="Seleccionar..."
                />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Número Documento</label>
              <div className="ios-input-wrapper">
                <input type="text" value={particularNumeroDoc} onChange={e => setParticularNumeroDoc(e.target.value)} required placeholder="Ej. 1020304050" className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Teléfono</label>
              <div className="ios-input-wrapper">
                <input type="tel" value={particularTelefono} onChange={e => setParticularTelefono(e.target.value)} required placeholder="Ej. 300 123 4567" className="ios-text-input" />
              </div>
            </div>
          </div>
        )}

        {solicitante === 'EPS' && (
          <div className="particular-fields-group">
            <h4 className="section-subtitle" style={{marginTop: '0', marginBottom: '15px', color: 'var(--ios-blue)'}}>Datos de EPS</h4>
            <div className="ios-form-row dynamic-field">
              <label>Nombre EPS</label>
              <div className="ios-input-wrapper">
                <input type="text" value={epsAsociada} onChange={e => setEpsAsociada(e.target.value)} required placeholder="Ej. Sura, Sanitas" className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Contacto/Asesor</label>
              <div className="ios-input-wrapper">
                <input type="text" value={epsContacto} onChange={e => setEpsContacto(e.target.value)} required placeholder="Ej. Dra. Ramírez" className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Teléfono/Ext</label>
              <div className="ios-input-wrapper">
                <input type="text" value={epsTelefono} onChange={e => setEpsTelefono(e.target.value)} required placeholder="Ej. Ext 104" className="ios-text-input" />
              </div>
            </div>
          </div>
        )}

        {solicitante === 'Institucional' && (
          <div className="particular-fields-group">
            <h4 className="section-subtitle" style={{marginTop: '0', marginBottom: '15px', color: 'var(--ios-blue)'}}>Datos de Institución</h4>
            <div className="ios-form-row dynamic-field">
              <label>Institución</label>
              <div className="ios-input-wrapper">
                <input type="text" value={institucion} onChange={e => setInstitucion(e.target.value)} required placeholder="Ej. Hospital San José" className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Dependencia</label>
              <div className="ios-input-wrapper">
                <input type="text" value={instDependencia} onChange={e => setInstDependencia(e.target.value)} required placeholder="Ej. Urgencias" className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Contacto</label>
              <div className="ios-input-wrapper">
                <input type="text" value={instContacto} onChange={e => setInstContacto(e.target.value)} required placeholder="Ej. Jefe Enfermería" className="ios-text-input" />
              </div>
            </div>
          </div>
        )}

        {solicitante === 'Gobernación' && (
          <div className="particular-fields-group">
            <h4 className="section-subtitle" style={{marginTop: '0', marginBottom: '15px', color: 'var(--ios-blue)'}}>Datos de Gobernación</h4>
            <div className="ios-form-row dynamic-field">
              <label>Secretaría</label>
              <div className="ios-input-wrapper">
                <input type="text" value={gobSecretaria} onChange={e => setGobSecretaria(e.target.value)} required placeholder="Ej. Sec. de Salud" className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Funcionario</label>
              <div className="ios-input-wrapper">
                <input type="text" value={gobFuncionario} onChange={e => setGobFuncionario(e.target.value)} required placeholder="Ej. Dr. López" className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Teléfono</label>
              <div className="ios-input-wrapper">
                <input type="text" value={gobTelefono} onChange={e => setGobTelefono(e.target.value)} required placeholder="Ej. 300..." className="ios-text-input" />
              </div>
            </div>
          </div>
        )}


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

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const filterRecords = (timeframe) => {
    return records.filter(r => {
      if (!r.created_at) return false;
      
      const rDateStr = r.created_at.split('T')[0]; // YYYY-MM-DD
      const rMonthStr = r.created_at.slice(0, 7);  // YYYY-MM

      if (timeframe === 'daily') {
        return rDateStr === selectedDate;
      }
      if (timeframe === 'weekly') {
        const targetDateObj = new Date(selectedDate);
        const recordDateObj = new Date(rDateStr);
        // Mostrar los 7 días anteriores hasta la fecha seleccionada (inclusive)
        const diffDays = (targetDateObj - recordDateObj) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays < 7;
      }
      if (timeframe === 'monthly') {
        return rMonthStr === selectedMonth;
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
    const titles = { daily: 'Reporte Diario', weekly: 'Reporte Semanal', monthly: 'Reporte Mensual' };
    const subtitles = {
      daily: selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', {weekday:'long', year:'numeric', month:'long', day:'numeric'}) : '',
      weekly: 'Últimos 7 días',
      monthly: selectedMonth ? new Date(selectedMonth + '-01T12:00:00').toLocaleDateString('es-CO', {year:'numeric', month:'long'}) : ''
    };

    const solicitanteBadgeColor = (s) => {
      const map = { EPS:'#34C759', Particular:'#FF9500', Institucional:'#AF52DE', Gobernación:'#FF3B30', Dirección:'#007AFF' };
      return map[s] || '#8E8E93';
    };
    
    return (
      <div className="records-list">
        <h2 className="ios-large-title">{titles[timeframe]}</h2>
        <p className="ios-subtitle">{subtitles[timeframe]}</p>
        
        <CustomCalendar 
          mode={timeframe} 
          selectedDate={timeframe === 'monthly' ? selectedMonth : selectedDate} 
          onDateChange={timeframe === 'monthly' ? setSelectedMonth : setSelectedDate} 
        />
        
        {renderStats(filtered)}

        <h3 className="section-subtitle">Detalle de Gestiones</h3>
        {filtered.length === 0 ? (
          <div className="no-records-card glass">
            <span style={{fontSize:'40px'}}>📋</span>
            <p>No hay gestiones en este periodo.</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="record-card-v2 glass">

              {/* ── Cabecera ── */}
              <div className="rc-header">
                <div className="rc-header-left">
                  <span className="rc-solicitud-badge">{r.solicitud}</span>
                  <span className="rc-date">{new Date(r.created_at).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'})}</span>
                </div>
                <span className="rc-solicitante-chip" style={{backgroundColor: solicitanteBadgeColor(r.solicitante) + '20', color: solicitanteBadgeColor(r.solicitante), border: `1px solid ${solicitanteBadgeColor(r.solicitante)}40`}}>
                  {r.solicitante}
                </span>
              </div>

              {/* ── Datos del contacto (según solicitante) ── */}
              {r.solicitante === 'Particular' && r.particular_nombre && (
                <div className="rc-contact-block">
                  <div className="rc-contact-icon">👤</div>
                  <div>
                    <p className="rc-contact-name">{r.particular_nombre}</p>
                    <p className="rc-contact-detail">{r.particular_tipo_doc} {r.particular_numero_doc} &nbsp;·&nbsp; 📞 {r.particular_telefono}</p>
                  </div>
                </div>
              )}
              {r.solicitante === 'EPS' && r.eps_nombre && (
                <div className="rc-contact-block">
                  <div className="rc-contact-icon">🏥</div>
                  <div>
                    <p className="rc-contact-name">{r.eps_nombre}</p>
                    <p className="rc-contact-detail">Contacto: {r.eps_contacto} &nbsp;·&nbsp; 📞 {r.eps_telefono}</p>
                  </div>
                </div>
              )}
              {r.solicitante === 'Institucional' && r.inst_nombre && (
                <div className="rc-contact-block">
                  <div className="rc-contact-icon">🏛️</div>
                  <div>
                    <p className="rc-contact-name">{r.inst_nombre}</p>
                    <p className="rc-contact-detail">{r.inst_dependencia} &nbsp;·&nbsp; {r.inst_contacto}</p>
                  </div>
                </div>
              )}
              {r.solicitante === 'Gobernación' && r.gob_secretaria && (
                <div className="rc-contact-block">
                  <div className="rc-contact-icon">🏢</div>
                  <div>
                    <p className="rc-contact-name">{r.gob_secretaria}</p>
                    <p className="rc-contact-detail">{r.gob_funcionario} &nbsp;·&nbsp; 📞 {r.gob_telefono}</p>
                  </div>
                </div>
              )}

              {/* ── Medio y detalles de cita ── */}
              <div className="rc-tags-row">
                <span className="rc-tag">📡 {r.medio === 'Otro' && r.otro_medio ? r.otro_medio : r.medio}</span>
                {r.fecha_cita && <span className="rc-tag">📅 {r.fecha_cita}</span>}
                {r.especialidad && <span className="rc-tag">🩺 {r.especialidad}</span>}
                {r.eps_asociada && !r.eps_nombre && <span className="rc-tag">💊 {r.eps_asociada}</span>}
                {r.institucion && !r.inst_nombre && <span className="rc-tag">🏥 {r.institucion}</span>}
              </div>

              {/* ── Descripción y Gestión ── */}
              <div className="rc-text-section">
                <div className="rc-text-block">
                  <p className="rc-text-label">Descripción</p>
                  <p className="rc-text-content">{r.descripcion}</p>
                </div>
                <div className="rc-divider" />
                <div className="rc-text-block">
                  <p className="rc-text-label">Gestión Realizada</p>
                  <p className="rc-text-content">{r.gestion_realizada}</p>
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
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {activeTab === 'form' && renderForm()}
        {activeTab === 'daily' && renderRecords('daily')}
        {activeTab === 'weekly' && renderRecords('weekly')}
        {activeTab === 'monthly' && renderRecords('monthly')}
      </main>

      <nav className="bottom-nav">
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
