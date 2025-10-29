"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";



const BASEURL = process.env.NEXT_PUBLIC_BASEURL;
function Login() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${BASEURL}/user/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // 👇 Aquí cambiamos 'usuario' a 'username'
                body: JSON.stringify({ email: usuario, password }),
            });

            if (!response.ok) {
                throw new Error("Credenciales inválidas");
            }

            const data = await response.json();

            // 💾 Guardar el usuario en localStorage
            localStorage.setItem("usuario", usuario);

            // 🚀 Redirigir a /allwork
            router.push("/allwork");
        } catch (err) {
            console.error("Error al iniciar sesión:", err);
            setError("Usuario o contraseña incorrectos.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
                {error && (
                    <div className="mb-4 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Usuario
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                    >
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
