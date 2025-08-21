"use client";

import { useState, useEffect, useRef } from "react";
import useAllEmployees from "../../utils/useAllEmployees";
import useSingleEmployeeData from "../../utils/useSingleEmployeeData";
import { FaRegTrashCan } from "react-icons/fa6";
import { ImCross, ImArrowDown } from "react-icons/im";
import Link from "next/link";
import Swal from "sweetalert2";

const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

function AllWorks() {
  const [allemployees, loading, refetch] = useAllEmployees();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef(null);

  const [singleEmployee, singleLoading] = useSingleEmployeeData(selectedEmployeeId);

  useEffect(() => {
    if (selectedEmployeeId && singleEmployee && !singleLoading && modalRef.current) {
      modalRef.current.showModal();
    }
  }, [selectedEmployeeId, singleEmployee, singleLoading]);

  const employeeDetails = (employeeId) => setSelectedEmployeeId(employeeId);

  const employeeDelete = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${BASEURL}/employees/${id}`, { method: "DELETE" })
          .then((res) => res.json())
          .then((data) => {
            if (data.deletedCount > 0) {
              Swal.fire("Eliminado", "Empleado eliminado exitosamente.", "success");
              refetch();
            }
          });
      }
    });
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const filteredEmployees = allemployees.filter((employee) =>
    [employee.first_name, employee.last_name, employee.email]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="md:w-10/12 w-[95%] mx-auto bg-white dark:bg-[#080808] mb-6 shadow-lg rounded-md border border-gray-200 dark:border-[#222]">
        <div className="p-3">
          {/* Search Input */}
          <div className="flex justify-between mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Buscar por nombre o email"
              className="p-2 border border-gray-300 rounded-md w-full md:w-1/2"
              aria-label="Buscar empleado"
            />
          </div>

          {/* MOBILE VIEW */}
          <div className="block md:hidden space-y-4">
            {loading ? (
              <div className="text-center py-6">
                <img src="https://i.ibb.co/qJzzZWj/j-KEc-VPZFk-2.gif" alt="Loading" />
              </div>
            ) : (
              filteredEmployees.map((e) => (
                <div key={e.id} className="p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-md shadow-sm">
                  <div className="space-y-1 text-sm">
                    <p><strong>Nombre:</strong> {e.first_name} {e.last_name}</p>
                    <p><strong>Email:</strong> {e.email}</p>
                    <p><strong>Teléfono:</strong> {e.phone_number}</p>
                    <p><strong>Fecha:</strong> {e.hire_date?.slice(0, 10)}</p>
                    <p><strong>Costo:</strong> ${e.salary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => employeeDetails(e.id)}
                      className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm"
                    >
                      Detalles
                    </button>
                    <Link
                      href={`/updateEmployee/${e.id}`}
                      className="border border-blue-500 text-blue-500 hover:bg-blue-100 px-3 py-1 rounded-md text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => employeeDelete(e.id)}
                      className="text-red-500 hover:text-red-700 text-xl"
                      aria-label="Eliminar empleado"
                    >
                      <FaRegTrashCan />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border-collapse text-sm text-left">
              <thead className="bg-gray-100 dark:bg-[#1f1f1f] sticky top-0 z-10">
                <tr className="text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
                  <th className="px-4 py-3 border-b">Nombre</th>
                  <th className="px-4 py-3 border-b">Email</th>
                  <th className="px-4 py-3 border-b">Teléfono</th>
                  <th className="px-4 py-3 border-b">Fecha</th>
                  <th className="px-4 py-3 border-b text-center">Costo</th>
                  <th className="px-4 py-3 border-b text-center">Detalles</th>
                  <th className="px-4 py-3 border-b text-center">Actualizar</th>
                  <th className="px-4 py-3 border-b text-center">Eliminar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#333]">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center p-6">
                      <img src="https://i.ibb.co/qJzzZWj/j-KEc-VPZFk-2.gif" alt="Cargando" />
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-[#111]">
                      <td className="px-4 py-3 whitespace-nowrap">{e.first_name} {e.last_name}</td>
                      <td className="px-4 py-3">{e.email}</td>
                      <td className="px-4 py-3">{e.phone_number}</td>
                      <td className="px-4 py-3">{e.hire_date?.slice(0, 10)}</td>
                      <td className="px-4 py-3 text-center">${e.salary}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => employeeDetails(e.id)}
                          className="bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-md px-3 py-1 text-sm"
                        >
                          Ver <ImArrowDown className="inline ml-1" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/updateEmployee/${e.id}`}
                          className="border border-blue-500 text-blue-500 hover:bg-blue-100 rounded-md px-3 py-1 text-sm"
                        >
                          Editar
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => employeeDelete(e.id)}
                          className="text-red-500 hover:text-red-700 text-lg"
                          aria-label="Eliminar empleado"
                        >
                          <FaRegTrashCan />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <div className="modal-action -mb-12 mr-4">
            <form method="dialog">
              <button className="text-[red] text-[16px]">
                <ImCross />
              </button>
            </form>
          </div>

          {singleLoading ? (
            <div className="p-6 text-center">Cargando detalles del empleado...</div>
          ) : singleEmployee ? (
            <div className="bg-white dark:bg-[#1a1a1a] shadow-md rounded-lg p-10">
              <h2 className="text-xl font-semibold mb-4">
                {singleEmployee.first_name} {singleEmployee.last_name}
              </h2>
              <div className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Email:</strong> {singleEmployee.email}</p>
                <p><strong>Teléfono:</strong> {singleEmployee.phone_number || "No disponible"}</p>
                <p><strong>Fecha de ingreso:</strong> {singleEmployee.hire_date?.slice(0, 10)}</p>
                <p><strong>Lugar:</strong> {singleEmployee.place || "N/A"}</p>
                <p><strong>Costo:</strong> ${singleEmployee.salary}</p>
                <p><strong>Puesto:</strong> {singleEmployee?.job?.job_title}</p>
                <p><strong>Departamento:</strong> {singleEmployee?.department?.department_name}</p>
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                <Link
                  href={{
                    pathname: "/factura",
                    query: {
                      id: singleEmployee.id,
                      name: `${singleEmployee.first_name} ${singleEmployee.last_name}`,
                      salary: singleEmployee.salary,
                      email: singleEmployee.email,
                      phone: singleEmployee.phone_number,
                      address: singleEmployee.place || "N/A",
                    },
                  }}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded text-sm px-4 py-2"
                >
                  Cotizar
                </Link>

                <Link
                  href={{
                    pathname: "/cobro",
                    query: {
                      id: singleEmployee.id,
                      name: `${singleEmployee.first_name} ${singleEmployee.last_name}`,
                    },
                  }}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold rounded text-sm px-4 py-2"
                >
                  Agregar Cuota
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">Empleado no encontrado.</div>
          )}
        </div>
      </dialog>
    </div>
  );
}

export default AllWorks;
