import { useState, useRef, useEffect } from 'react';
import './IosSelect.css';

export default function IosSelect({ value, options, onChange, placeholder = "Seleccionar..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="ios-select-container" ref={dropdownRef}>
      <div 
        className={`ios-select-trigger ${!value ? 'placeholder' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || placeholder}</span>
      </div>
      
      {isOpen && (
        <div className="ios-select-menu glass">
          {options.map((opt) => (
            <div 
              key={opt} 
              className={`ios-select-item ${value === opt ? 'selected' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
              {value === opt && <span className="ios-checkmark">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
