import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--ios-surface)',
        padding: '10px 14px',
        border: '1px solid var(--ios-border)',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        color: 'var(--ios-text)'
      }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{label || payload[0].name}</p>
        <p style={{ margin: '4px 0 0 0', color: payload[0].color || 'var(--ios-blue)', fontSize: '15px' }}>
          Gestiones: <span style={{fontWeight: 700}}>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Gráfica de Donut para el Día (Distribución por Tipo de Solicitante)
export const DailyChart = ({ records }) => {
  if (!records || records.length === 0) return null;

  const dataMap = records.reduce((acc, r) => {
    acc[r.solicitante] = (acc[r.solicitante] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(dataMap).map(key => ({
    name: key,
    value: dataMap[key]
  }));

  return (
    <div style={{ width: '100%', height: 200, marginTop: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: 'var(--ios-text)', textAlign: 'center' }}>
        Por Solicitante
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Gráfica de Barras para la Semana (Volumen por día)
export const WeeklyChart = ({ records, weekDays }) => {
  if (!records || records.length === 0) return null;

  // weekDays es un array de objetos de fecha
  const data = weekDays.map(dateObj => {
    const dStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'short' });
    const count = records.filter(r => r.fecha_creacion && r.fecha_creacion.startsWith(dStr)).length;
    return { name: dayName, Gestiones: count };
  });

  return (
    <div style={{ width: '100%', height: 220, marginTop: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: 'var(--ios-text)', textAlign: 'center' }}>
        Actividad Semanal
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--ios-text-secondary)', fontSize: 12}} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: 'var(--ios-text-secondary)', fontSize: 12}} />
          <Tooltip cursor={{fill: 'rgba(0,122,255,0.05)', rx: 8}} content={<CustomTooltip />} />
          <Bar dataKey="Gestiones" fill="var(--ios-blue)" radius={[6, 6, 6, 6]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Gráfica de Área para el Mes (Tendencia mensual)
export const MonthlyChart = ({ records, month, year }) => {
  if (!records || records.length === 0) return null;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const data = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const count = records.filter(r => r.fecha_creacion && r.fecha_creacion.startsWith(dStr)).length;
    data.push({ name: String(i), Gestiones: count });
  }

  return (
    <div style={{ width: '100%', height: 200, marginTop: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: 'var(--ios-text)', textAlign: 'center' }}>
        Tendencia Mensual
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGestiones" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--ios-blue)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--ios-blue)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--ios-text-secondary)', fontSize: 12}} interval={4} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: 'var(--ios-text-secondary)', fontSize: 12}} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="Gestiones" stroke="var(--ios-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorGestiones)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
