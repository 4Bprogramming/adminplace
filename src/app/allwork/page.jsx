"use client";
import AllWorks from '@/components/AllWorks/AllWorks'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function page() {

  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = aún cargando
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
    // Puedes mostrar un loader mientras verifica
    return <div className="text-center mt-10">Cargando...</div>;
  }

  
  return (
    <div>
        <AllWorks />
    </div>
  )
}

export default page