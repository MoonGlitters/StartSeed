import { useState, useEffect, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { MapaSelection } from "../../components/MapaSelection.jsx";
import { useNavigate } from "react-router-dom";
import { Loader2, MapPin, FileText } from "lucide-react";

const LIBRARIES = ["places"];

export const CompletarEmpresa = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [solicitud, setSolicitud] = useState(null);
  const [form, setForm] = useState({
    nombre_fantasia: "",
    descripcion: "",
    telefono: "",
    tipo_empresa: "",
    direccion_texto: "",
    latitud: "",
    longitud: "",
  });

  const tiposEmpresa = [
    "Restaurante",
    "Cafetería",
    "Bar",
    "Tienda Retail",
    "Supermercado",
    "Farmacia",
    "Servicios",
    "Otro",
  ];

  // Cargar solicitud aprobada
  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/solicitudes/ultima-solicitud`, {
          withCredentials: true,
        });

        if (data.success && data.solicitud) {
          setSolicitud(data.solicitud);
        } else {
          toast.error("No se encontró una solicitud aprobada.");
          navigate("/");
        }
      } catch {
        toast.error("Error al obtener la solicitud.");
        navigate("/");
      }
    };

    fetchSolicitud();
  }, [backendUrl, navigate]);

  //  Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  //  Selección de dirección desde el mapa
  const handleLocationSelect = (locationData) => {
    setForm((prev) => ({
      ...prev,
      latitud: locationData.latitud,
      longitud: locationData.longitud,
      direccion_texto: locationData.direccion_texto,
    }));
  };
  
  //  Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!solicitud) return;

    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/empresa/crear`, form, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      if (data.success) {
        toast.success("Empresa creada exitosamente ");

        // avisa al navbar que ya tiene empresa
        localStorage.setItem("tieneEmpresa", "true");

        // Limpiar estado anterior de solicitud para evitar notificaciones erroneas
        localStorage.removeItem("ultimoEstadoSolicitud");

        // Redirigir al perfil de empresa
        navigate("/mi-empresa");

        setTimeout(() => {
        window.location.reload(); // recargar pagina, lo nuevo por si se rompe
          }, 500);

      } else {
        toast.error(data.mensaje || "Error al crear la empresa.");
      }
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error interno al crear la empresa.");
    } finally {
      setLoading(false);
    }
  };

  if (!solicitud) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-green-50 to-amber-100 text-green-700">
        <Loader2 className="animate-spin w-10 h-10 mb-3" />
        Cargando datos de solicitud...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-green-50 to-amber-100 px-4 py-10">
      <Card className="w-full max-w-2xl shadow-2xl border border-gray-200 rounded-2xl bg-white/90 backdrop-blur-md">
        <CardContent className="p-10">
          {/* Encabezado */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-green-700 mb-2">
              Completar Registro de Empresa
            </h2>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              Ingresa los datos restantes para finalizar tu registro y comenzar a operar dentro de StartSeed.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Datos bloqueados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-700 font-semibold">RUT Empresa</Label>
                <Input
                  value={solicitud.rut}
                  disabled
                  className="bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <Label className="text-gray-700 font-semibold">Nombre Legal</Label>
                <Input
                  value={solicitud.nombre}
                  disabled
                  className="bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Certificado */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" /> Certificado Legal
              </Label>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-300">
                <span className="text-sm text-gray-600 truncate">
                  {solicitud.url_certificado
                    ? solicitud.url_certificado.split("/").pop()
                    : "Sin archivo"}
                </span>
                {solicitud.url_certificado && (
                  <a
                    href={solicitud.url_certificado}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 font-semibold hover:underline"
                  >
                    Ver documento
                  </a>
                )}
              </div>
            </div>

            {/* Campos editables */}
            <div className="space-y-6">
              <div>
                <Label className="text-gray-700 font-semibold">Nombre de Fantasía *</Label>
                <Input
                  name="nombre_fantasia"
                  value={form.nombre_fantasia}
                  onChange={handleChange}
                  placeholder="Ej: Panadería San Juan"
                  required
                  className="focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">Tipo de Empresa *</Label>
                <select
                  name="tipo_empresa"
                  value={form.tipo_empresa}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Selecciona un tipo</option>
                  {tiposEmpresa.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">Teléfono *</Label>
                <Input
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="+56 9 XXXX XXXX"
                  required
                  className="focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">Descripción *</Label>
                <Textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Describe brevemente tu empresa..."
                  rows={4}
                  required
                  className="focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Direccion */}
              <div>
                <Label className="text-gray-700 font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" /> Dirección *
                </Label>
                <div className="flex gap-2">
                  <Input
                    name="direccion_texto"
                    value={form.direccion_texto}
                    onChange={handleChange}
                    placeholder="Ej: Av. O'Higgins 123, Chillán"
                    required
                    className="flex-1 focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button
                    type="button"
                    onClick={() => setMapOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    Mapa
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Mapa */}
            {mapOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="relative bg-white w-11/12 max-w-3xl p-5 rounded-2xl shadow-2xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setMapOpen(false)}
                    className="absolute top-3 right-4 text-red-600 text-xl font-bold hover:text-red-700 transition"
                  >
                    ✕
                  </button>

                  <div className="rounded-lg overflow-hidden border border-gray-300">
                    <MapaSelection
                      defaultLat={form.latitud || -36.6066}
                      defaultLng={form.longitud || -72.1034}
                      onLocationSelect={(loc) => {
                        handleLocationSelect(loc);
                        setMapOpen(false);
                      }}
                      libraries={LIBRARIES}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Boton */}
            <Button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-lg font-semibold rounded-lg shadow-md transition-all ${
                loading
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {loading ? "Creando empresa..." : "Finalizar registro"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
