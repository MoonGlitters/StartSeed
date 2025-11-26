import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RefreshCcw,
  Loader2,
  Building2,
  RotateCcw,
  Ban,
  ImageOff,
  MapPin,
  Phone,
  FileText,
} from "lucide-react";

export const AdminEmpresas = () => {
  const { backendUrl, userData, loading } = useContext(AppContext);
  const [empresas, setEmpresas] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [accionEnProgreso, setAccionEnProgreso] = useState(null);
  const [actualizando, setActualizando] = useState(false);

  // Obtener empresas
  const fetchEmpresas = async () => {
    try {
      setActualizando(true);
      const { data } = await axios.get(`${backendUrl}/api/empresa/`, {
        withCredentials: true,
      });

      if (data.success && Array.isArray(data.data)) {
        setEmpresas(data.data);
      } else {
        toast.error("Error al obtener empresas");
      }
    } catch (error) {
      console.error("Error cargando empresas:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setActualizando(false);
      setLoadingEmpresas(false);
    }
  };

  // Cambiar estado (sin desaparecer la empresa)
  const cambiarEstadoEmpresa = async (id) => {
    setAccionEnProgreso(id);
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/admin/empresas/${id}/estado`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || "Estado actualizado correctamente");

        //  Actualiza solo la empresa cambiada sin eliminarla
        setEmpresas((prev) =>
          prev.map((e) =>
            e.id === id
              ? { ...e, estado: e.estado === "activa" ? "inactiva" : "activa" }
              : e
          )
        );
      } else {
        toast.error(data.message || "Error al actualizar empresa");
      }
    } catch (error) {
      console.error("Error cambiando estado:", error);
      toast.error("No se pudo cambiar el estado de la empresa");
    } finally {
      setAccionEnProgreso(null);
    }
  };

  // Filtro
  const empresasFiltradas = empresas.filter((e) =>
    e.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    if (!loading && userData?.role === "admin") fetchEmpresas();
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

  return (
    <div className="w-full relative px-4 sm:px-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-green-700">
            Gestión de Empresas
          </h2>
          <p className="text-gray-600 text-sm">
            Administra las empresas registradas y su estado activo/inactivo.
          </p>
        </div>

        {/* Buscar / recargar */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Buscar empresa..."
            className="w-full sm:w-64"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Button
            onClick={fetchEmpresas}
            disabled={actualizando}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            {actualizando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            Recargar
          </Button>
        </div>
      </div>

      {/* Contenido */}
      {loadingEmpresas ? (
        <div className="flex justify-center items-center py-10 text-gray-500">
          <Loader2 className="animate-spin mr-2" /> Cargando empresas...
        </div>
      ) : empresasFiltradas.length === 0 ? (
        <div className="text-center text-gray-600 py-10 bg-gray-50 rounded-xl border">
          <Building2 className="mx-auto text-gray-400 mb-2" size={40} />
          <p className="text-sm">No hay empresas registradas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {empresasFiltradas.map((e) => {
            const activa = e.estado === "activa";

            return (
              <Card
                key={e.id}
                className={`p-5 border transition-all duration-300 rounded-xl hover:shadow-lg ${
                  activa
                    ? "border-emerald-200 bg-white"
                    : "border-gray-300 bg-gray-50 opacity-90"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Info empresa */}
                  <div className="flex items-center gap-4">
                    {e.foto ? (
                      <img
                        src={e.foto}
                        alt="Logo empresa"
                        className="w-14 h-14 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                        <ImageOff className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[200px]">
                        {e.nombre}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {e.nombre_fantasia || "Sin nombre comercial"}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-medium ${
                          activa
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {activa ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  </div>

                  {/* Datos */}
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <FileText className="w-3.5 h-3.5 inline text-gray-500 mr-1" />
                      <strong>RUT:</strong> {e.rut}
                    </p>
                    <p>
                      <Phone className="w-3.5 h-3.5 inline text-gray-500 mr-1" />
                      <strong>Tel:</strong> {e.telefono || "—"}
                    </p>
                    <p className="flex items-start">
                      <MapPin className="w-3.5 h-3.5 inline text-gray-500 mr-1 mt-[2px]" />
                      <span className="truncate">
                        <strong>Dir:</strong> {e.direccion_texto || "—"}
                      </span>
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col md:items-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cambiarEstadoEmpresa(e.id)}
                      disabled={accionEnProgreso === e.id}
                      className={`text-xs flex items-center gap-1 border ${
                        activa
                          ? "border-gray-400 text-gray-700 hover:bg-gray-50"
                          : "border-green-600 text-green-700 hover:bg-green-50"
                      }`}
                    >
                      {accionEnProgreso === e.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : activa ? (
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminEmpresas;
