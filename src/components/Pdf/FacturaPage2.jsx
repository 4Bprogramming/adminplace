"use client";

import { useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import { PDFViewer, PDFDownloadLink, pdf } from "@react-pdf/renderer";
import Factura from "./Factura";
import * as XLSX from "xlsx";

const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

function FacturaPage() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");
  const customerNameFromURL = searchParams.get("name");
  const initialTravelCost = parseFloat(searchParams.get("salary")) || 0;
  const email = searchParams.get("email");
  const phoneFromURL = searchParams.get("phone");
  const address = searchParams.get("address");

  const fileInputRef = useRef(null);

  // Estado general
  const [customerName, setCustomerName] = useState(customerNameFromURL || "");
  const [phoneNumber, setPhoneNumber] = useState(phoneFromURL || "");
  const [facturaId, setFacturaId] = useState("");
  const [pdfUrl, setPdfUrl] = useState(""); // <-- NUEVO: Para guardar la URL de Cloudinary

  // ---------------------- COSTO DEL VIAJE ---------------------- //
  const [includeTravelCost, setIncludeTravelCost] = useState(initialTravelCost > 0);
  const [travelKm, setTravelKm] = useState(initialTravelCost / 0.5 || 0);
  const travelCost = travelKm * 0.5;

  // ---------------------- PRODUCTOS ---------------------- //
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", quantity: 1 });
  const [editIndex, setEditIndex] = useState(null);
  const [editItem, setEditItem] = useState({ name: "", price: "", quantity: 1 });
  const [importError, setImportError] = useState("");

  // ---------------------- IVA Y DESCUENTO ---------------------- //
  const [includeIVA, setIncludeIVA] = useState(false);
  const [ivaRate, setIvaRate] = useState(21);

  const [discountType, setDiscountType] = useState("none");
  const [discountValue, setDiscountValue] = useState(0);

  // ---------------------- MANEJO DE PRODUCTOS ---------------------- //
  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) return;
    setItems([
      ...items,
      {
        ...newItem,
        price: parseFloat(newItem.price),
        quantity: parseInt(newItem.quantity),
      },
    ]);
    setNewItem({ name: "", price: "", quantity: 1 });
  };

  const handleRemoveItem = (indexToRemove) => {
    setItems(items.filter((_, index) => index !== indexToRemove));
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    const item = items[index];
    setEditItem({ ...item });
  };

  const handleSaveEdit = () => {
    const updated = [...items];
    updated[editIndex] = {
      ...editItem,
      price: parseFloat(editItem.price),
      quantity: parseInt(editItem.quantity),
    };
    setItems(updated);
    setEditIndex(null);
  };

  // ---------------------- IMPORTAR EXCEL ---------------------- //
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const importedItems = jsonData
          .map((row) => ({
            name:
              row["Producto"] ||
              row["Product"] ||
              row["Nombre"] ||
              row["Descripción"] ||
              "",
            price: parseFloat(
              row["Precio"] || row["Price"] || row["Costo"] || 0
            ),
            quantity: parseInt(row["Cantidad"] || row["Quantity"] || 1),
          }))
          .filter((i) => i.name && i.price > 0);

        if (importedItems.length === 0) {
          setImportError("No se encontraron productos válidos en el archivo.");
          return;
        }

        setItems([...items, ...importedItems]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch {
        setImportError("Error procesando el archivo Excel.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ---------------------- CÁLCULOS ---------------------- //
  const allItems = includeTravelCost
    ? [{ name: "Costo del Viaje", price: travelCost, quantity: 1 }, ...items]
    : items;

  const subtotal = allItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let discountAmount = 0;
  if (discountType === "percent") {
    discountAmount = (subtotal * discountValue) / 100;
  } else if (discountType === "amount") {
    discountAmount = discountValue;
  }

  const subtotalAfterDiscount = Math.max(subtotal - discountAmount, 0);
  const ivaAmount = includeIVA ? (subtotalAfterDiscount * ivaRate) / 100 : 0;
  const total = subtotalAfterDiscount + ivaAmount;

  const invoiceData = {
    factura_id: facturaId,
    customerName,
    phone: phoneNumber,
    email,
    address,
    date: new Date().toISOString().split("T")[0],
    items: allItems,
    subtotal,
    discountAmount,
    discountType,
    discountValue,
    ivaRate,
    ivaAmount,
    total,
    pdfUrl, // <-- NUEVO: Incluir la URL del PDF
  };

  // ---------------------- FUNCIÓN PARA SUBIR PDF A CLOUDINARY ---------------------- //
   const uploadPdfToCloudinary = async (pdfBlob) => {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = 'next_cloudinary_app';
    
     // ✅ NOMBRE DEL ARCHIVO CON EXTENSIÓN
    const fileName = `factura_${customerName || "nuevo"}_${invoiceData.date}.pdf`;

    const formData = new FormData();
    formData.append('file', pdfBlob);
    formData.append('upload_preset', uploadPreset);
    formData.append('resource_type', 'raw');
    formData.append('public_id', fileName); // ✅ PUBLIC_ID CON .PDF
    // ✅ FORZAR QUE SE GUARDE COMO PDF
    // formData.append('filename', `factura_${customerName || "nuevo"}_${invoiceData.date}.pdf`);

    console.log('📤 Subiendo PDF...');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.secure_url) {
      // ✅ URL DE DESCARGA QUE FORZA EL NOMBRE
      const downloadUrl = `${data.secure_url}/fl_attachment:${fileName}`;
      
      setPdfUrl(downloadUrl);
      console.log("✅ PDF subido exitosamente:");
      console.log("🔗 URL Cloudinary:", data.secure_url);
      console.log("📥 URL Descarga:", downloadUrl);
      
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: "success",
          title: "PDF subido",
          html: `
            <div>
              <p>El PDF se ha subido correctamente a Cloudinary.</p>
              <a href="${downloadUrl}" target="_blank" class="underline text-blue-600">
                Descargar PDF
              </a>
            </div>
          `,
          timer: 3000,
        });
      }
      
      return downloadUrl;
    } else {
      throw new Error(data.error?.message || 'Error de Cloudinary');
    }
  } catch (error) {
    console.error('❌ Error subiendo PDF a Cloudinary:', error);
    
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo subir el PDF a Cloudinary: " + error.message,
        timer: 3000,
      });
    }
    
    return null;
  }
};

  // ---------------------- FUNCIÓN PARA GENERAR Y SUBIR PDF ---------------------- //
  const handleDownloadAndUpload = async () => {
    try {
      console.log('🔄 Generando PDF...');
      
      // Generar el PDF como Blob
      const pdfInstance = <Factura invoiceData={invoiceData} />;
      const blob = await pdf(pdfInstance).toBlob();
      
      console.log('📄 PDF generado, tamaño:', blob.size, 'bytes');
      
      // Crear URL temporal para descarga
      const url = URL.createObjectURL(blob);
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura_${customerName || "nuevo"}_${invoiceData.date}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar URL
      URL.revokeObjectURL(url);
      
      console.log('📥 PDF descargado localmente');
      
      // Subir a Cloudinary
      console.log('☁️ Subiendo a Cloudinary...');
      const cloudinaryUrl = await uploadPdfToCloudinary(blob);
      
      if (cloudinaryUrl) {
        console.log('🎉 Proceso completado exitosamente');
        console.log('🔗 URL de Cloudinary:', cloudinaryUrl);
      }
      
    } catch (error) {
      console.error('💥 Error en el proceso completo:', error);
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al generar o subir el PDF.",
          timer: 3000,
        });
      }
    }
  };

 









  // ---------------------- EXPORTAR A EXCEL ---------------------- //
  const handleDownloadExcel = () => {
    const wsData = [
      ["Factura ChairFix", "", "", ""],
      ["Fecha:", invoiceData.date, "", ""],
      ["Cliente:", customerName, "", ""],
      ["Teléfono:", phoneNumber, "", ""],
      ["", "", "", ""],
      ["Productos/Servicios", "Cantidad", "Precio Unitario", "Total"],
    ];

    allItems.forEach((i) =>
      wsData.push([
        i.name,
        i.quantity,
        `${i.price.toFixed(2)} €`,
        `${(i.price * i.quantity).toFixed(2)} €`,
      ])
    );

    wsData.push(["", "", "Subtotal:", `${subtotal.toFixed(2)} €`]);

    if (discountAmount > 0) {
      wsData.push([
        "",
        "",
        `Descuento ${discountType === "percent" ? `(${discountValue}%)` : ""}:`,
        `-${discountAmount.toFixed(2)} €`,
      ]);
    }

    if (ivaAmount > 0) {
      wsData.push(["", "", `IVA (${ivaRate}%):`, `${ivaAmount.toFixed(2)} €`]);
    }

    wsData.push(["", "", "TOTAL:", `${total.toFixed(2)} €`]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 35 }, { wch: 10 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, "Factura");
    XLSX.writeFile(
      wb,
      `factura_${customerName || "nuevo"}_${invoiceData.date}.xlsx`
    );
  };

  // ---------------------- ENVIAR AL BACKEND ---------------------- //
  const handleCreateInvoice = async () => {
    try {
      // Actualizar invoiceData con la URL del PDF si está disponible
      const invoiceDataWithPdf = {
        ...invoiceData,
        pdfUrl: pdfUrl || null
      };

      console.log("Datos enviados al backend:", JSON.stringify(invoiceDataWithPdf));

      const response = await fetch(`${BASEURL}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceDataWithPdf),
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (response.ok) {
        setFacturaId(data.factura_id || "");
        alert(`Factura creada: ${data.factura_id || ""}`);
      } else {
        alert(`Error al crear factura: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  // ---------------------- RENDER ---------------------- //
  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Generar Factura</h1>

      {/* Mostrar URL del PDF si está disponible */}
      {pdfUrl && (
        <div className="bg-green-50 p-3 rounded-md border border-green-200">
          <p className="text-green-800 text-sm">
            <strong>PDF guardado en:</strong> 
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="underline ml-2">
              Ver PDF en Cloudinary
            </a>
          </p>
        </div>
      )}

      {/* Botón para enviar al backend */}
      <button
        onClick={handleCreateInvoice}
        className="px-3 py-2 bg-purple-600 rounded text-white mb-2"
      >
        Crear Factura en el Backend
      </button>

      {/* Datos del cliente */}
      {!customerNameFromURL && (
        <div className="border p-4 rounded-md bg-gray-50">
          <h2 className="font-semibold mb-2">Datos del nuevo cliente</h2>
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border p-2 w-full mb-2 rounded"
          />
          <input
            type="text"
            placeholder="Teléfono del cliente"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>
      )}

      {/* Costo del viaje */}
      <div className="border p-4 rounded-md bg-gray-50">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeTravelCost}
            onChange={(e) => setIncludeTravelCost(e.target.checked)}
          />
          <span>Incluir costo de viaje</span>
        </label>

        {includeTravelCost && (
          <div className="mt-2">
            <input
              type="number"
              placeholder="Kilómetros recorridos"
              value={travelKm}
              onChange={(e) => setTravelKm(parseFloat(e.target.value) || 0)}
              className="border p-2 w-full sm:w-40 rounded"
            />
            <p className="mt-1">Costo calculado: €{travelCost.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* IVA */}
      <div className="border p-4 rounded-md bg-gray-50">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeIVA}
            onChange={(e) => setIncludeIVA(e.target.checked)}
          />
          <span>Incluir IVA</span>
        </label>

        {includeIVA && (
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">
              Porcentaje de IVA (%)
            </label>
            <input
              type="number"
              min="0"
              value={ivaRate}
              onChange={(e) => setIvaRate(parseFloat(e.target.value) || 0)}
              className="border p-2 w-full sm:w-32 rounded"
            />
          </div>
        )}
      </div>

      {/* DESCUENTO */}
      <div className="border p-4 rounded-md bg-gray-50">
        <h2 className="font-semibold mb-2">Descuento</h2>

        <div className="flex items-center gap-4 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="discountType"
              checked={discountType === "none"}
              onChange={() => setDiscountType("none")}
            />
            <span>Sin descuento</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="discountType"
              checked={discountType === "percent"}
              onChange={() => setDiscountType("percent")}
            />
            <span>Porcentaje (%)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="discountType"
              checked={discountType === "amount"}
              onChange={() => setDiscountType("amount")}
            />
            <span>Monto fijo (€)</span>
          </label>
        </div>

        {discountType !== "none" && (
          <div>
            <input
              type="number"
              placeholder={discountType === "percent" ? "Descuento (%)" : "Descuento (€)"}
              value={discountValue}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              className="border p-2 w-full sm:w-40 rounded"
            />
          </div>
        )}
      </div>

      {/* Importar Excel */}
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <h2 className="font-semibold mb-2 text-blue-800">Importar desde Excel</h2>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportExcel}
          accept=".xlsx, .xls, .csv"
          className="border p-2 rounded w-full text-sm"
        />
        {importError && <p className="text-red-600 mt-1">{importError}</p>}
      </div>

      {/* Agregar nuevo producto */}
      <div className="border p-4 rounded-md bg-gray-50">
        <h2 className="font-semibold mb-2">Agregar nuevo producto/servicio</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Nombre"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="border p-2 rounded flex-1 min-w-[150px]"
          />
          <input
            type="number"
            placeholder="Precio"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            className="border p-2 rounded w-24"
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={newItem.quantity}
            min="1"
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            className="border p-2 rounded w-20"
          />
          <button
            onClick={handleAddItem}
            className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="border p-4 rounded-md bg-gray-50">
        <h2 className="font-semibold mb-2">Productos/Servicios</h2>
        {allItems.length === 0 ? (
          <p>No hay productos agregados.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-1">Nombre</th>
                <th className="p-1">Cantidad</th>
                <th className="p-1">Precio</th>
                <th className="p-1">Total</th>
                <th className="p-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {allItems.map((i, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-1">{i.name}</td>
                  <td className="p-1 text-center">{i.quantity}</td>
                  <td className="p-1 text-center">{i.price.toFixed(2)} €</td>
                  <td className="p-1 text-center">
                    {(i.price * i.quantity).toFixed(2)} €
                  </td>
                  <td className="p-1 text-center">
                    {i.name !== "Costo del Viaje" && (
                      <>
                        <button
                          onClick={() => handleEditClick(idx)}
                          className="text-blue-600 mr-2"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-600"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal edición */}
      {editIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-96">
            <h2 className="font-semibold mb-2">Editar Producto</h2>
            <input
              type="text"
              value={editItem.name}
              onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
            />
            <input
              type="number"
              value={editItem.price}
              onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
            />
            <input
              type="number"
              value={editItem.quantity}
              min="1"
              onChange={(e) => setEditItem({ ...editItem, quantity: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditIndex(null)}
                className="px-3 py-2 rounded border"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-2 rounded bg-blue-600 text-white"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <div className="border p-4 rounded-md bg-gray-50">
        <h2 className="font-semibold mb-2">Vista previa PDF</h2>

        <PDFViewer style={{ width: "100%", height: "400px" }}>
          <Factura invoiceData={invoiceData} />
        </PDFViewer>
        
        <div className="flex gap-2 mt-2">
          {/* Botón que descarga y sube automáticamente */}
          <button
            onClick={handleDownloadAndUpload}
            className="px-3 py-2 bg-blue-600 rounded text-white"
          >
            Descargar y Subir PDF
          </button>

          <button
            onClick={handleDownloadExcel}
            className="px-3 py-2 bg-green-600 rounded text-white"
          >
            Descargar Excel
          </button>
        </div>
      </div>
    </div>
  );
}

export default FacturaPage;