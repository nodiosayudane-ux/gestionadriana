import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CustomCalendar.css';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CustomCalendar({ mode, selectedDate, onDateChange }) {
  // selectedDate is a string YYYY-MM-DD or YYYY-MM
  const initialDate = new Date(selectedDate || new Date().toISOString().split('T')[0]);
  const [currentViewDate, setCurrentViewDate] = useState(initialDate);

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(new Date(year, month + 1, 1));
  };

  const handlePrevYear = () => {
    setCurrentViewDate(new Date(year - 1, month, 1));
  };

  const handleNextYear = () => {
    setCurrentViewDate(new Date(year + 1, month, 1));
  };

  const handleDayClick = (day) => {
    const newDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateChange(newDateStr);
  };

  const handleMonthClick = (mIndex) => {
    const newMonthStr = `${year}-${String(mIndex + 1).padStart(2, '0')}`;
    onDateChange(newMonthStr);
  };

  // Generate calendar grid
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);

  if (mode === 'monthly') {
    return (
      <div className="custom-calendar-container">
        <div className="calendar-header">
          <button onClick={handlePrevYear} className="nav-btn"><ChevronLeft size={20} /></button>
          <span className="calendar-title">{year}</span>
          <button onClick={handleNextYear} className="nav-btn"><ChevronRight size={20} /></button>
        </div>
        <div className="months-grid">
          {MONTHS.map((mName, idx) => {
            const mStr = `${year}-${String(idx + 1).padStart(2, '0')}`;
            const isSelected = selectedDate === mStr;
            return (
              <div 
                key={mName} 
                className={`month-cell ${isSelected ? 'selected' : ''}`}
                onClick={() => handleMonthClick(idx)}
              >
                {mName.substring(0, 3)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Daily and Weekly share the same day grid picker
  return (
    <div className="custom-calendar-container">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-btn"><ChevronLeft size={20} /></button>
        <span className="calendar-title">{MONTHS[month]} {year}</span>
        <button onClick={handleNextMonth} className="nav-btn"><ChevronRight size={20} /></button>
      </div>
      <div className="days-header">
        {DAYS.map(d => <div key={d} className="day-name">{d}</div>)}
      </div>
      <div className="days-grid">
        {blanks.map((_, i) => <div key={`blank-${i}`} className="day-cell empty"></div>)}
        {days.map(d => {
          const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          
          let isSelected = false;
          let isHighlighted = false;

          if (mode === 'daily') {
            isSelected = selectedDate === dStr;
          } else if (mode === 'weekly') {
            const targetDateObj = new Date(selectedDate);
            const currentCellObj = new Date(dStr);
            const diffDays = (targetDateObj - currentCellObj) / (1000 * 60 * 60 * 24);
            
            if (selectedDate === dStr) isSelected = true;
            else if (diffDays > 0 && diffDays < 7) isHighlighted = true;
          }

          return (
            <div 
              key={d} 
              className={`day-cell ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
              onClick={() => handleDayClick(d)}
            >
              <div className="day-number">{d}</div>
            </div>
          );
        })}
      </div>
      {mode === 'weekly' && (
        <div className="calendar-footer-hint">
          Selecciona un día para ver los 7 días anteriores
        </div>
      )}
    </div>
  );
}
