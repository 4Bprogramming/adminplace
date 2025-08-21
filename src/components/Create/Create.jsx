"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { data as cityData } from "../../utils/data.js";


const BASEURL = process.env.NEXT_PUBLIC_BASEURL;
function Create() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    hire_date: "",
    place: "",
    job_id: "",
    salary: "",
    department_id: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si cambia el lugar (place), calculamos el precio
    if (name === "place") {
      const ciudadSeleccionada = cityData.find((ciudad) => ciudad.ciudad === value);
      const km = ciudadSeleccionada?.km || 0;
      const precio = (km * 0.7).toFixed(2);

      setFormData({
        ...formData,
        place: value,
        salary: precio,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASEURL}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error del backend:", data);
        Swal.fire({
          title: "Error",
          text:
            data.message ||
            (data.errors ? data.errors.join(", ") : "Error desconocido"),
          icon: "error",
        });
        return;
      }

      Swal.fire({
        title: "¡Éxito!",
        text: "Su solicitud ha sido enviada con éxito",
        icon: "success",
      });

      // Limpiar formulario
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        hire_date: "",
        place: "",
        job_id: "",
        salary: "",
        department_id: "",
      });
    } catch (err) {
      console.error("Error de red:", err);
      Swal.fire({
        title: "Error de red",
        text: err.message,
        icon: "error",
      });
    }
  };

  return (
    <div className="md:w-7/12 mx-auto mt-10 px-2">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-md rounded-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Solicitud</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {["first_name", "last_name", "email", "phone_number", "hire_date"].map((field) => (
            <div key={field}>
              <input
                type={field === "hire_date" ? "date" : "text"}
                id={field}
                name={field}
                value={formData[field]}
                placeholder={field.replace("_", " ")}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          ))}

          {/* Select para ciudades */}
          <div>
            <select
              id="place"
              name="place"
              value={formData.place}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Seleccione una ciudad</option>
              {cityData.map((item) => (
                <option key={item.ciudad} value={item.ciudad}>
                  {item.ciudad}
                </option>
              ))}
            </select>
          </div>

          {/* Campo solo lectura para el "Precio del viaje" */}
          <div>
            <input
              type="text"
              id="salary"
              name="salary"
              value={formData.salary}
              placeholder="Precio del viaje"
              readOnly
              className="bg-gray-100 cursor-not-allowed shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Job select */}
          <div className="mb-4">
            <select
              id="job_id"
              name="job_id"
              value={formData.job_id}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Seleccione tipo de trabajo</option>
              <option value="1">Mantenimiento</option>
              <option value="2">Reparación</option>
              <option value="3">Cotización</option>
            </select>
          </div>

          {/* Department select */}
          <div className="mb-4">
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Tipo de departamento</option>
              <option value="1">pintura</option>
              <option value="2">Tapizado</option>
              <option value="3">Bomba hidráulica</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-md w-36 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default Create;