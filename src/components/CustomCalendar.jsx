import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CustomCalendar.css';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CustomCalendar({ selectedDate, selectedMonth, onDateChange, onMonthChange }) {
  // We use selectedMonth to determine what month grid to show
  // selectedMonth is YYYY-MM
  const [year, month] = selectedMonth.split('-').map(Number);
  
  // Actually month string is 1-indexed (01-12)
  const currentMonthIdx = month - 1; 

  const handlePrevMonth = () => {
    const d = new Date(year, currentMonthIdx - 1, 1);
    onMonthChange(d.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const d = new Date(year, currentMonthIdx + 1, 1);
    onMonthChange(d.toISOString().slice(0, 7));
  };

  const handleDayClick = (day) => {
    const newDateStr = `${year}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateChange(newDateStr);
  };

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, currentMonthIdx);
  const firstDay = getFirstDayOfMonth(year, currentMonthIdx);
  
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);

  return (
    <div className="custom-calendar-container">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-btn"><ChevronLeft size={20} /></button>
        <span className="calendar-title">{MONTHS[currentMonthIdx]} {year}</span>
        <button onClick={handleNextMonth} className="nav-btn"><ChevronRight size={20} /></button>
      </div>
      
      <div className="calendar-body">
        <div className="days-header">
          {DAYS.map(d => <div key={d} className="day-name">{d}</div>)}
        </div>
        
        <div className="days-grid">
          {blanks.map((_, i) => <div key={`blank-${i}`} className="day-cell empty"></div>)}
          {days.map(d => {
            const dStr = `${year}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = selectedDate === dStr;

            return (
              <div 
                key={d} 
                className={`day-cell ${isSelected ? 'selected' : ''}`}
                onClick={() => handleDayClick(d)}
              >
                <div className="day-number">{d}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
