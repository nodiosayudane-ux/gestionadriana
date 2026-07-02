import React, { useRef, useEffect } from 'react';
import './EpsSelector.css';

const EpsSelector = ({ options, value, onChange }) => {
  const scrollRef = useRef(null);

  // Opcional: Centrar automáticamente el scroll en el elemento seleccionado
  useEffect(() => {
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('.eps-pill.selected');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [value]);

  return (
    <div className="eps-selector-container" ref={scrollRef}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`eps-pill ${value === opt ? 'selected' : ''}`}
          onClick={(e) => {
            e.preventDefault(); // Evitar submit del form
            // Si tocamos la que ya está seleccionada, la "cerramos" (deseleccionamos) enviando cadena vacía
            onChange(value === opt ? '' : opt);
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

export default EpsSelector;
