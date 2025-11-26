import { useEffect, useContext, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { AppContext } from "./context/AppContext.jsx";
import { AppContainer } from "./components/AppContainer.jsx";

import { PrivateRoute } from "./components/PrivateRoute.jsx";

// Pages
import { Home } from "./pages/home/Home.jsx";
import { Login } from "./pages/auth/Login.jsx";
import { Registro } from "./pages/auth/Registro.jsx";
import { NuevaContraseña } from "./pages/auth/NuevaContraseña.jsx";
import { RegistroExitoso } from "./pages/auth/RegistroExitoso.jsx";
import { Empresas } from "./pages/empresa/Empresas.jsx";
import { ResetPassword } from "./pages/auth/ResetPassword.jsx";
import { EditarPerfil } from "./pages/usuario/EditarPerfil.jsx";
import { MiEmpresa } from "./pages/empresa/MiEmpresa.jsx";
import { CrearSolicitud } from "./pages/empresa/CrearSolicitud.jsx";
import { CompletarEmpresa } from "./pages/empresa/CompletarEmpresa.jsx";
import { EditarEmpresa } from "./pages/empresa/EditarEmpresa.jsx";
import { Inventario } from "./pages/productos/Inventario.jsx";
import { MisProductos } from "./pages/productos/MisProductos.jsx";
import { Productos } from "./pages/productos/Productos.jsx";
import { ProductoDetalle } from "./pages/productos/ProductoDetalle.jsx";
import { Carrito } from "./pages/usuario/Carrito.jsx";
import { HistorialCompras } from "./pages/usuario/HistorialCompras.jsx";
import { EmpresaDetalle } from "./pages/empresa/EmpresaDetalle.jsx";
import { Checkout } from "./pages/mercadopago/Checkout.jsx";
import { Pending } from "./pages/mercadopago/Pending.jsx";
import { Failure } from "./pages/mercadopago/Failure.jsx";
import { Success } from "./pages/mercadopago/Success.jsx";
import { DashboardEmpresa } from "./pages/empresa/Dashboard.jsx";
import { MiPerfil } from "./pages/usuario/MiPerfil.jsx";
import AdminPanel from "./pages/admin/AdminPanel";
import EmpresaDesactivada from "./pages/empresa/EmpresaDesactivada.jsx";
import { About } from "./pages/info/About.jsx";
import { Contact } from "./pages/info/Contact.jsx";
import { EmpresaProductos } from "./pages/empresa/EmpresaProductos.jsx";
axios.defaults.withCredentials = true;

export const App = () => {
  const { loading, backendUrl, configGlobal, setConfigGlobal } = useContext(AppContext);
  const [configCargada, setConfigCargada] = useState(false);
  const location = useLocation();

  // Algunas paginas no deben mostrar navbar/footer
  const sinNavYFooter = ["/registro-exitoso"].includes(location.pathname);
  const ignorarMantenimiento = false;

  // Cargar configuración global del backend
  useEffect(() => {
    const fetchConfigGlobal = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/conf`, {
          withCredentials: true,
        });
        if (data.success) setConfigGlobal(data.config);
      } catch (error) {
        console.error("Error obteniendo config global:", error);
        toast.error("No se pudo cargar la configuración global");
      } finally {
        setConfigCargada(true);
      }
    };
    fetchConfigGlobal();
  }, [backendUrl, setConfigGlobal]);

  return (
   <div className="min-h-screen bg-gradient-natural flex flex-col pointer-events-none">
    <div className="pointer-events-auto flex-1 flex flex-col">
      <AppContainer
        loading={loading}
        configCargada={configCargada}
        configGlobal={configGlobal}
        ignorarMantenimiento={ignorarMantenimiento}
        sinNavYFooter={sinNavYFooter}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/nueva-contraseña" element={<NuevaContraseña />} />
          <Route path="/registro-exitoso" element={<RegistroExitoso />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/sobre-nosotros" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Rutas privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/completar-empresa" element={<CompletarEmpresa />} />
            <Route path="/mi-empresa" element={<MiEmpresa />} />
            <Route path="/editar-perfil" element={<EditarPerfil />} />
            <Route path="/crear-solicitud" element={<CrearSolicitud />} />
            <Route path="/editar-empresa/:id" element={<EditarEmpresa />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/mis-productos" element={<MisProductos />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            <Route path="/historial" element={<HistorialCompras />} />
            <Route path="/empresa/:id" element={<EmpresaDetalle />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success" element={<Success />} />
            <Route path="/failure" element={<Failure />} />
            <Route path="/pending" element={<Pending />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/dashboard" element={<DashboardEmpresa />} />
            <Route path="/empresa-desactivada" element={<EmpresaDesactivada />} />
            <Route path="/mi-perfil" element={<MiPerfil />} />
            <Route path="/empresa/:id/productos" element={<EmpresaProductos />} />

          </Route>
        </Routes>
      </AppContainer>
    </div>
  </div>
  );
};

export default App;
