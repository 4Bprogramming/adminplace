"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HistorialCuotas from "@/components/HistorialCuotas/HistorialCuotas";


export default function Page({ params }) {
  const { idCliente } = params;
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (!usuario) router.push("/login");
    else setIsAuthenticated(true);
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600 text-lg">Cargando...</div>
      </div>
    );
  }

  return <HistorialCuotas clienteId={idCliente} />;
}
