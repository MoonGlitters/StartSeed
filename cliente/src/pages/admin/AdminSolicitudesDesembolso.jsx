import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCcw, Building2, Loader2 } from "lucide-react";

export const AdminSolicitudesDesembolso = () => {
  const { backendUrl, userData, loading } = useContext(AppContext);

  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [rechazoData, setRechazoData] = useState({ id: null, razon: "", visible: false });

  // Obtener solicitudes
  const fetchSolicitudes = async () => {
    try {
      setLoadingSolicitudes(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/desembolsos/pendientes`, {
        withCredentials: true,
      });
      if (data.success) {
        setSolicitudes(data.data);
      } else {
        toast.error("Error al obtener las solicitudes de desembolso");
      }
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  // Aprobar o rechazar
  const handleAccion = async (id, accion, comentario = null) => {
    try {
      const url = `${backendUrl}/api/admin/desembolsos/${id}/${accion}`;
      const payload = accion === "rechazar" ? { comentario } : {};

      const { data } = await axios.post(url, payload, { withCredentials: true });

      if (data.success) {
        toast.success(
          accion === "aprobar"
            ? " Desembolso aprobado correctamente"
            : " Desembolso rechazado correctamente"
        );
      } else {
        toast.error(data.message || "Error desconocido al procesar la solicitud");
      }

      fetchSolicitudes();
      setRechazoData({ id: null, razon: "", visible: false });
    } catch (error) {
      console.error("Error al actualizar desembolso:", error);

      const backendMessage =
        error.response?.data?.message ||
        error.message ||
        "Error desconocido al procesar la solicitud.";

      // segun el tipo de error
      if (backendMessage.includes("Payout") || backendMessage.includes("transferencia")) {
        toast.warn(` ${backendMessage}`);
      } else if (backendMessage.includes("no tiene datos bancarios") || backendMessage.includes("bancarios")) {
        toast.info(` ${backendMessage}`);
      } else if (backendMessage.includes("ventas pendientes") || backendMessage.includes("Rechazada")) {
        toast.warning(`${backendMessage}`);
      } else {
        toast.error(`${backendMessage}`);
      }
    }
  };

  // Filtro de busqueda
  const solicitudesFiltradas = solicitudes.filter((s) =>
    s.empresa?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Cargar solicitudes al iniciar
  useEffect(() => {
    if (!loading && userData?.role === "admin") {
      fetchSolicitudes();
    }
  }, [loading, userData]);

  // Proteccion por rol
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

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        {/* Título */}
        <div>
          <h2 className="text-2xl font-bold text-green-700">Solicitudes de Desembolso</h2>
          <p className="text-gray-600 text-sm">
            Gestiona las solicitudes enviadas por las empresas registradas.
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
            className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            {loadingSolicitudes ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            Recargar
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      {loadingSolicitudes ? (
        <div className="flex items-center justify-center text-gray-500 py-10">
          <Loader2 className="animate-spin mr-2" /> Cargando solicitudes...
        </div>
      ) : solicitudesFiltradas.length === 0 ? (
        <div className="text-center text-gray-600 py-10 bg-gray-50 rounded-xl border">
          <Building2 className="mx-auto text-gray-400 mb-2" size={40} />
          <p className="text-sm">No hay solicitudes pendientes de desembolso.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudesFiltradas.map((s) => (
            <Card
              key={s.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 border border-gray-200 hover:shadow-lg transition-all duration-300 rounded-xl"
            >
              <div className="flex items-center gap-4 mb-3 md:mb-0">
                <div className="p-3 bg-green-50 rounded-full">
                  <Building2 className="text-green-600 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{s.empresa?.nombre}</h3>
                  <p className="text-sm text-gray-600">
                    ID: <span className="font-mono text-gray-800">{s.id.slice(0, 8)}...</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Fecha:{" "}
                    {new Date(s.fecha_solicitud).toLocaleDateString("es-CL", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Monto solicitado:</span>{" "}
                    <span className="text-emerald-700 font-semibold">
                      ${parseFloat(s.monto_solicitado).toLocaleString("es-CL")}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Ventas brutas:</span> $
                    {parseFloat(s.monto_bruto_ventas).toLocaleString("es-CL")}
                  </p>
                  <p>
                    <span className="font-medium">Comisión retenida:</span> $
                    {parseFloat(s.monto_comision_retenido).toLocaleString("es-CL")}
                  </p>
                </div>

                <div className="flex gap-2 justify-end md:justify-center">
                  <Button
                    onClick={() => handleAccion(s.id, "aprobar")}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-4"
                  >
                    Aprobar
                  </Button>
                  <Button
                    onClick={() =>
                      setRechazoData({ id: s.id, razon: "", visible: true })
                    }
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-4"
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de rechazo */}
      {rechazoData.visible && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[400px]">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Motivo del rechazo
            </h3>
            <textarea
              value={rechazoData.razon}
              onChange={(e) =>
                setRechazoData((prev) => ({ ...prev, razon: e.target.value }))
              }
              placeholder="Escribe el motivo..."
              className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:ring-2 focus:ring-red-500 focus:outline-none"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  const texto = rechazoData.razon.trim();
                  if (texto.length < 10) {
                    toast.warning("El comentario debe tener al menos 10 caracteres.");
                    return;
                  }
                  handleAccion(rechazoData.id, "rechazar", texto);
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

export default AdminSolicitudesDesembolso;
