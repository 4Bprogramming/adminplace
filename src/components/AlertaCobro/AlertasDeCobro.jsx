"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

function AlertasDeCobro() {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BASEURL}/attendance`);
        if (!res.ok) throw new Error("Error al obtener las cuotas");
        const data = await res.json();

        setAttendanceData(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (attendanceData.length === 0) return;

    const hoy = new Date();
    const enDosDias = new Date();
    enDosDias.setDate(hoy.getDate() + 2);

    const vencidas = [];
    const proximas = [];

    attendanceData.forEach((cuota) => {
      if (cuota.status === "pagada") return; // 🔴 Ignorar cuotas pagadas

      const fechaCuota = new Date(cuota.date);

      if (fechaCuota < hoy) {
        vencidas.push(cuota);
      } else if (fechaCuota >= hoy && fechaCuota <= enDosDias) {
        proximas.push(cuota);
      }
    });

    if (vencidas.length || proximas.length) {
      const mensajeVencidas = vencidas
        .map(
          (c) =>
            `🔴 ${c?.employee?.first_name} ${c?.employee?.last_name} - ${c.date}`
        )
        .join("<br>");

      const mensajeProximas = proximas
        .map(
          (c) =>
            `🟡 ${c?.employee?.first_name} ${c?.employee?.last_name} - ${c.date}`
        )
        .join("<br>");

      Swal.fire({
        title: "Cuotas pendientes",
        html: `
          ${
            vencidas.length
              ? `<strong>Vencidas:</strong><br>${mensajeVencidas}<br><br>`
              : ""
          }
          ${
            proximas.length
              ? `<strong>Próximas a vencer:</strong><br>${mensajeProximas}`
              : ""
          }
        `,
        icon: "warning",
        confirmButtonText: "Entendido",
      });
    }
  }, [attendanceData]);

  // Este componente no necesita renderizar nada
  return null;
}

export default AlertasDeCobro;
