import { useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import Factura from "./Factura";
import * as XLSX from "xlsx";

const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

function FacturaPage() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");
  const customerName = searchParams.get("name");
  const travelCost = parseFloat(searchParams.get("salary"));
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const address = searchParams.get("address");
  const fileInputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", quantity: 1 });
  const [editIndex, setEditIndex] = useState(null);
  const [editItem, setEditItem] = useState({ name: "", price: "", quantity: 1 });
  const [importError, setImportError] = useState("");

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
    setEditItem({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    });
  };

  const handleSaveEdit = () => {
    const updatedItems = [...items];
    updatedItems[editIndex] = {
      name: editItem.name,
      price: parseFloat(editItem.price),
      quantity: parseInt(editItem.quantity),
    };
    setItems(updatedItems);
    setEditIndex(null);
    setEditItem({ name: "", price: "", quantity: 1 });
  };

  // Función para manejar la importación desde Excel
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImportError("");
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Obtener la primera hoja
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Validar y procesar los datos
        const importedItems = jsonData.map(row => {
          // Buscar las columnas con nombres comunes
          const name = row['Producto'] || row['Product'] || row['Nombre'] || row['Name'] || row['Descripción'] || row['Description'] || '';
          const price = row['Precio'] || row['Price'] || row['Costo'] || row['Cost'] || row['Precio Unitario'] || 0;
          const quantity = row['Cantidad'] || row['Quantity'] || row['Cant'] || row['Qty'] || 1;
          
          return {
            name: String(name),
            price: parseFloat(price) || 0,
            quantity: parseInt(quantity) || 1
          };
        }).filter(item => item.name && item.price > 0);
        
        if (importedItems.length === 0) {
          setImportError("No se pudieron importar items válidos desde el archivo. Por favor, verifique el formato.");
          return;
        }
        
        // Agregar los items importados a la lista existente
        setItems([...items, ...importedItems]);
        
        // Limpiar el input de archivo
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
      } catch (error) {
        console.error("Error al procesar el archivo Excel:", error);
        setImportError("Error al procesar el archivo. Asegúrese de que es un archivo Excel válido.");
      }
    };
    
    reader.onerror = () => {
      setImportError("Error al leer el archivo. Inténtelo de nuevo.");
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Función para descargar plantilla de Excel
  const downloadTemplate = () => {
    const templateData = [
      ['Producto', 'Precio', 'Cantidad'],
      ['Servicio de instalación', 150, 2],
      ['Material eléctrico', 75.5, 1],
      ['Mano de obra', 200, 3]
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    
    // Estilo para encabezados
    for (let C = 0; C < 3; C++) {
      const cellRef = XLSX.utils.encode_cell({r: 0, c: C});
      if (!ws[cellRef]) ws[cellRef] = {};
      if (!ws[cellRef].s) ws[cellRef].s = {};
      ws[cellRef].s = { font: { bold: true } };
    }
    
    // Ajustar ancho de columnas
    ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }];
    
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_factura.xlsx");
  };

  const total =
    travelCost +
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const invoiceData = {
    employee_id: employeeId,
    customerName,
    email,
    phone,
    address,
    date: new Date().toISOString().split("T")[0],
    items: [
      { name: "Costo del Viaje", price: travelCost, quantity: 1 },
      ...items,
    ],
    total,
  };

  const handleEnviarFactura = async () => {
    try {
      const res = await fetch(`${BASEURL}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await res.json();
      alert("Factura enviada al backend correctamente.");
    } catch (error) {
      console.error("Error enviando la factura:", error);
      alert("Error al enviar la factura.");
    }
  };

  // Función para descargar en Excel
  const handleDownloadExcel = () => {
    const worksheetData = [
      ["Factura", "", "", ""],
      ["", "", "", ""],
      ["Empresa: Char Fix", "", "", ""],
      ["Dirección: Sagunto 46500", "", "", ""],
      ["Email: info@charfix.com", "", "", ""],
      ["Tel: (123) 456-7890", "", "", ""],
      ["", "", "", ""],
      ["Factura #: INV-2025-001", "", "", ""],
      [`Fecha: ${invoiceData.date}`, "", "", ""],
      ["", "", "", ""],
      ["Facturado a:", "", "", ""],
      [`Nombre: ${customerName}`, "", "", ""],
      [`Email: ${email}`, "", "", ""],
      [`Teléfono: ${phone}`, "", "", ""],
      [`Dirección: ${address}`, "", "", ""],
      ["", "", "", ""],
      ["Productos/Servicios", "Cantidad", "Precio Unitario", "Total"],
    ];

    invoiceData.items.forEach((item) => {
      worksheetData.push([
        item.name,
        item.quantity,
        `$${item.price.toFixed(2)}`,
        `$${(item.price * item.quantity).toFixed(2)}`,
      ]);
    });

    worksheetData.push(["", "", "TOTAL:", `$${total.toFixed(2)}`]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:D1");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        
        if (R === 0 || R === 16) {
          if (!ws[cell_ref]) ws[cell_ref] = {};
          if (!ws[cell_ref].s) ws[cell_ref].s = {};
          ws[cell_ref].s = { font: { bold: true } };
        }
        
        if (R === worksheetData.length - 1 && C >= 2) {
          if (!ws[cell_ref]) ws[cell_ref] = {};
          if (!ws[cell_ref].s) ws[cell_ref].s = {};
          ws[cell_ref].s = { font: { bold: true } };
        }
      }
    }

    ws["!cols"] = [{ wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, "Factura");
    XLSX.writeFile(wb, `factura_${customerName}_${invoiceData.date}.xlsx`);
  };

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">
        Generar Factura para {customerName}
      </h1>

      {/* Sección de Importación desde Excel */}
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <h2 className="font-semibold mb-2 text-blue-800">Importar desde Excel</h2>
        <p className="text-sm text-blue-600 mb-3">
          Importe múltiples productos desde un archivo Excel. 
          <button 
            onClick={downloadTemplate}
            className="ml-2 text-blue-800 underline hover:text-blue-600"
          >
            Descargar plantilla
          </button>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 items-start">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx, .xls, .csv"
            className="border p-2 rounded w-full text-sm"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm whitespace-nowrap"
          >
            Seleccionar Archivo
          </button>
        </div>
        
        {importError && (
          <div className="mt-2 text-red-500 text-sm">{importError}</div>
        )}
        
        <div className="mt-2 text-xs text-gray-500">
          <p>Formato esperado: columnas con "Producto", "Precio" y "Cantidad".</p>
          <p>También se aceptan nombres similares en español o inglés.</p>
        </div>
      </div>

      {/* Agregar Producto manualmente */}
      <div>
        <h2 className="font-semibold mb-2">Agregar Producto Manualmente</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="border p-2 w-full"
          />
          <input
            type="number"
            placeholder="Precio"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            className="border p-2 w-full sm:w-32"
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={newItem.quantity}
            onChange={(e) =>
              setNewItem({ ...newItem, quantity: e.target.value })
            }
            className="border p-2 w-full sm:w-20"
          />
          <button
            onClick={handleAddItem}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            Añadir
          </button>
        </div>
      </div>

      {/* Lista de Productos */}
      {items.length > 0 && (
        <div>
          <h2 className="font-semibold mt-4">Productos ({items.length})</h2>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center border p-2 rounded gap-2"
              >
                {editIndex === index ? (
                  // Modo edición
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <input
                      type="text"
                      value={editItem.name}
                      onChange={(e) =>
                        setEditItem({ ...editItem, name: e.target.value })
                      }
                      className="border p-1 w-full"
                    />
                    <input
                      type="number"
                      value={editItem.price}
                      onChange={(e) =>
                        setEditItem({ ...editItem, price: e.target.value })
                      }
                      className="border p-1 w-full sm:w-24"
                    />
                    <input
                      type="number"
                      value={editItem.quantity}
                      onChange={(e) =>
                        setEditItem({ ...editItem, quantity: e.target.value })
                      }
                      className="border p-1 w-full sm:w-20"
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Guardar
                    </button>
                  </div>
                ) : (
                  // Modo normal
                  <>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p>
                        Cantidad: {item.quantity} | Precio: ${item.price.toFixed(2)} | Total: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(index)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          
          {/* <div className="mt-4 p-3 bg-gray-50 rounded-md border">
            <p className="font-semibold">Resumen:</p>
            <p>Productos/Servicios: {items.length}</p>
            <p>Subtotal productos: ${(total - travelCost).toFixed(2)}</p>
            <p>Costo del viaje: ${travelCost.toFixed(2)}</p>
            <p className="text-lg font-bold mt-2">TOTAL: ${total.toFixed(2)}</p>
          </div> */}
        </div>
      )}

      {/* Vista Previa PDF */}
      <div>
        <h2 className="font-semibold mt-4">Vista Previa de Factura</h2>
        <PDFViewer width="100%" height="400px">
          <Factura invoiceData={invoiceData} />
        </PDFViewer>

        <div className="mt-4 flex flex-wrap gap-2">
          <PDFDownloadLink
            document={<Factura invoiceData={invoiceData} />}
            fileName="factura.pdf"
          >
            {({ loading }) => (
              <button className="bg-green-500 text-white px-4 py-2 rounded">
                {loading ? "Generando..." : "Descargar PDF"}
              </button>
            )}
          </PDFDownloadLink>
          
          <button
            onClick={handleDownloadExcel}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Descargar Excel
          </button>
        </div>
      </div>

      {/* Enviar al backend */}
      <button
        onClick={handleEnviarFactura}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Enviar al Backend
      </button>
    </div>
  );
}

export default FacturaPage;