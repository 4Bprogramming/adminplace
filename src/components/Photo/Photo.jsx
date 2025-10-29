"use client";

import React, { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Swal from "sweetalert2";

export default function PhotoForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);

  const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.image) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El nombre y la imagen son obligatorios",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASEURL}/photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Error desconocido",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "La foto se ha guardado correctamente en el backend",
      });

      setFormData({ name: "", description: "", image: "" });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error de red",
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">Subir Foto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej. Paisaje de montaña"
            required
            disabled={loading}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Agrega una breve descripción"
            disabled={loading}
          />
        </div>

        {/* Upload Cloudinary */}
        <div>
          <label className="block text-sm font-medium mb-1">Imagen</label>
          <CldUploadWidget
            uploadPreset="next_cloudinary_app"
            options={{
              sources: ["local", "url", "camera"],
              multiple: false,
              maxFiles: 1,
            }}
            onQueuesEnd={(result) => {
              console.log("📸 Resultado completo:", result);

              const uploaded = result?.info?.files?.[0]?.uploadInfo;
              if (uploaded?.secure_url) {
                const imageUrl = uploaded.secure_url;
                console.log("✅ Imagen subida a Cloudinary:", imageUrl);
                setFormData((prev) => ({ ...prev, image: imageUrl }));

                Swal.fire({
                  icon: "success",
                  title: "Imagen subida",
                  text: "La imagen se ha subido correctamente.",
                  timer: 1500,
                  showConfirmButton: false,
                });
              }
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                disabled={loading}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                {formData.image ? "Cambiar Imagen" : "Subir Imagen"}
              </button>
            )}
          </CldUploadWidget>

          {formData.image && (
            <img
              src={formData.image}
              alt="Preview"
              className="mt-3 rounded-md border"
            />
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
