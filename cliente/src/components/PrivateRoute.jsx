import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

export const PrivateRoute = () => {
  const { isLoggedin, loading } = useContext(AppContext);
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

 useEffect(() => {
    if (!loading) {
      setChecking(false);

      // rutas publicas
      const rutasPublicas = [
        "/",
        "/empresas",
        "/login",
        "/registro",
        "/nueva-contraseña",
        "/registro-exitoso",
        "/prueba",
        "/reset-password",
        "/productos"
      ];

      // si no esta logueado, no esta en una ruta pública y no estamos yendo al login
      const esRutaPublica = rutasPublicas.includes(location.pathname);

      if (!isLoggedin && !esRutaPublica) {
        // retraso para evitar toasts durante logout rapido
        const timer = setTimeout(() => {
          // si despues del delay seguimos en una ruta privada, mostramos el toast
          if (window.location.pathname !== "/login") {
            toast.warn("Debes iniciar sesión para ver este contenido");
            setShouldRedirect(true);
          }
        }, 700);

        return () => clearTimeout(timer);
      }
    }
  }, [loading, isLoggedin, location.pathname]);


  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Cargando sesión...
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isLoggedin) return null; 

  return <Outlet />;
};