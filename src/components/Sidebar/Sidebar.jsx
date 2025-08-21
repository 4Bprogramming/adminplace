"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoPerson, GoHome } from "react-icons/go";
import { IoPersonAddOutline } from "react-icons/io5";
import { PiSignInBold } from "react-icons/pi";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { LiaMoneyBillSolid } from "react-icons/lia";
import humberger from "../../assets/humberger.png";

function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsCollapsed(prev => !prev);

  const isActive = (path) => pathname === path;

  return (
    <div className="sticky top-16 h-[calc(100vh-4rem)] z-40 shadow-md">
      <ul className={`
          menu transition-all duration-300 h-full
          ${isCollapsed ? "w-[72px]" : "w-[min(240px,20vw)]"}
          bg-white dark:bg-black
        `}>
        {/* Top */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          {/* {!isCollapsed && (
            <h1 className="uppercase font-bold text-xl dark:text-white">
              <span className="text-blue-500">Char</span>Fix
            </h1>
          )} */}
          <img
            onClick={toggleSidebar}
            src={humberger.src}
            alt="toggle"
            className="w-6 cursor-pointer"
          />
        </div>

        {/* Menu Items */}
        <SidebarItem icon={<GoHome size={22} />} label="Home" href="/" active={isActive("/")} collapsed={isCollapsed} />
        <SidebarItem icon={<GoPerson size={22} />} label="Clientes" href="/allwork" active={isActive("/allwork")} collapsed={isCollapsed} />
        <SidebarItem icon={<IoPersonAddOutline size={22} />} label="Crear Cliente" href="/creatework" active={isActive("/creatework")} collapsed={isCollapsed} />
        <SidebarItem icon={<LiaFileInvoiceDollarSolid size={22} />} label="Factura" href="/factura" active={isActive("/factura")} collapsed={isCollapsed} />
        <SidebarItem icon={<LiaMoneyBillSolid size={22} />} label="Cuotas" href="/cuotas" active={isActive("/cuotas")} collapsed={isCollapsed} />
        <SidebarItem icon={<PiSignInBold size={22} />} label="Iniciar Sesión" href="/login" active={isActive("/login")} collapsed={isCollapsed} />
               
      </ul>
    </div>
  );
}

function SidebarItem({ icon, label, href, active, collapsed }) {
  return (
    <li className={`
      ${collapsed ? "justify-center" : "px-4"}
      py-3 flex items-center gap-3 font-mono text-[15px] cursor-pointer transition
      ${active ? "text-blue-500 font-semibold" : "dark:text-white text-gray-700"}
    `}>
      <Link className="flex items-center gap-3" href={href}>
        {icon}
        {!collapsed && <span>{label}</span>}
      </Link>
    </li>
  );
}

export default Sidebar;