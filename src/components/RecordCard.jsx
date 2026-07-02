import React from 'react';

const RecordCard = ({ record: r }) => {
  const solicitanteBadgeColor = (s) => {
    const map = { EPS:'#34C759', Particular:'#FF9500', Institucional:'#AF52DE', Gobernación:'#FF3B30', Dirección:'#007AFF' };
    return map[s] || '#8E8E93';
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      
      return (
        <React.Fragment key={index}>
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const innerText = part.slice(2, -2);
              return <span key={i} className="rc-md-key">{innerText}</span>;
            }
            return <span key={i}>{part}</span>;
          })}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="record-card-v2">
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
            <p className="rc-contact-name" style={{textTransform: 'capitalize'}}>{r.particular_nombre.toLowerCase()}</p>
            <p className="rc-contact-detail">{r.particular_tipo_doc} {r.particular_numero_doc} &nbsp;·&nbsp; 📞 {r.particular_telefono}</p>
          </div>
        </div>
      )}
      {r.solicitante === 'EPS' && r.eps_nombre && (
        <div className="rc-contact-block">
          <div className="rc-contact-icon">🏥</div>
          <div>
            <p className="rc-contact-name" style={{textTransform: 'capitalize'}}>{r.eps_nombre.toLowerCase()}</p>
            <p className="rc-contact-detail">Contacto: {r.eps_contacto} &nbsp;·&nbsp; 📞 {r.eps_telefono}</p>
          </div>
        </div>
      )}
      {r.solicitante === 'Institucional' && r.inst_nombre && (
        <div className="rc-contact-block">
          <div className="rc-contact-icon">🏛️</div>
          <div>
            <p className="rc-contact-name" style={{textTransform: 'capitalize'}}>{r.inst_nombre.toLowerCase()}</p>
            <p className="rc-contact-detail">{r.inst_dependencia} &nbsp;·&nbsp; {r.inst_contacto}</p>
          </div>
        </div>
      )}
      {r.solicitante === 'Gobernación' && r.gob_secretaria && (
        <div className="rc-contact-block">
          <div className="rc-contact-icon">🏢</div>
          <div>
            <p className="rc-contact-name" style={{textTransform: 'capitalize'}}>{r.gob_secretaria.toLowerCase()}</p>
            <p className="rc-contact-detail" style={{textTransform: 'capitalize'}}>{r.gob_funcionario.toLowerCase()} &nbsp;·&nbsp; 📞 {r.gob_telefono}</p>
          </div>
        </div>
      )}
      {r.solicitante === 'Dirección' && r.dir_funcionario && (
        <div className="rc-contact-block">
          <div className="rc-contact-icon">👩‍⚕️</div>
          <div>
            <p className="rc-contact-name" style={{textTransform: 'capitalize'}}>{r.dir_funcionario.toLowerCase()}</p>
            <p className="rc-contact-detail" style={{textTransform: 'capitalize'}}>{r.dir_dependencia.toLowerCase()}</p>
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
          <div className="rc-text-content">{renderFormattedText(r.descripcion)}</div>
        </div>
        <div className="rc-text-block" style={{ paddingTop: 0 }}>
          <p className="rc-text-label">Gestión Realizada</p>
          <div className="rc-text-content">{renderFormattedText(r.gestion_realizada)}</div>
        </div>
      </div>
    </div>
  );
};

export default RecordCard;
