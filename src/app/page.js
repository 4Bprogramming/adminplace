
"use client";
import Dashboard from "@/components/Dashboard/Dashboard";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import 'react-datepicker/dist/react-datepicker.css';
import AlertasDeCobro from "@/components/AlertaCobro/AlertasDeCobro";




export default function Home() {

  // const [isAuthenticated, setIsAuthenticated] = useState(null); // null = aún cargando
  //   const router = useRouter();
  
  //   useEffect(() => {
  //     const usuario = localStorage.getItem("usuario");
  
  //     if (!usuario) {
  //       router.push("/login"); 
  //     } else {
  //       setIsAuthenticated(true);
  //     }
  //   }, [router]);
  
  //   if (isAuthenticated === null) {
  //     // Puedes mostrar un loader mientras verifica
  //     return <div className="text-center mt-10">Cargando...</div>;
  //   }
  
  return (
    <div >
       <AlertasDeCobro
        />
        <Dashboard
        />

    </div>
  );
}
