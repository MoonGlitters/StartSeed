import { useState, useEffect, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { MapaSelection } from "../../components/MapaSelection.jsx";

export const EditarEmpresa = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [empresa, setEmpresa] = useState(null);
  const [form, setForm] = useState({});
  const [mapOpen, setMapOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);
 
  const LIBRARIES = ["places"];

  const tiposEmpresa = [
    "Restaurante",
    "Cafeteria",
    "Bar",
    "Tienda Retail",
    "Supermercado",
    "Farmacia",
    "Servicios",
    "Otro",
  ];

  // obtener empresa actual
  const fetchEmpresa = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/empresa/usuario`, {
        withCredentials: true,
      });
      if (data.success && data.empresa) {
        setEmpresa(data.empresa);
        setForm({
          ...data.empresa,
          latitud: Number(data.empresa.latitud) || -36.6066,
          longitud: Number(data.empresa.longitud) || -72.1034,
        });
      } else {
        toast.error("No se encontro la empresa del usuario");
        navigate("/mi-empresa");
      }
    } catch (error) {
      toast.error("Error al cargar la empresa");
      navigate("/mi-empresa");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchEmpresa();
  }, []);

  // cambios de campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ubicacion desde el mapa
  const handleLocationSelect = (locationData) => {
    setForm((prev) => ({
      ...prev,
      latitud: locationData.latitud,
      longitud: locationData.longitud,
      direccion_texto: locationData.direccion_texto,
    }));
  };

  // enviar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/empresa/editar/${form.id}`,
        form,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Cambios guardados correctamente");
        navigate("/mi-empresa");
      } else {
        toast.error(data.message || "Error al guardar cambios");
      }
    } catch {
      toast.error("Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-green-50 to-amber-100 text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        Cargando datos de la empresa...
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-green-50 to-amber-100 text-red-600">
        No se encontro la empresa
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-white via-green-50 to-amber-100">
      <Card className="w-full max-w-2xl shadow-xl border border-gray-200">
        <CardContent className="p-8 relative">

          {/* boton volver */}
          <button
            onClick={() => navigate("/mi-empresa")}
            className="absolute top-4 left-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-5 py-2 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-600 shadow-md transition-all duration-300 transform hover:scale-[1.03]"
          >
            Volver
          </button>

          <h2 className="text-2xl font-bold mb-6 text-green-700 text-center">
            Editar Empresa
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">

            {/* campos bloqueados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>RUT Empresa</Label>
                <Input
                  value={form.rut || ""}
                  disabled
                  className="bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre Legal</Label>
                <Input
                  value={form.nombre || ""}
                  disabled
                  className="bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* campos editables */}
            <div className="space-y-2">
              <Label htmlFor="nombre_fantasia">Nombre de Fantasia</Label>
              <Input
                id="nombre_fantasia"
                name="nombre_fantasia"
                value={form.nombre_fantasia || ""}
                onChange={handleChange}
                className="transition-all focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                name="telefono"
                value={form.telefono || ""}
                onChange={handleChange}
                required
                className="transition-all focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_empresa">Tipo de Empresa *</Label>
              <Select
                name="tipo_empresa"
                value={form.tipo_empresa || ""}
                onChange={handleChange}
                required
                className="transition-all focus:ring-2 focus:ring-green-500"
              >
                <option value="">Selecciona un tipo</option>
                {tiposEmpresa.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={form.descripcion || ""}
                onChange={handleChange}
                rows={4}
                className="transition-all focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* direccion y mapa */}
            <div className="space-y-2">
              <Label htmlFor="direccion_texto">Direccion</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="direccion_texto"
                  name="direccion_texto"
                  value={form.direccion_texto || ""}
                  onChange={handleChange}
                  required
                  className="transition-all focus:ring-2 focus:ring-green-500"
                />
                <Button
                  type="button"
                  onClick={() => setMapOpen(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Mapa
                </Button>
              </div>
            </div>

            {/* modal del mapa */}
            {mapOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-white w-11/12 max-w-3xl p-4 rounded-lg relative shadow-xl">
                  <button
                    className="absolute top-3 right-3 text-red-600 font-bold text-lg"
                    onClick={() => setMapOpen(false)}
                  >
                    ×
                  </button>
                  <MapaSelection
                    defaultLat={Number(form.latitud) || -36.6066}
                    defaultLng={Number(form.longitud) || -72.1034}
                    onLocationSelect={(loc) => {
                      handleLocationSelect({
                        latitud: loc.latitud,
                        longitud: loc.longitud,
                        direccion_texto: loc.direccion_texto,
                      });
                      setMapOpen(false);
                    }}
                    libraries={LIBRARIES}
                  />
                </div>
              </div>
            )}

            {/* boton guardar */}
            <div className="text-center pt-4">
              <Button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 w-full font-semibold rounded-lg transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
