"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import "react-datepicker/dist/react-datepicker.css";

const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

function Cuotas() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const employeeId = searchParams.get("id");
  const name = searchParams.get("name");

  const [fecha, setFecha] = useState(null);
  const [cuota, setCuota] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fecha || !cuota) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Todos los campos son obligatorios.",
      });
      return;
    }

    if (!employeeId) {
      Swal.fire({
        icon: "error",
        title: "Cliente no seleccionado",
        text: "Primero debes seleccionar un Cliente.",
      });
      return;
    }

    const payload = {
      date: fecha.toISOString().split("T")[0], // formato YYYY-MM-DD
      cuota: cuota,
      employee_id: parseInt(employeeId),
    };

    try {
      const res = await fetch(`${BASEURL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar la cuota");

      await Swal.fire({
        icon: "success",
        title: "Cuota guardada",
        text: "La cuota se agregó correctamente.",
      });

      router.push("/");

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: "Ocurrió un error al enviar la cuota.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">
          Agregar Cuota a {name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Fecha:</label>
            <DatePicker
              selected={fecha}
              onChange={setFecha}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Monto a pagar ($):</label>
            <input
              type="number"
              value={cuota}
              onChange={(e) => setCuota(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Ej. 500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
            Guardar Cuota
          </button>
        </form>
      </div>
    </div>
  );
}

export default Cuotas;
