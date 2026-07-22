import { useState, useEffect, useRef } from 'react';
import { PlusCircle, List, Calendar, Download } from 'lucide-react';
import IosSelect from '../components/IosSelect';
import EpsSelector from '../components/EpsSelector';
import CustomCalendar from '../components/CustomCalendar';
import RecordCard from '../components/RecordCard';
import WeeklySegmentedControl from '../components/WeeklySegmentedControl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DailyChart, WeeklyChart, MonthlyChart } from '../components/Charts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Dashboard.css';
import './DailyView.css';

import { supabase } from '../supabaseClient';

const SOLICITANTES = ['Dirección', 'EPS', 'Particular', 'Institucional', 'Gobernación'];
const SOLICITUDES = ['Aseguramiento', 'Agendamiento', 'Procedimientos', 'Referencia y Contrarreferencia', 'Autorización'];
const MEDIOS = ['WhatsApp', 'Telefónica', 'Presencial', 'Correo', 'Otro'];
const EPS_PREDEFINIDAS = ['Nueva EPS', 'Coosalud EPS', 'Sanitas EPS', 'Comfaoriente EPS', 'Salud Total EPS', 'Otra'];

function Dashboard({ onLogout, theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('form');
  const [isEpsFlow, setIsEpsFlow] = useState(true);
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

  const [dirFuncionario, setDirFuncionario] = useState('');
  const [dirDependencia, setDirDependencia] = useState('');

  const [fechaCita, setFechaCita] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [epsAsociada, setEpsAsociada] = useState('');
  const [otraEps, setOtraEps] = useState('');
  const [otroMedio, setOtroMedio] = useState('');

  // Dynamic fields for "Procedimientos"
  const [procTipo, setProcTipo] = useState('');
  const [procNombre, setProcNombre] = useState('');
  const [procEspecialidad, setProcEspecialidad] = useState('');
  const [procPrioridad, setProcPrioridad] = useState('');

  // Dynamic fields for "Agendamiento"
  const [agenTipoConsulta, setAgenTipoConsulta] = useState('');

  // Dynamic fields for "Autorización"
  const [autTipoServicio, setAutTipoServicio] = useState('');
  const [autNumero, setAutNumero] = useState('');
  const [autEstado, setAutEstado] = useState('');

  // Dynamic fields for "Referencia y Contrarreferencia"
  const [refTipoTraslado, setRefTipoTraslado] = useState('');
  const [refIpsOrigen, setRefIpsOrigen] = useState('');
  const [refIpsDestino, setRefIpsDestino] = useState('');
  const [refDiagnostico, setRefDiagnostico] = useState('');

  // Dynamic fields for "Aseguramiento"
  const [asegTramite, setAsegTramite] = useState('');
  const [asegRegimen, setAsegRegimen] = useState('');

  // Global EPS filter for reports
  const [epsFilter, setEpsFilter] = useState('Todas');
  const [solicitanteFilter, setSolicitanteFilter] = useState('Todos');

  const reportRef = useRef(null);

  // Fetch records from Supabase on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const exportToPDF = async (filename, title, data, chartId) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      pdf.setFontSize(22);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Gestión Dra. Adriana", 14, 22);
      
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.text(title, 14, 32);

      let currentY = 42;

      const countBySolicitud = data.reduce((acc, curr) => {
        acc[curr.solicitud] = (acc[curr.solicitud] || 0) + 1;
        return acc;
      }, {});
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Total Gestiones: ${data.length}`, 14, currentY);
      currentY += 8;

      Object.entries(countBySolicitud).forEach(([key, val]) => {
        pdf.text(`- ${key}: ${val}`, 14, currentY);
        currentY += 6;
      });

      currentY += 10;

      const chartEl = document.getElementById(chartId);
      if (chartEl) {
        const canvas = await html2canvas(chartEl, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 160; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const xPos = (pageWidth - imgWidth) / 2;
        
        if (currentY + imgHeight > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            currentY = 20;
        }

        pdf.addImage(imgData, 'PNG', xPos, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 15;
      }

      const tableColumn = ["Fecha", "Solicitante", "Solicitud", "Medio", "Detalle"];
      const tableRows = [];

      data.forEach(r => {
        let details = r.descripcion || "";
        if (r.particular_nombre) details += `\nPaciente: ${r.particular_nombre}`;
        if (r.eps_nombre) details += `\nEPS: ${r.eps_nombre}`;
        if (r.institucion) details += `\nInst: ${r.institucion}`;
        if (r.gob_secretaria) details += `\nGob: ${r.gob_secretaria}`;
        if (r.dir_funcionario) details += `\nFuncionario: ${r.dir_funcionario}`;
        
        const rowData = [
          new Date(r.created_at).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
          r.solicitante,
          r.solicitud,
          r.medio,
          details
        ];
        tableRows.push(rowData);
      });

      autoTable(pdf, {
        head: [tableColumn],
        body: tableRows,
        startY: currentY,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [0, 122, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 20 },
      });

      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Hubo un error al generar el PDF.');
    }
  };

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

    // Validación base
    if (!solicitante || !solicitud || !medio) {
      alert('Por favor completa todos los campos requeridos: Tipo de Entidad, Solicitud y Medio.');
      return;
    }
    // Validación específica por solicitante
    if (solicitante === 'EPS' && !epsAsociada) {
      alert('Por favor selecciona el nombre de la EPS.');
      return;
    }
    if (solicitante === 'EPS' && epsAsociada === 'Otra' && !otraEps.trim()) {
      alert('Por favor escribe el nombre de la EPS.');
      return;
    }
    if (solicitante === 'Particular' && !particularNombre.trim()) {
      alert('Por favor escribe el nombre completo del particular.');
      return;
    }
    if (solicitante === 'Institucional' && !institucion.trim()) {
      alert('Por favor escribe el nombre de la institución.');
      return;
    }
    if (solicitante === 'Gobernación' && !gobSecretaria.trim()) {
      alert('Por favor completa los datos de la Gobernación.');
      return;
    }
    if (solicitante === 'Dirección' && !dirFuncionario.trim()) {
      alert('Por favor completa los datos de la Dirección.');
      return;
    }
    setLoading(true);

    let finalDescripcion = descripcion;
    const epsFinal = epsAsociada === 'Otra' ? otraEps : epsAsociada;

    if (solicitud === 'Procedimientos') {
      finalDescripcion = `**Tipo:** ${procTipo}
**Procedimiento:** ${procNombre}
**Especialidad:** ${procEspecialidad}
**Prioridad:** ${procPrioridad}

${descripcion}`;
    } else if (solicitud === 'Agendamiento') {
      finalDescripcion = `**Consulta:** ${agenTipoConsulta}
**Especialidad:** ${especialidad}
**Fecha:** ${fechaCita}

${descripcion}`;
    } else if (solicitud === 'Autorización') {
      finalDescripcion = `**Servicio:** ${autTipoServicio}
**N° Autorización:** ${autNumero}
**Estado:** ${autEstado}

${descripcion}`;
    } else if (solicitud === 'Referencia y Contrarreferencia') {
      finalDescripcion = `**Traslado:** ${refTipoTraslado}
**Origen:** ${refIpsOrigen}
**Destino:** ${refIpsDestino}
**Dx:** ${refDiagnostico}

${descripcion}`;
    } else if (solicitud === 'Aseguramiento') {
      finalDescripcion = `**Trámite:** ${asegTramite}
**Régimen:** ${asegRegimen}
**EPS:** ${epsFinal}

${descripcion}`;
    }

    const newRecord = {
      solicitante,
      solicitud,
      medio,
      descripcion: finalDescripcion.trim(),
      gestion_realizada: gestion,
      // Save dynamic fields only if relevant
      ...(solicitud === 'Agendamiento' && { fecha_cita: fechaCita, especialidad }),
      ...(solicitud === 'Referencia y Contrarreferencia' && { institucion }),
      ...(solicitud === 'Aseguramiento' && { eps_asociada: epsFinal }),
      ...(medio === 'Otro' && { otro_medio: otroMedio }),
      ...(solicitante === 'Particular' && { 
        particular_nombre: particularNombre,
        particular_tipo_doc: particularTipoDoc,
        particular_numero_doc: particularNumeroDoc,
        particular_telefono: particularTelefono
      }),
      ...(solicitante === 'EPS' && { 
        eps_nombre: epsFinal,
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
      }),
      ...(solicitante === 'Dirección' && {
        dir_funcionario: dirFuncionario,
        dir_dependencia: dirDependencia
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

      // Reset form — Bug 1 fix: también resetear el Segmented Control
      setIsEpsFlow(true);
      setSolicitante('EPS');
      setSolicitud('');
      setMedio('');
      setDescripcion('');
      setGestion('');
      setFechaCita('');
      setEspecialidad('');
      setInstitucion('');
      setEpsAsociada('');
      setOtraEps('');
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
      setProcTipo('');
      setProcNombre('');
      setProcEspecialidad('');
      setProcPrioridad('');
      setAgenTipoConsulta('');
      setAutTipoServicio('');
      setAutNumero('');
      setAutEstado('');
      setRefTipoTraslado('');
      setRefIpsOrigen('');
      setRefIpsDestino('');
      setRefDiagnostico('');
      setAsegTramite('');
      setAsegRegimen('');
      setDirFuncionario('');
      setDirDependencia('');
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
      
      {/* ── Segmented Control Principal (Estilo nativo iPadOS) ── */}
      <div className="main-flow-segment">
        <button 
          type="button" 
          className={isEpsFlow ? 'active' : ''} 
          onClick={() => {
            setIsEpsFlow(true);
            setSolicitante('EPS');
          }}
        >
          Trámite de EPS
        </button>
        <button 
          type="button" 
          className={!isEpsFlow ? 'active' : ''} 
          onClick={() => {
            setIsEpsFlow(false);
            if (solicitante === 'EPS') setSolicitante(''); // Forzar a que escoja
          }}
        >
          Otra Entidad
        </button>
      </div>

      <form onSubmit={handleSubmit} className="ios-form-group">
        
        {/* Selector secundario solo visible si NO es EPS */}
        {!isEpsFlow && (
          <div className="ios-form-row" style={{ overflow: 'visible' }}>
            <label>Tipo de Entidad</label>
            <div className="ios-input-wrapper">
              <IosSelect 
                value={solicitante} 
                options={SOLICITANTES.filter(s => s !== 'EPS')} 
                onChange={setSolicitante} 
              />
            </div>
          </div>
        )}

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
            <div className="ios-form-row dynamic-field" style={{ overflow: 'visible' }}>
              <label>Nombre EPS</label>
              <div className="ios-input-wrapper">
                <IosSelect
                  value={epsAsociada}
                  options={EPS_PREDEFINIDAS}
                  onChange={setEpsAsociada}
                  placeholder="Seleccionar..."
                />
              </div>
            </div>
            {epsAsociada === 'Otra' && (
              <div className="ios-form-row dynamic-field">
                <label>¿Cuál EPS?</label>
                <div className="ios-input-wrapper">
                  <input type="text" value={otraEps} onChange={e => setOtraEps(e.target.value)} required placeholder="Ej. EPS XYZ" className="ios-text-input" />
                </div>
              </div>
            )}
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

        {solicitante === 'Dirección' && (
          <div className="particular-fields-group">
            <h4 className="section-subtitle" style={{marginTop: '0', marginBottom: '15px', color: 'var(--ios-blue)'}}>Datos de la Dirección</h4>
            <div className="ios-form-row dynamic-field">
              <label>Funcionario/Médico</label>
              <div className="ios-input-wrapper">
                <input type="text" value={dirFuncionario} onChange={e => setDirFuncionario(e.target.value)} required placeholder="Ej. Dra. Martínez" className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Dependencia/Área</label>
              <div className="ios-input-wrapper">
                <input type="text" value={dirDependencia} onChange={e => setDirDependencia(e.target.value)} required placeholder="Ej. Gerencia, Auditoría" className="ios-text-input" />
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
        {solicitud === 'Procedimientos' && (
          <div className="particular-fields-group">
            <h4 className="section-subtitle" style={{marginTop: '0', marginBottom: '15px', color: 'var(--ios-blue)'}}>Datos Clínicos del Procedimiento</h4>
            <div className="ios-form-row dynamic-field" style={{ overflow: 'visible' }}>
              <label>Tipo</label>
              <div className="ios-input-wrapper">
                <IosSelect 
                  value={procTipo} 
                  options={['Quirúrgico', 'Diagnóstico', 'Terapéutico']} 
                  onChange={setProcTipo} 
                />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Procedimiento</label>
              <div className="ios-input-wrapper">
                <input type="text" placeholder="Ej. Endoscopia" value={procNombre} onChange={e => setProcNombre(e.target.value)} required className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Especialidad</label>
              <div className="ios-input-wrapper">
                <input type="text" placeholder="Ej. Gastroenterología" value={procEspecialidad} onChange={e => setProcEspecialidad(e.target.value)} required className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field" style={{ overflow: 'visible' }}>
              <label>Prioridad</label>
              <div className="ios-input-wrapper">
                <IosSelect 
                  value={procPrioridad} 
                  options={['Urgencia', 'Prioritario', 'Electivo']} 
                  onChange={setProcPrioridad} 
                />
              </div>
            </div>
          </div>
        )}

        {solicitud === 'Agendamiento' && (
          <div className="particular-fields-group">
            <h4 className="section-subtitle" style={{marginTop: '0', marginBottom: '15px', color: 'var(--ios-blue)'}}>Datos de la Cita</h4>
            <div className="ios-form-row dynamic-field" style={{ overflow: 'visible' }}>
              <label>Tipo Consulta</label>
              <div className="ios-input-wrapper">
                <IosSelect 
                  value={agenTipoConsulta} 
                  options={['Primera Vez', 'Control', 'Lectura Exámenes']} 
                  onChange={setAgenTipoConsulta} 
                />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Especialidad</label>
              <div className="ios-input-wrapper">
                <input type="text" placeholder="Ej. Pediatría" value={especialidad} onChange={e => setEspecialidad(e.target.value)} required className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Fecha de Cita</label>
              <div className="ios-input-wrapper">
                <input type="date" value={fechaCita} onChange={e => setFechaCita(e.target.value)} required className="ios-text-input" />
              </div>
            </div>
          </div>
        )}

        {solicitud === 'Autorización' && (
          <div className="particular-fields-group">
            <h4 className="section-subtitle" style={{marginTop: '0', marginBottom: '15px', color: 'var(--ios-blue)'}}>Datos de la Autorización</h4>
            <div className="ios-form-row dynamic-field" style={{ overflow: 'visible' }}>
              <label>Servicio</label>
              <div className="ios-input-wrapper">
                <IosSelect 
                  value={autTipoServicio} 
                  options={['Medicamentos', 'Insumos', 'Cirugía/Procedimiento']} 
                  onChange={setAutTipoServicio} 
                />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>N° Autorización</label>
              <div className="ios-input-wrapper">
                <input type="text" placeholder="MIPRES o Radicado" value={autNumero} onChange={e => setAutNumero(e.target.value)} className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field" style={{ overflow: 'visible' }}>
              <label>Estado</label>
              <div className="ios-input-wrapper">
                <IosSelect 
                  value={autEstado} 
                  options={['Aprobada', 'En Trámite', 'Negada']} 
                  onChange={setAutEstado} 
                />
              </div>
            </div>
          </div>
        )}

        {solicitud === 'Referencia y Contrarreferencia' && (
          <div className="particular-fields-group">
            <h4 className="section-subtitle" style={{marginTop: '0', marginBottom: '15px', color: 'var(--ios-blue)'}}>Datos de Traslado / Referencia</h4>
            <div className="ios-form-row dynamic-field" style={{ overflow: 'visible' }}>
              <label>Tipo Traslado</label>
              <div className="ios-input-wrapper">
                <IosSelect 
                  value={refTipoTraslado} 
                  options={['Ambulancia Básica (TAB)', 'Medicalizada (TAM)', 'Interconsulta']} 
                  onChange={setRefTipoTraslado} 
                />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>IPS Origen</label>
              <div className="ios-input-wrapper">
                <input type="text" placeholder="De dónde remiten" value={refIpsOrigen} onChange={e => setRefIpsOrigen(e.target.value)} required className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>IPS Destino</label>
              <div className="ios-input-wrapper">
                <input type="text" placeholder="Hacia dónde remiten" value={refIpsDestino} onChange={e => setRefIpsDestino(e.target.value)} required className="ios-text-input" />
              </div>
            </div>
            <div className="ios-form-row dynamic-field">
              <label>Diagnóstico (Dx)</label>
              <div className="ios-input-wrapper">
                <input type="text" placeholder="Ej. Apendicitis Aguda" value={refDiagnostico} onChange={e => setRefDiagnostico(e.target.value)} required className="ios-text-input" />
              </div>
            </div>
          </div>
        )}

        {solicitud === 'Aseguramiento' && (
          <div className="particular-fields-group">
            <h4 className="section-subtitle" style={{marginTop: '0', marginBottom: '15px', color: 'var(--ios-blue)'}}>Trámite de Aseguramiento</h4>
            <div className="ios-form-row dynamic-field" style={{ overflow: 'visible' }}>
              <label>Trámite</label>
              <div className="ios-input-wrapper">
                <IosSelect 
                  value={asegTramite} 
                  options={['Nueva Afiliación', 'Traslado de EPS', 'Desbloqueo']} 
                  onChange={setAsegTramite} 
                />
              </div>
            </div>
            <div className="ios-form-row dynamic-field" style={{ overflow: 'visible' }}>
              <label>Régimen</label>
              <div className="ios-input-wrapper">
                <IosSelect 
                  value={asegRegimen} 
                  options={['Contributivo', 'Subsidiado', 'Especial']} 
                  onChange={setAsegRegimen} 
                />
              </div>
            </div>
            {solicitante !== 'EPS' && (
              <>
                <div className="ios-form-row dynamic-field" style={{ overflow: 'visible' }}>
                  <label>EPS Involucrada</label>
                  <div className="ios-input-wrapper">
                    <IosSelect
                      value={epsAsociada}
                      options={EPS_PREDEFINIDAS}
                      onChange={setEpsAsociada}
                      placeholder="Seleccionar..."
                    />
                  </div>
                </div>
                {epsAsociada === 'Otra' && (
                  <div className="ios-form-row dynamic-field">
                    <label>¿Cuál EPS?</label>
                    <div className="ios-input-wrapper">
                      <input type="text" value={otraEps} onChange={e => setOtraEps(e.target.value)} required placeholder="Ej. EPS XYZ" className="ios-text-input" />
                    </div>
                  </div>
                )}
              </>
            )}
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

      // Solicitante Filter
      if (solicitanteFilter !== 'Todos') {
        if (r.solicitante !== solicitanteFilter) return false;
      }

      // EPS Filter
      if (epsFilter !== 'Todas') {
        const recordEps = r.eps_nombre || r.eps_asociada || '';
        if (recordEps !== epsFilter) return false;
      }
      
      const recordDate = new Date(r.created_at);
      const rDateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
      const rMonthStr = rDateStr.slice(0, 7);

      if (timeframe === 'daily') {
        return rDateStr === selectedDate;
      }
      if (timeframe === 'weekly') {
        const targetDateObj = new Date(selectedDate + 'T12:00:00');
        // Mostrar los 7 días anteriores hasta la fecha seleccionada (inclusive)
        const diffDays = (targetDateObj.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
        // La diferencia de días es entre 0 y 6 para los 7 días
        return diffDays >= -0.5 && diffDays < 7;
      }
      if (timeframe === 'monthly') {
        return rMonthStr === selectedMonth;
      }
      return true;
    });
  };

  const renderFilters = () => {
    // Heurística para limpiar datos heredados donde el nombre del paciente se guardó como EPS
    const isLikelyEps = (name) => {
      const upper = name.toUpperCase();
      if (upper.includes('EPS') || upper.includes('SALUD') || upper.includes('SURA') || upper.includes('COMPENSAR') || upper.includes('SANITAS')) return true;
      if (name.length > 25) return false; 
      const wordCount = name.split(' ').length;
      if (wordCount >= 3 && !upper.includes('EPS') && !upper.includes('SALUD')) return false;
      return true;
    };

    const uniqueEpsInRecords = Array.from(new Set(
      records.map(r => r.eps_nombre || r.eps_asociada).filter(Boolean).filter(isLikelyEps)
    )).sort();

    const baseOptions = EPS_PREDEFINIDAS.filter(e => e !== 'Otra');
    const allEpsOptions = Array.from(new Set(['Todas', ...baseOptions, ...uniqueEpsInRecords]));

    const showEpsFilter = solicitanteFilter === 'Todos' || solicitanteFilter === 'EPS';

    return (
      <div className="ios-form-group" style={{ marginTop: '16px', marginBottom: '24px', overflow: 'visible' }}>
        <div className={`ios-form-row ${!showEpsFilter ? 'no-border' : ''}`} style={{ overflow: 'visible' }}>
          <label>Filtro de Entidad</label>
          <div className="ios-input-wrapper">
            <IosSelect 
              value={solicitanteFilter} 
              options={['Todos', ...SOLICITANTES]} 
              onChange={setSolicitanteFilter} 
            />
          </div>
        </div>

        {showEpsFilter && (
          <div className="ios-form-row no-border" style={{ overflow: 'visible' }}>
            <label>Filtro de EPS</label>
            <div className="ios-input-wrapper">
              <IosSelect 
                value={epsFilter} 
                options={allEpsOptions} 
                onChange={setEpsFilter} 
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStats = (filtered) => {
    if (filtered.length === 0) return null;
    
    const countBySolicitud = filtered.reduce((acc, curr) => {
      acc[curr.solicitud] = (acc[curr.solicitud] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="ios-inset-group">
        <div className="ios-inset-row">
          <span className="ios-inset-label" style={{fontWeight: 600}}>Total Gestiones</span>
          <span className="ios-inset-val" style={{fontSize: '22px', fontWeight: 700, color: 'var(--ios-blue)'}}>{filtered.length}</span>
        </div>
        {Object.entries(countBySolicitud).map(([key, val]) => (
          <div key={key} className="ios-inset-row">
            <span className="ios-inset-label">{key}</span>
            <span className="ios-inset-val">{val}</span>
          </div>
        ))}
      </div>
    );
  };

  const changeDailyDate = (offset) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setUTCDate(d.getUTCDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const renderDailyView = () => {
    const filtered = filterRecords('daily');
    const subtitle = selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', {weekday:'long', year:'numeric', month:'long', day:'numeric'}) : '';
    
    return (
      <div className="records-list" ref={reportRef}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="ios-large-title" style={{marginBottom: 0}}>Reporte Diario</h2>
          <button onClick={() => exportToPDF(`Reporte_Diario_${selectedDate}`, `Reporte Diario - ${subtitle}`, filtered, 'daily-chart')} className="pdf-export-btn" title="Descargar PDF">
            <Download size={22} />
          </button>
        </div>
        
        <div className="daily-header-nav" style={{marginTop: '24px', marginBottom: '16px'}}>
          <button onClick={() => changeDailyDate(-1)} className="daily-nav-btn"><ChevronLeft size={24} /></button>
          <span className="daily-subtitle">{subtitle}</span>
          <button onClick={() => changeDailyDate(1)} className="daily-nav-btn"><ChevronRight size={24} /></button>
        </div>
        
        {renderFilters()}
        {renderStats(filtered)}
        {filtered.length > 0 && (
          <div id="daily-chart" className="ios-inset-group" style={{padding: '0 16px 20px 16px', backgroundColor: 'var(--ios-surface)'}}>
            <DailyChart records={filtered} />
          </div>
        )}

        <h3 className="section-subtitle">Detalle de Gestiones</h3>
        {filtered.length === 0 ? (
          <div className="no-records-card">
            <span style={{fontSize:'40px'}}>📋</span>
            <p>No hay gestiones este día.</p>
          </div>
        ) : (
          <div className="records-grid">
            {filtered.map(r => <RecordCard key={r.id} record={r} />)}
          </div>
        )}
      </div>
    );
  };

  const renderWeeklyView = () => {
    const filtered = filterRecords('daily'); // Muestra los detalles del día seleccionado dentro de la semana
    // Para las estadísticas, mostraremos todo el periodo semanal
    const weeklyFiltered = records.filter(r => {
      const targetDateObj = new Date(selectedDate + 'T12:00:00');
      const recordDate = new Date(r.created_at);
      const rDateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
      const recordDateObj = new Date(rDateStr + 'T12:00:00');
      
      const getMonday = (d) => {
        const date = new Date(d);
        date.setUTCHours(12, 0, 0, 0);
        const day = date.getUTCDay();
        const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setUTCDate(diff));
      };
      
      const monday = getMonday(targetDateObj);
      const sunday = new Date(monday);
      sunday.setUTCDate(sunday.getUTCDate() + 6);
      
      return recordDateObj >= monday && recordDateObj <= sunday;
    });

    return (
      <div className="records-list" ref={reportRef}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="ios-large-title" style={{marginBottom: 0}}>Reporte Semanal</h2>
          <button onClick={() => exportToPDF(`Reporte_Semanal_${selectedDate}`, `Reporte Semanal`, weeklyFiltered, 'weekly-chart')} className="pdf-export-btn" title="Descargar PDF">
            <Download size={22} />
          </button>
        </div>
        
        <WeeklySegmentedControl  
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
        
        <div style={{marginTop: '16px'}}>
          {renderFilters()}
        </div>
        {renderStats(weeklyFiltered)}
        
        {weeklyFiltered.length > 0 && (
          <div id="weekly-chart" className="ios-inset-group" style={{padding: '0 16px 20px 16px', backgroundColor: 'var(--ios-surface)'}}>
            <WeeklyChart 
              records={weeklyFiltered} 
              weekDays={Array.from({length: 7}, (_, i) => {
                const monday = new Date(selectedDate + 'T12:00:00');
                const day = monday.getUTCDay();
                const diff = monday.getUTCDate() - day + (day === 0 ? -6 : 1);
                monday.setUTCDate(diff);
                
                const d = new Date(monday);
                d.setUTCDate(d.getUTCDate() + i);
                return d;
              })}
            />
          </div>
        )}

        <h3 className="section-subtitle">Gestiones de la semana</h3>
        {weeklyFiltered.length === 0 ? (
          <div className="no-records-card">
            <span style={{fontSize:'40px'}}>📋</span>
            <p>No hay gestiones esta semana.</p>
          </div>
        ) : (
          <div className="records-grid">
            {weeklyFiltered.map(r => <RecordCard key={r.id} record={r} />)}
          </div>
        )}
      </div>
    );
  };

  const renderMonthlyView = () => {
    const monthlyFiltered = filterRecords('monthly');

    return (
      <div className="records-list" ref={reportRef}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="ios-large-title" style={{marginBottom: 0}}>Reporte Mensual</h2>
          <button onClick={() => exportToPDF(`Reporte_Mensual_${selectedMonth}`, `Reporte Mensual - ${selectedMonth}`, monthlyFiltered, 'monthly-chart')} className="pdf-export-btn" title="Descargar PDF">
            <Download size={22} />
          </button>
        </div>
        
        <CustomCalendar 
          selectedDate={selectedDate} 
          selectedMonth={selectedMonth}
          onDateChange={setSelectedDate} 
          onMonthChange={setSelectedMonth}
        />
        
        <div style={{marginTop: '16px'}}>
          {renderFilters()}
        </div>
        {renderStats(monthlyFiltered)}

        {monthlyFiltered.length > 0 && (
          <div id="monthly-chart" className="ios-inset-group" style={{padding: '0 16px 20px 16px', backgroundColor: 'var(--ios-surface)'}}>
            <MonthlyChart 
              records={monthlyFiltered} 
              year={parseInt(selectedMonth.split('-')[0])}
              month={parseInt(selectedMonth.split('-')[1]) - 1}
            />
          </div>
        )}

        <h3 className="section-subtitle">Gestiones de {new Date(selectedMonth + '-01').toLocaleDateString('es-CO', {month:'long', year:'numeric'})}</h3>
        {monthlyFiltered.length === 0 ? (
          <div className="no-records-card">
            <span style={{fontSize:'40px'}}>📋</span>
            <p>No hay gestiones este mes.</p>
          </div>
        ) : (
          <div className="records-grid">
            {monthlyFiltered.map(r => <RecordCard key={r.id} record={r} />)}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="dashboard-container">
      <header className="dashboard-header glass macos-pill">
        <div className="macos-controls">
          <span className="mac-btn close" onClick={onLogout} title="Cerrar sesión"></span>
          <span className="mac-btn minimize" onClick={toggleTheme} title="Cambiar tema (Claro/Oscuro)"></span>
          <span className="mac-btn maximize" onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(e => console.log(e));
            } else {
              document.exitFullscreen();
            }
          }}></span>
        </div>
        <h1>Gestión Dra. Adriana</h1>
        <div style={{ width: '60px' }}></div>
      </header>

      <main className="dashboard-content">
        {activeTab === 'form' && renderForm()}
        {activeTab === 'daily' && renderDailyView()}
        {activeTab === 'weekly' && renderWeeklyView()}
        {activeTab === 'monthly' && renderMonthlyView()}
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
