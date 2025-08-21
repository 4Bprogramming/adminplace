"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";

const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

function ListadoCuotas() {
  const [cuotas, setCuotas] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCuotas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASEURL}/attendance`);
      if (!res.ok) throw new Error("Error al obtener cuotas");
      const data = await res.json();
      setCuotas(data);
    } catch (error) {
      console.error("Error al cargar cuotas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCuotas();
  }, []);

  const handleMarkAsPaid = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Marcar como pagada?",
      text: "Esta acción actualizará el estado de la cuota a 'pagada'.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`${BASEURL}/attendance/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "pagada" }),
        });

        if (!res.ok) throw new Error("Error al actualizar cuota");

        Swal.fire({
          icon: "success",
          title: "Actualizada",
          text: "La cuota ha sido marcada como pagada.",
        });

        fetchCuotas(); // Refrescar la tabla
      } catch (error) {
        console.error("Error al actualizar cuota:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar la cuota.",
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "vencida":
        return "text-red-600";
      case "por vencer":
        return "text-yellow-600";
      case "vigente":
        return "text-green-600";
      case "pagada":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredCuotas = cuotas.filter((c) => {
    const fullName = `${c.employee.first_name} ${c.employee.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Listado de Cuotas</h2>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar cliente..."
        className="mb-4 w-full md:w-1/2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <div className="text-center py-10">Cargando cuotas...</div>
      ) : (
        <>
          {/* Tabla para escritorio */}
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full table-auto border border-gray-200 shadow-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 border">Cliente</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Fecha</th>
                  <th className="p-2 border">Monto</th>
                  <th className="p-2 border">Estado</th>
                  <th className="p-2 border text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCuotas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      No se encontraron resultados
                    </td>
                  </tr>
                ) : (
                  filteredCuotas.map((c) => (
                    <tr key={c.attendance_id} className="border-b hover:bg-gray-50">
                      <td className="p-2 border">
                        {c.employee.first_name} {c.employee.last_name}
                      </td>
                      <td className="p-2 border">{c.employee.email}</td>
                      <td className="p-2 border">
                        {new Date(c.date).toLocaleDateString()}
                      </td>
                      <td className="p-2 border">${c.cuota}</td>
                      <td className={`p-2 border font-semibold capitalize ${getStatusColor(c.status)}`}>
                        {c.status}
                      </td>
                      <td className="p-2 border text-center flex flex-col items-center gap-2">
                        {c.status !== "pagada" && (
                          <button
                            onClick={() => handleMarkAsPaid(c.attendance_id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                          >
                            Marcar como Pagada
                          </button>
                        )}
                        <Link
                          href={`/cuotas/${c.employee.id}`}
                          className="text-blue-500 underline text-sm hover:text-blue-700"
                        >
                          Ver Historial
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Tarjetas para móvil */}
          <div className="md:hidden space-y-4">
            {filteredCuotas.length === 0 ? (
              <div className="text-center text-gray-500">No se encontraron resultados</div>
            ) : (
              filteredCuotas.map((c) => (
                <div key={c.attendance_id} className="border p-4 rounded shadow-sm">
                  <p><span className="font-semibold">Cliente:</span> {c.employee.first_name} {c.employee.last_name}</p>
                  <p><span className="font-semibold">Email:</span> {c.employee.email}</p>
                  <p><span className="font-semibold">Fecha:</span> {new Date(c.date).toLocaleDateString()}</p>
                  <p><span className="font-semibold">Monto:</span> ${c.cuota}</p>
                  <p className={`font-semibold capitalize ${getStatusColor(c.status)}`}>
                    Estado: {c.status}
                  </p>

                  <div className="mt-3 flex flex-col gap-2">
                    {c.status !== "pagada" && (
                      <button
                        onClick={() => handleMarkAsPaid(c.attendance_id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm w-full text-center"
                      >
                        Marcar como Pagada
                      </button>
                    )}
                    <Link
                      href={`/cuotas/${c.employee.id}`}
                      className="text-blue-500 underline text-sm hover:text-blue-700"
                    >
                      Ver Historial
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ListadoCuotas;
