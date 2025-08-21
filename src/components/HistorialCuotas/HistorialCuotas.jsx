"use client";
import { useEffect, useState } from "react";

const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

function HistorialCuotas({ clienteId }) {
  const [todasCuotas, setTodasCuotas] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCuotas = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASEURL}/attendance`);
        if (!res.ok) throw new Error("Error al obtener cuotas");
        const data = await res.json();
        setTodasCuotas(data);
      } catch (error) {
        console.error("Error al cargar cuotas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCuotas();
  }, []);


  const estados = ["todas", "vencida", "por vencer", "vigente", "pagada"];

  // Filtramos por cliente e incluso por estado
  const cuotasFiltradas = todasCuotas.filter((c) => {
    return (
      c.employee.id.toString() === clienteId.toString() &&
      (estadoFiltro === "" || estadoFiltro === "todas" || c.status === estadoFiltro)
    );
  });

  if (loading) {
    return <div className="text-center py-6">Cargando historial...</div>;
  }
console.log(cuotasFiltradas, "aca estan todas las cuotas");
  return (
    <div className="p-6 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Historial de Cuotas - Cliente {cuotasFiltradas[0]?.employee?.first_name || clienteId}
      </h2>

      <div className="mb-4">
        <label className="font-medium mr-2">Filtrar por estado:</label>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="p-2 border rounded"
        >
          {estados.map((e) => (
            <option key={e} value={e === "todas" ? "" : e}>
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-200 shadow-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">Fecha</th>
              <th className="p-2 border">Monto</th>
              <th className="p-2 border">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cuotasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center p-4">
                  No hay cuotas para este filtro.
                </td>
              </tr>
            ) : (
              cuotasFiltradas.map((c) => (
                <tr key={c.attendance_id} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">
                    {new Date(c.date).toLocaleDateString()}
                  </td>
                  <td className="p-2 border">${c.cuota}</td>
                  <td className="p-2 border font-semibold capitalize">{c.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistorialCuotas;
