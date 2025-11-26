import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCcw, Loader2, Building2, User2 } from "lucide-react";

export const AdminSolicitudesEmpresa = () => {
  const { backendUrl, userData, loading } = useContext(AppContext);

  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [rechazoData, setRechazoData] = useState({ id: null, razon: "", visible: false });
  const [animando, setAnimando] = useState(false);

  // Obtener solicitudes desde backend
  const fetchSolicitudes = async () => {
    try {
      setAnimando(true);
      const { data } = await axios.get(`${backendUrl}/api/solicitudes/admin`, {
        withCredentials: true,
      });

      if (data.success) {
        setSolicitudes(data.data);
        console.log(data);
        
      } else {
        toast.error("Error al obtener las solicitudes");
      }
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setAnimando(false);
      setLoadingSolicitudes(false);
    }
  };

  // Cambiar estado de solicitud
  const handleEstado = async (id, estado, razon_rechazo = null) => {
    try {
      await axios.patch(
        `${backendUrl}/api/admin/estado-solicitud`,
        { id, estado, razon_rechazo },
        { withCredentials: true }
      );
      toast.success(
        estado === "aceptado"
          ? " Solicitud aceptada con éxito"
          : " Solicitud rechazada"
      );
      fetchSolicitudes();
      setRechazoData({ id: null, razon: "", visible: false });
    } catch (error) {
      console.error("Error cambiando estado:", error);
      toast.error("No se pudo actualizar el estado de la solicitud");
    }
  };

  // Filtrar por nombre
  const solicitudesFiltradas = solicitudes.filter((s) =>
    s.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Cargar al iniciar
  useEffect(() => {
    if (!loading && userData?.role === "admin") {
      fetchSolicitudes();
    }
  }, [loading, userData]);

  // Validar rol admin
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Cargando sesión...
      </div>
    );
  }

  if (!userData || userData.role !== "admin") {
    return (
      <div className="text-center text-gray-600 py-10">
        No tienes permisos para acceder a este panel.
      </div>
    );
  }

  // Render principal
  return (
    <div className="w-full">
     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-green-700">Solicitudes de Empresa</h2>
        <p className="text-gray-600 text-sm">
          Administra las solicitudes de registro de empresas enviadas por los usuarios.
        </p>
      </div>

      {/* Barra de búsqueda + botón */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
        <Input
          type="text"
          placeholder="Buscar empresa..."
          className="w-full sm:w-64"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Button
          onClick={fetchSolicitudes}
          className={`bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 ${
            animando ? "opacity-75 cursor-wait" : ""
          }`}
        >
          {animando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCcw className="w-4 h-4" />
          )}
          Recargar
        </Button>
      </div>
    </div>

      {/* Contenido */}
      {loadingSolicitudes ? (
        <div className="flex justify-center items-center py-10 text-gray-500">
          <Loader2 className="animate-spin mr-2" /> Cargando solicitudes...
        </div>
      ) : solicitudesFiltradas.length === 0 ? (
        <div className="text-center text-gray-600 py-10 bg-gray-50 rounded-xl border">
          <Building2 className="mx-auto text-gray-400 mb-2" size={40} />
          <p className="text-sm">No hay solicitudes registradas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudesFiltradas.map((s) => (
            <Card
              key={s.id}
              className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border border-gray-200 hover:shadow-lg transition-all duration-300 rounded-xl"
            >
              <div className="flex items-center gap-4 mb-3 md:mb-0">
                <div className="p-3 bg-green-50 rounded-full">
                  <Building2 className="text-green-600 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{s.nombre}</h3>
                  <p className="text-sm text-gray-600">RUT: {s.rut}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <User2 className="w-3.5 h-3.5 text-gray-500" />
                    Solicitante:{" "}
                    <span className="font-medium text-emerald-700">
                      {s.creador?.username || "—"}
                    </span>
                  </p>
                  {/* Aquí agregamos el enlace para ver el archivo */}
                  {s.url_certificado && (
                    <a
                      href={s.url_certificado}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2 block"
                    >
                      Ver archivo adjunto
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Estado: </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      s.estado === "pendiente"
                        ? "bg-amber-100 text-amber-700"
                        : s.estado === "aceptado"
                        ? "bg-green-100 text-green-700"
                        : s.estado === "rechazado"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {s.estado}
                  </span>
                </div>

                <div className="flex gap-2 justify-end">
                  {s.estado === "pendiente" ? (
                    <>
                      <Button
                        onClick={() => handleEstado(s.id, "aceptado")}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        Aceptar
                      </Button>
                      <Button
                        onClick={() =>
                          setRechazoData({ id: s.id, razon: "", visible: true })
                        }
                        className="bg-red-600 hover:bg-red-700 text-white text-sm"
                      >
                        Rechazar
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      No se pueden modificar solicitudes finalizadas
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal rechazo */}
      {rechazoData.visible && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[400px]">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Razón del rechazo
            </h3>
            <textarea
              value={rechazoData.razon}
              onChange={(e) =>
                setRechazoData((prev) => ({ ...prev, razon: e.target.value }))
              }
              placeholder="Explica brevemente el motivo..."
              className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:ring-2 focus:ring-red-500 focus:outline-none"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  const texto = rechazoData.razon.trim();
                  if (texto.length < 10) {
                    toast.warning("La razón debe tener al menos 10 caracteres.");
                    return;
                  }
                  handleEstado(rechazoData.id, "rechazado", texto);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirmar
              </Button>
              <Button
                onClick={() =>
                  setRechazoData({ id: null, razon: "", visible: false })
                }
                className="bg-gray-300 hover:bg-gray-400 text-black"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSolicitudesEmpresa;
