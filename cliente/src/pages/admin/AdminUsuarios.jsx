import { AppContext } from "@/context/AppContext";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RefreshCcw,
  Loader2,
  Mail,
  ImageOff,
  ShieldCheck,
  User,
  Building2,
  Ban,
  RotateCcw,
  Clock,
} from "lucide-react";

export const AdminUsuarios = () => {
  const { backendUrl, userData, loading } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [actualizando, setActualizando] = useState(false);
  const [accionEnProgreso, setAccionEnProgreso] = useState(null);
  const [modalSuspend, setModalSuspend] = useState({ open: false, userId: null });
  const [duracion, setDuracion] = useState("");

  //  Obtener usuarios
  const fetchUsuarios = async () => {
    try {
      setActualizando(true);
      const { data } = await axios.get(`${backendUrl}/api/user/`, {
        withCredentials: true,
      });
      if (data.success) setUsers(data.data);
      else toast.error("Error al obtener usuarios");
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setActualizando(false);
      setLoadingUsers(false);
    }
  };

  //  Suspender usuario (usa el modal)
  const suspenderUsuario = async () => {
    const { userId } = modalSuspend;
    const dias = parseInt(duracion);

    if (!dias || dias <= 0) {
      toast.warn("Debes ingresar un número válido de días");
      return;
    }

    setAccionEnProgreso(userId);
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/admin/users/${userId}/suspender-temporal`,
        { duracion: dias },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setModalSuspend({ open: false, userId: null });
        setDuracion("");
        fetchUsuarios();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error suspendiendo usuario:", error);
      toast.error("Error al suspender usuario");
    } finally {
      setAccionEnProgreso(null);
    }
  };

  //  Activar / desactivar usuario
  const cambiarEstadoUsuario = async (id) => {
    setAccionEnProgreso(id);
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/admin/users/${id}/estado`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        fetchUsuarios();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error cambiando estado:", error);
      toast.error("No se pudo actualizar el estado del usuario");
    } finally {
      setAccionEnProgreso(null);
    }
  };

  const usersFiltrados = users.filter((u) =>
    u.username.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    if (!loading && userData?.role === "admin") fetchUsuarios();
  }, [loading, userData]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Cargando sesión...
      </div>
    );

  if (!userData || userData.role !== "admin")
    return (
      <div className="text-center text-gray-600 py-10">
        No tienes permiso para acceder a este panel.
      </div>
    );

  //  formatea fecha local
  const formatFecha = (fecha) => {
    if (!fecha) return "";
    return new Date(fecha).toLocaleString("es-CL", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  return (
    <div className="w-full relative">
      {/*  Encabezado */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
       {/* Título */}
        <div>
          <h2 className="text-2xl font-bold text-green-700">Gestión de Usuarios</h2>
          <p className="text-gray-600 text-sm">
            Administra los usuarios registrados y su estado de verificación.
          </p>
        </div>

        {/* Barra de búsqueda + botón */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Buscar..."
            className="w-full sm:w-64"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Button
            onClick={fetchUsuarios}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Recargar
          </Button>
        </div>
      </div>

      {/*  Contenido */}
      {loadingUsers ? (
        <div className="flex justify-center items-center py-10 text-gray-500">
          <Loader2 className="animate-spin mr-2" /> Cargando usuarios...
        </div>
      ) : usersFiltrados.length === 0 ? (
        <div className="text-center text-gray-600 py-10 bg-gray-50 rounded-xl border">
          <User className="mx-auto text-gray-400 mb-2" size={40} />
          <p className="text-sm">No hay usuarios registrados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {usersFiltrados.map((u) => {
            const suspendido = u.estado === "suspendida";
            const inactivo = u.estado === "inactiva";
            const activo = u.estado === "activa";

            return (
              <Card
                key={u.id}
                className="p-5 border border-gray-200 hover:shadow-lg transition-all duration-300 rounded-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/*  Info usuario */}
                  <div className="flex items-center gap-4">
                    {u.url_img_perfil ? (
                      <img
                        src={u.url_img_perfil}
                        alt="Perfil"
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                        <ImageOff className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      {/* Nombre + estado */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            u.estado === "activa"
                              ? "bg-green-500"
                              : u.estado === "suspendida"
                              ? "bg-amber-500"
                              : "bg-gray-500"
                          }`}
                        />
                        <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[160px]">
                          {u.username || "—"}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            u.estado === "activa"
                              ? "bg-green-100 text-green-700"
                              : u.estado === "suspendida"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {u.estado === "activa"
                            ? "Activo"
                            : u.estado === "suspendida"
                            ? "Suspendido"
                            : "Inactivo"}
                        </span>
                      </div>

                      {/* Email */}
                      <p className="text-sm text-gray-600 flex items-center gap-1 truncate max-w-[180px]">
                        <Mail className="w-3.5 h-3.5 text-gray-500" /> {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Estados */}
                  <div className="space-y-1 text-sm text-gray-700">
                    <div className="flex items-center gap-2 leading-tight">
                      <ShieldCheck
                        className={`w-4 h-4 ${
                          u.is_email_verified ? "text-green-600" : "text-red-500"
                        }`}
                      />
                      <span>
                        {u.is_email_verified
                          ? "Email verificado"
                          : "Email no verificado"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 leading-tight">
                      <Building2
                        className={`w-4 h-4 ${
                          u.has_empresa ? "text-green-600" : "text-red-500"
                        }`}
                      />
                      <span>
                        {u.has_empresa ? "Empresa creada" : "Sin empresa"}
                      </span>
                    </div>

                    {suspendido && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          Suspendido hasta {formatFecha(u.suspension_expira_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/*  Acciones */}
                  <div className="flex flex-col md:items-end gap-2">
                    <p className="text-sm">
                      Rol:{" "}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </p>

                    <div className="flex gap-2">
                      {/* Botón 1: Suspender */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={inactivo || suspendido}
                        className={`text-xs flex items-center gap-1 border ${
                          suspendido
                            ? "border-amber-500 text-amber-600 bg-amber-50"
                            : "border-green-600 text-green-700 hover:bg-green-50"
                        }`}
                        onClick={() => setModalSuspend({ open: true, userId: u.id })}
                      >
                        {accionEnProgreso === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : suspendido ? (
                          <>
                            <Clock className="w-4 h-4" /> Suspendido
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4" /> Suspender
                          </>
                        )}
                      </Button>

                      {/* Botón 2: Activar / Desactivar */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cambiarEstadoUsuario(u.id)}
                        disabled={accionEnProgreso === u.id}
                        className={`text-xs flex items-center gap-1 border ${
                          activo
                            ? "border-gray-400 text-gray-700 hover:bg-gray-50"
                            : "border-green-600 text-green-700 hover:bg-green-50"
                        }`}
                      >
                        {accionEnProgreso === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : activo ? (
                          <>
                            <Ban className="w-4 h-4" /> Desactivar
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4" /> Reactivar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/*  Modal para suspender usuario */}
      {modalSuspend.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="p-6 w-80 bg-white shadow-xl rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Suspender usuario
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Ingrese la cantidad de días que desea suspender este usuario.
            </p>

            <Input
              type="number"
              min="1"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              placeholder="Ej: 7"
              className="mb-4"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-gray-400 text-gray-700 hover:bg-gray-100"
                onClick={() => setModalSuspend({ open: false, userId: null })}
              >
                Cancelar
              </Button>
              <Button
                onClick={suspenderUsuario}
                disabled={accionEnProgreso === modalSuspend.userId}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
              >
                {accionEnProgreso === modalSuspend.userId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;

