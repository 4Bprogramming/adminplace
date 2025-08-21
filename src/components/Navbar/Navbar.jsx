"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useDarkMode from '../../utils/useDarkMode';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDark, toggleDarkMode] = useDarkMode();
  const router = useRouter();

  const user = {
    name: 'Fabricio',
    avatar: 'https://i.ibb.co/2qr381T/user-1.png'
  };

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    setIsLoggedIn(!!usuario);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    router.push("/login");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-50 bg-white dark:bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <h1 className="uppercase font-bold text-xl dark:text-white">
              <span className="text-blue-500">Char</span>Fix
            </h1>

        <div className="flex items-center gap-6">
          {/* Toggle dark mode */}
          <label htmlFor="dark-toggle" className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="dark-toggle"
              className="sr-only peer"
              checked={isDark}
              onChange={toggleDarkMode}
            />
            <div className="w-11 h-6 bg-gray-300 peer-checked:bg-indigo-600 rounded-full transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform peer-checked:translate-x-5 transition-transform duration-300"></div>
          </label>

          {isLoggedIn ? (
            <div className="relative group">
              <button className="flex items-center space-x-3 focus:outline-none">
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="hidden sm:block font-medium dark:text-white">
                  {user.name}
                </span>
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 text-sm rounded-md shadow-lg 
                invisible opacity-0 group-hover:visible group-hover:opacity-100 
                hover:visible hover:opacity-100 transition-all duration-200 z-50">
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                >
                  Settings
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Inicia sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;