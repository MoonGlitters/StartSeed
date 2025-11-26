import { useState, useEffect, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SolicitudSchema } from "../../helpers/validations/solicitudSchema.js";
import { normalizeRut, formatRutPretty } from "../../helpers/rutUtils.js";


export const CrearSolicitud = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [solicitud, setSolicitud] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const fetchSolicitud = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/solicitudes/ultima-solicitud`, {
        withCredentials: true,
      });

      if (data.success && (data.solicitud || data.tieneSolicitud)) {
        const solicitudActiva = data.solicitud;
        setSolicitud(solicitudActiva);
        setNombre(solicitudActiva?.nombre || "");
        setRut(solicitudActiva?.rut || "");

        const estado = (solicitudActiva?.estado || data.estado)?.toLowerCase();
        if (estado === "finalizado") navigate("/mi-empresa");
        else if (estado === "aceptado") navigate("/completar-empresa");
      }
    } catch {
      toast.error("Error al obtener el estado de la solicitud");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitud();
  }, []);

  useEffect(() => {
    if (userData && !userData.email_verificado && !userData.is_email_verified) {
      toast.warning("Debes verificar tu correo antes de crear una empresa.");
      navigate("/editar-perfil");
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = SolicitudSchema.safeParse({ nombre, rut, archivo });
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      toast.warn("Revisa los campos del formulario.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("rut", rut);
    formData.append("archivo", archivo);

    try {
      const { data } = await axios.post(`${backendUrl}/api/solicitudes/solicitud`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        toast.success("Solicitud creada correctamente");

        await fetchSolicitud(); // vuelve a consultar la solicitud actualizada
      } else {
        toast.error(data.message || "Error al enviar la solicitud");
      }
    } catch (error) {
      console.error("Error al crear solicitud:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Error al crear solicitud");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-green-700">
        <Loader2 className="animate-spin w-10 h-10 mb-2" />
        Cargando solicitud...
      </div>
    );
  }

  if (solicitud) {
    const estado = solicitud.estado?.toLowerCase();
    if (estado === "pendiente")
      return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-white via-green-50 to-amber-100 px-4">
          <Card className="max-w-md w-full p-8 text-center shadow-lg border border-yellow-200 bg-yellow-50">
            <Clock className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">
              Solicitud pendiente
            </h2>
            <p className="text-gray-700">
              Tu solicitud está siendo revisada. Te notificaremos al evaluarla.
            </p>
          </Card>
        </div>
      );

    if (estado === "aceptado")
      return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-white via-green-50 to-amber-100 px-4">
          <Card className="max-w-md w-full p-8 text-center shadow-lg border border-green-300 bg-green-50">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-green-700 mb-2">
              Solicitud aceptada
            </h2>
            <p className="text-gray-700">Ya puedes completar los datos de tu empresa.</p>
            <Button
              className="mt-4 bg-green-600 text-white hover:bg-green-700"
              onClick={() => navigate("/completar-empresa")}
            >
              Completar Empresa
            </Button>
          </Card>
        </div>
      );

    if (estado === "rechazado")
      return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-white via-green-50 to-amber-100 px-4">
          <Card className="max-w-md w-full p-8 text-center shadow-lg border border-red-300 bg-red-50">
            <XCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Solicitud rechazada
            </h2>
            <p className="text-gray-700 mb-3">
              {solicitud.razon_rechazo || "No se especificó una razón."}
            </p>
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => setSolicitud(null)}
            >
              Enviar nueva solicitud
            </Button>
          </Card>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-green-50 to-amber-100 px-4 py-10">
      <Card className="max-w-lg w-full shadow-xl border border-gray-200">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-green-700 text-center mb-6">
            Crear Solicitud de Empresa
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Nombre de la Empresa</Label>
              <Input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Panadería Ñuble"
                className={`focus:ring-2 ${
                  errors.nombre ? "ring-red-500" : "focus:ring-emerald-500"
                }`}
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
              )}
            </div>

            <div>
              <Label>RUT</Label>
              <Input
                type="text"
                value={rut}
                onChange={(e) => setRut(formatRutPretty(e.target.value))}
                placeholder="11.111.111-K"
                className={`focus:ring-2 ${
                  errors.rut ? "ring-red-500" : "focus:ring-emerald-500"
                }`}
              />
              {errors.rut && <p className="text-red-600 text-sm mt-1">{errors.rut}</p>}
            </div>

            <div>
              <Label>Certificado de Inicio de Actividades</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) => setArchivo(e.target.files[0])}
                className={`cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-green-600 file:text-white file:px-3 file:py-1 file:hover:bg-green-700 ${
                  errors.archivo ? "ring-red-500" : ""
                }`}
              />
              {errors.archivo && (
                <p className="text-red-600 text-sm mt-1">{errors.archivo}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold mt-6"
            >
              Enviar Solicitud
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
