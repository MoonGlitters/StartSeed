import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { useClickOutside } from "./hooks/useClickOutside";
import {
  Bell, Check, X, Home, Building2, ShoppingBag, Users, Mail,
  Package, Boxes, BarChart3, ShoppingCart, Package2, User, LogOut, LogIn, UserPlus, LayoutDashboard
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { assets } from "../assets/assets";

const ICONS = { Home, Building2, ShoppingBag, Users, Mail };

const CartIcon = React.memo(({ count }) => (
  <div className="relative flex items-center justify-center">
    <Link
      to="/carrito"
      className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition border border-emerald-100"
    >
      <ShoppingCart className="w-6 h-6 text-emerald-600" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5 border border-white">
          {count}
        </span>
      )}
    </Link>
  </div>
));

export const NavBar = () => {
  const navigate = useNavigate();
  const { userData, loading, setIsLoggedin, setUserData, backendUrl, cartCount } = useContext(AppContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuEmpresaOpen, setMenuEmpresaOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasCompany, setHasCompany] = useState(null);
  const [solicitud, setSolicitud] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [notificacionesOpen, setNotificacionesOpen] = useState(false);
  const [estadoEmpresa, setEstadoEmpresa] = useState(null);

  const empresaMenuRef = useRef(null);
  const menuRef = useRef(null);
  const notiMenuRef = useRef(null);
  useClickOutside(notiMenuRef, () => setNotificacionesOpen(false));
  useClickOutside(empresaMenuRef, () => setMenuEmpresaOpen(false));
  useClickOutside(menuRef, () => setMenuOpen(false));

  // Bloquear scroll cuando se abre el menú móvil
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
  }, [mobileMenuOpen]);

  // Cerrar menú móvil al cambiar el tamaño
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cerrar menús cuando cambia usuario
  useEffect(() => {
    setMenuOpen(false);
    setMenuEmpresaOpen(false);
    setNotificacionesOpen(false);
  }, [userData]);

  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
      setIsLoggedin(false);
      setUserData(null);
      localStorage.removeItem("tieneEmpresa");
      toast.success("Has cerrado sesión");
      navigate("/");
    } catch {
      toast.error("Error al cerrar sesión");
    }
  };

  const fetchUserCompany = useCallback(async () => {
    try {
      const cached = localStorage.getItem("tieneEmpresa");
      if (cached === "true") setHasCompany(true);

      const { data } = await axios.get(`${backendUrl}/api/empresa/usuario`, { withCredentials: true });
      if (data.empresa) {
        setHasCompany(true);
        setEstadoEmpresa(data.empresa.estado);
        localStorage.setItem("tieneEmpresa", "true");

        if (data.empresa.estado === "inactiva") {
          const last = localStorage.getItem("empresaDesactivadaAviso");
          if (last !== "true") {
            toast.warning("Tu empresa ha sido desactivada por un administrador.");
            setNotificaciones((prev) => [
              ...prev,
              {
                id: Date.now(),
                tipo: "error",
                mensaje:
                  "Tu empresa ha sido desactivada por un administrador. No puedes acceder al panel de empresa.",
              },
            ]);
            localStorage.setItem("empresaDesactivadaAviso", "true");
          }
        } else {
          localStorage.removeItem("empresaDesactivadaAviso");
        }
        return true;
      } else {
        setHasCompany(false);
        setEstadoEmpresa(null);
        localStorage.setItem("tieneEmpresa", "false");
        return false;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setHasCompany(false);
        setEstadoEmpresa(null);
        localStorage.setItem("tieneEmpresa", "false");
      }
      return false;
    }
  }, [backendUrl]);

  const checkSolicitud = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/solicitudes/ultima-solicitud`, { withCredentials: true });
      const nuevaSolicitud = data?.solicitud;
      if (!nuevaSolicitud) {
        localStorage.removeItem("ultimoEstadoSolicitud");
        return;
      }
      const nuevoEstado = nuevaSolicitud.estado?.toLowerCase();
      const ultimoEstadoMostrado = localStorage.getItem("ultimoEstadoSolicitud");
      const tieneEmpresa = localStorage.getItem("tieneEmpresa") === "true";
      if (tieneEmpresa || !nuevoEstado || nuevoEstado === ultimoEstadoMostrado) return;

      if (["aceptado", "rechazado"].includes(nuevoEstado)) {
        const tipo = nuevoEstado === "aceptado" ? "success" : "error";
        const mensaje =
          nuevoEstado === "aceptado"
            ? "¡Tu solicitud fue aprobada! Ya puedes completar tu empresa."
            : "Tu solicitud fue rechazada. Revisa la razón en tu perfil.";
        toast[tipo](mensaje);
        setNotificaciones((prev) => [...prev, { id: Date.now(), tipo, mensaje }]);
        localStorage.setItem("ultimoEstadoSolicitud", nuevoEstado);
      }
      setSolicitud(nuevaSolicitud);
    } catch (err) {
      console.error("Error al verificar solicitud:", err);
    }
  }, [backendUrl]);

  useEffect(() => {
    if (!userData) return;
    (async () => {
      const tiene = await fetchUserCompany();
      await checkSolicitud(tiene);
    })();
    const interval = setInterval(checkSolicitud, 45000);
    return () => clearInterval(interval);
  }, [userData, fetchUserCompany, checkSolicitud]);

  if (loading) return null;

  const empresaButton =
    hasCompany === false
      ? solicitud?.estado?.toLowerCase() === "aceptado"
        ? { text: "Completar Empresa", to: "/completar-empresa" }
        : { text: "Crear Empresa", to: "/crear-solicitud" }
      : null;

  return (
    <>
      {/* BARRA SUPERIOR */}
      <div className="flex items-center justify-between py-4 px-6 bg-gray-50/95 backdrop-blur-sm sticky top-0 z-[20] shadow-md">
        {/* Logo */}
        <div
          className="text-xl font-bold text-emerald-700 cursor-pointer hover:text-emerald-800 transition"
          onClick={() => navigate("/")}
        >
          Start<span className="text-gray-800">Seed</span>
        </div>

        {/* LINKS DESKTOP */}
        <ul className="hidden md:flex gap-6 text-sm text-gray-700 cursor-pointer">
          {[
            { to: "/", label: "INICIO" },
            { to: "/empresas", label: "EMPRESAS" },
            { to: "/productos", label: "PRODUCTOS" },
            { to: "/sobre-nosotros", label: "SOBRE NOSOTROS" },
            { to: "/contact", label: "CONTACTO" },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-1 transition-colors ${isActive ? "font-semibold text-emerald-700" : "hover:text-emerald-700"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </ul>

        {/* DERECHA */}
        <div className="hidden md:flex items-center gap-4 relative">
          {userData ? (
            <>
              {userData?.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-1 rounded border border-emerald-600 bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm hover:shadow-md transition"
                >
                  <img src={assets.adminpanel} alt="Admin" className="w-6 h-6" />
                  Panel
                </Link>
              )}

              {/* EMPRESA */}
              {hasCompany ? (
                estadoEmpresa === "inactiva" ? (
                  <Link
                    to="/empresa-desactivada"
                    className="px-4 py-1 rounded bg-amber-500 text-white hover:bg-amber-600 shadow-sm transition"
                  >
                    Empresa Desactivada
                  </Link>
                ) : (
                  <div ref={empresaMenuRef} className="relative">
                    <button
                      onClick={() => setMenuEmpresaOpen(!menuEmpresaOpen)}
                      className="px-4 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 shadow-sm transition cursor-pointer"
                    >
                      Empresa
                    </button>
                    {menuEmpresaOpen && (
                      <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-md border border-gray-100 z-20">
                        {[
                          { to: "/mi-empresa", label: "Perfil Empresa" },
                          { to: "/mis-productos", label: "Mis Productos" },
                          { to: "/inventario", label: "Inventario" },
                          { to: "/dashboard", label: "Dashboard" },
                        ].map(({ to, label }) => (
                          <Link
                            key={to}
                            to={to}
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                            onClick={() => setMenuEmpresaOpen(false)}
                          >
                            {label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ) : (
                empresaButton && (
                  <Link
                    to={empresaButton.to}
                    className="px-4 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 shadow-sm transition"
                  >
                    {empresaButton.text}
                  </Link>
                )
              )}

              {/* NOTIFICACIONES */}
              <div className="relative" ref={notiMenuRef}>
                <button
                  onClick={() => setNotificacionesOpen(!notificacionesOpen)}
                  className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition border border-emerald-100"
                >
                  <Bell className="w-6 h-6 text-emerald-600 cursor-pointer" />
                  {notificaciones.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5 border border-white">
                      {notificaciones.length}
                    </span>
                  )}
                </button>

                {notificacionesOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 z-30 overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-50">
                      <h3 className="font-semibold text-sm text-gray-700">Notificaciones</h3>
                      <button
                        onClick={() => setNotificaciones([])}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Limpiar
                      </button>
                    </div>
                    {notificaciones.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-3">
                        No tienes notificaciones nuevas
                      </p>
                    ) : (
                      <ul className="max-h-64 overflow-y-auto divide-y">
                        {notificaciones.map((n) => (
                          <li
                            key={n.id}
                            className="flex items-start gap-2 px-4 py-3 hover:bg-gray-50"
                          >
                            {n.tipo === "success" ? (
                              <Check className="w-4 h-4 text-green-600 mt-1" />
                            ) : (
                              <X className="w-4 h-4 text-red-600 mt-1" />
                            )}
                            <p className="text-sm text-gray-700">{n.mensaje}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <CartIcon count={cartCount} />

              {/* PERFIL */}
              <div className="flex items-center gap-2" ref={menuRef}>
                <Link to="/editar-perfil" className="hover:opacity-90 transition">
                  <Avatar className="w-10 h-10 ring-1 ring-gray-200 shadow-sm">
                    {userData.url_img_perfil ? (
                      <AvatarImage src={userData.url_img_perfil} />
                    ) : (
                      <AvatarFallback>
                        {userData.username?.slice(0, 2).toUpperCase() || "CN"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Link>

                <span className="font-medium text-gray-700">{userData.username}</span>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded shadow-sm transition ml-2 cursor-pointer"
                  >
                    Mi Perfil
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border border-gray-100 z-20">
                      <Link
                        to="/mi-perfil"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Perfil
                      </Link>
                      <Link
                        to="/editar-perfil"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Editar Perfil
                      </Link>
                      <Link
                        to="/historial"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Mis Compras
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-1 rounded bg-black text-white hover:bg-gray-800 shadow-sm transition"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/registro"
                className="px-4 py-1 rounded border border-gray-400 hover:bg-gray-200 shadow-sm transition"
              >
                Registro
              </Link>
            </>
          )}
        </div>

        {/* BOTÓN HAMBURGUESA */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
          aria-label="Abrir menú"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* MENÚ MÓVIL */}
      <div
        className={`fixed inset-0 flex justify-end transition-all duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto bg-black/50 backdrop-blur-sm"
            : "opacity-0 pointer-events-none"
        } z-[100]`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-72 h-full bg-white shadow-2xl flex flex-col p-6 overflow-y-auto transform transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Cerrar */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Logo */}
          <div
            onClick={() => {
              navigate("/");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 mt-1 cursor-pointer"
          >
            <img src={assets.logoempresas} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-2xl font-bold text-emerald-700">
              Start<span className="text-gray-800">Seed</span>
            </span>
          </div>

          {/* Navegación */}
          <nav className="flex flex-col gap-3 mt-8">
            {[
              { to: "/", label: "Inicio", icon: "Home" },
              { to: "/empresas", label: "Empresas", icon: "Building2" },
              { to: "/productos", label: "Productos", icon: "ShoppingBag" },
              { to: "/sobre-nosotros", label: "Sobre Nosotros", icon: "Users" },
              { to: "/contact", label: "Contacto", icon: "Mail" },
            ].map(({ to, label, icon }) => {
              const Icon = ICONS[icon];
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </NavLink>
              );
            })}
          </nav>

          {/* Admin y empresa */}
          {userData?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-6 flex items-center justify-center gap-2 bg-white border border-emerald-600 text-emerald-700 rounded-md py-2 hover:bg-emerald-50 transition"
            >
              <LayoutDashboard className="w-5 h-5" />
              Panel Administrativo
            </Link>
          )}

          {userData && (
            <div className="mt-6">
              {hasCompany ? (
                estadoEmpresa === "inactiva" ? (
                  <Link
                    to="/empresa-desactivada"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 bg-amber-500 text-white rounded-lg text-center hover:bg-amber-600 transition"
                  >
                    Empresa Desactivada
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/mi-empresa"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-md py-2 hover:bg-emerald-700 transition"
                    >
                      <Building2 className="w-4 h-4" /> Perfil Empresa
                    </Link>
                    <Link
                      to="/mis-productos"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-md py-2 hover:bg-gray-200 transition"
                    >
                      <Package className="w-4 h-4" /> Mis Productos
                    </Link>
                    <Link
                      to="/inventario"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-md py-2 hover:bg-gray-200 transition"
                    >
                      <Boxes className="w-4 h-4" /> Inventario
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-md py-2 hover:bg-gray-200 transition"
                    >
                      <BarChart3 className="w-4 h-4" /> Dashboard
                    </Link>
                  </div>
                )
              ) : (
                empresaButton && (
                  <Link
                    to={empresaButton.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 bg-emerald-600 text-white rounded-lg text-center hover:bg-emerald-700 transition"
                  >
                    {empresaButton.text}
                  </Link>
                )
              )}
            </div>
          )}

          {/* Acciones usuario */}
          <div className="border-t border-gray-200 pt-4 mt-6 flex flex-col gap-3">
            {userData ? (
              <>
                <Link
                  to="/carrito"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-gray-700 hover:text-emerald-700 transition"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> Mi Carrito
                  </div>
                  <span className="text-sm font-medium">({cartCount})</span>
                </Link>

                <Link
                  to="/historial"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 transition"
                >
                  <Package2 className="w-5 h-5" /> Mis Compras
                </Link>

                <Link
                  to="/mi-perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-lg py-2 hover:bg-emerald-700 transition"
                >
                  <User className="w-4 h-4" /> Mi Perfil
                </Link>

                <Link
                  to="/editar-perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-lg py-2 hover:bg-emerald-700 transition"
                >
                  <User className="w-4 h-4" /> Editar Perfil
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-lg py-2 hover:bg-gray-200 transition"
                >
                  <LogOut className="w-4 h-4" /> Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-lg py-2 hover:bg-emerald-700 transition"
                >
                  <LogIn className="w-4 h-4" /> Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
                >
                  <UserPlus className="w-4 h-4" /> Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
