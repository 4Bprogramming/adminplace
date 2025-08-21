// app/page.jsx
"use client";
// import Calendar from '@/components/Calendar/Calendar';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cuotas from '@/components/Calendar/Cuotas';

function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");

    if (!usuario) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600 text-lg">Cargando...</div>
      </div>
    );
  }

  const manejarFechaSeleccionada = (fecha) => {
    console.log('Fecha seleccionada:', fecha);
    // Aquí puedes hacer algo con la fecha
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
          Selecciona la fecha de cobro
        </h1>
        <Cuotas onFechaSeleccionada={manejarFechaSeleccionada} />
      </div>
    </div>
  );
}

export default Page;
