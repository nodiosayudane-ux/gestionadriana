import React from 'react';
import './WeeklySegmentedControl.css';

const WeeklySegmentedControl = ({ selectedDate, onDateChange }) => {
  // Get Monday of the current selected week
  const getMonday = (d) => {
    const date = new Date(d);
    date.setUTCHours(12, 0, 0, 0); // Avoid timezone shifts
    const day = date.getUTCDay();
    const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setUTCDate(diff));
  };

  const selectedDateObj = new Date(selectedDate + 'T12:00:00');
  const monday = getMonday(selectedDateObj);

  const days = [];
  const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setUTCDate(monday.getUTCDate() + i);
    const dateStr = current.toISOString().split('T')[0];
    const isSelected = dateStr === selectedDate;

    days.push(
      <button 
        key={dateStr} 
        className={`week-pill-day ${isSelected ? 'selected' : ''}`}
        onClick={() => onDateChange(dateStr)}
      >
        <span className="wp-name">{dayNames[i]}</span>
        <span className="wp-number">{current.getUTCDate()}</span>
      </button>
    );
  }

  const changeWeek = (offset) => {
    const newDate = new Date(selectedDateObj);
    newDate.setUTCDate(newDate.getUTCDate() + (offset * 7));
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  const monthName = monday.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  return (
    <div className="weekly-segmented-container">
      <div className="weekly-header">
        <button className="week-nav-btn" onClick={() => changeWeek(-1)}>Anterior</button>
        <span className="week-month-label">{monthName}</span>
        <button className="week-nav-btn" onClick={() => changeWeek(1)}>Siguiente</button>
      </div>
      <div className="week-pill-container">
        {days}
      </div>
    </div>
  );
};

export default WeeklySegmentedControl;
