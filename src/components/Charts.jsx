import React from 'react';
import Chart from 'react-apexcharts';

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE'];

// Gráfica de Donut para el Día (Distribución por Tipo de Solicitante)
export const DailyChart = ({ records }) => {
  if (!records || records.length === 0) return null;

  const dataMap = records.reduce((acc, r) => {
    acc[r.solicitante] = (acc[r.solicitante] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(dataMap);
  const series = Object.values(dataMap);

  const options = {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      }
    },
    labels: labels,
    colors: COLORS,
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { fontSize: '14px', fontWeight: 600, color: 'var(--ios-text-secondary)' },
            value: { fontSize: '24px', fontWeight: 700, color: 'var(--ios-text)' },
            total: {
              show: true,
              showAlways: false,
              label: 'Total',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--ios-text-secondary)'
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    theme: { mode: document.body.classList.contains('dark-theme') ? 'dark' : 'light' }
  };

  return (
    <div style={{ width: '100%', marginTop: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', color: 'var(--ios-text)', textAlign: 'center' }}>
        Por Solicitante
      </h3>
      <Chart options={options} series={series} type="donut" height={250} />
    </div>
  );
};

// Gráfica de Barras para la Semana (Volumen por día)
export const WeeklyChart = ({ records, weekDays }) => {
  if (!records || records.length === 0) return null;

  const data = weekDays.map(dateObj => {
    const dStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'short' });
    const count = records.filter(r => {
      if (!r.created_at) return false;
      const recordDate = new Date(r.created_at);
      const rDateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
      return rDateStr === dStr;
    }).length;
    return { x: dayName, y: count };
  });

  const options = {
    chart: {
      type: 'bar',
      fontFamily: 'inherit',
      background: 'transparent',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '40%',
      }
    },
    colors: ['#007AFF'],
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    xaxis: {
      categories: data.map(d => d.x),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: 'var(--ios-text-secondary)', fontSize: '12px' } }
    },
    yaxis: {
      labels: { style: { colors: 'var(--ios-text-secondary)' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    grid: {
      borderColor: 'var(--glass-border)',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } }
    },
    theme: { mode: document.body.classList.contains('dark-theme') ? 'dark' : 'light' }
  };

  const series = [{ name: 'Gestiones', data: data.map(d => d.y) }];

  return (
    <div style={{ width: '100%', marginTop: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: 'var(--ios-text)', textAlign: 'center' }}>
        Actividad Semanal
      </h3>
      <Chart options={options} series={series} type="bar" height={250} />
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
    const count = records.filter(r => {
      if (!r.created_at) return false;
      const recordDate = new Date(r.created_at);
      const rDateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
      return rDateStr === dStr;
    }).length;
    data.push({ x: String(i), y: count });
  }

  const options = {
    chart: {
      type: 'area',
      fontFamily: 'inherit',
      background: 'transparent',
      toolbar: { show: false }
    },
    colors: ['#007AFF'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.0,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: data.map(d => d.x),
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: 5,
      labels: { style: { colors: 'var(--ios-text-secondary)', fontSize: '12px' } }
    },
    yaxis: {
      labels: { style: { colors: 'var(--ios-text-secondary)' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    grid: {
      borderColor: 'var(--glass-border)',
      strokeDashArray: 4,
    },
    theme: { mode: document.body.classList.contains('dark-theme') ? 'dark' : 'light' }
  };

  const series = [{ name: 'Gestiones', data: data.map(d => d.y) }];

  return (
    <div style={{ width: '100%', marginTop: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: 'var(--ios-text)', textAlign: 'center' }}>
        Tendencia Mensual
      </h3>
      <Chart options={options} series={series} type="area" height={250} />
    </div>
  );
};
