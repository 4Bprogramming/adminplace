// components/Calendar/Calendar.jsx
"use client";
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Calendar({ onFechaSeleccionada }) {
  const [fechaCobro, setFechaCobro] = useState(null);

  const manejarCambioFecha = (fecha) => {
    setFechaCobro(fecha);
    if (onFechaSeleccionada) {
      onFechaSeleccionada(fecha);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">

      <div className="custom-datepicker">
        <DatePicker
          selected={fechaCobro}
          onChange={manejarCambioFecha}
          dateFormat="dd/MM/yyyy"
          minDate={new Date()}
          inline
        />
      </div>
    </div>
  );
}

export default Calendar;
