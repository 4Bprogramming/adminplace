"use client";

import React, { Suspense } from "react";
import Cuotas from "@/components/Calendar/Cuotas";

function Page() {
  const manejarFechaSeleccionada = (fecha) => {
    console.log("Fecha seleccionada:", fecha);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
          Selecciona la fecha de cobro
        </h1>

        {/* ✅ Aquí está la clave: envolver el componente en Suspense */}
        <Suspense fallback={<div>Cargando formulario...</div>}>
          <Cuotas onFechaSeleccionada={manejarFechaSeleccionada} />
        </Suspense>
      </div>
    </div>
  );
}

export default Page;
