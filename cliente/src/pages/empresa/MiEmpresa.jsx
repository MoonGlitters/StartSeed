import { useState, useEffect, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { RefreshCcw } from "lucide-react";
import { getSafeCache, setSafeCache } from "../../helpers/safeCache.js";
import { assets } from '../../assets/assets.js'
// esquema de validacion para empresa
const EmpresaSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  rut: z.string(),
  nombre_fantasia: z.string().nullable().optional(),
  tipo_empresa: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  direccion_texto: z.string().nullable().optional(),
  descripcion: z.string().nullable().optional(),
  foto: z.string().nullable().optional(),
});

export const MiEmpresa = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cacheUsado, setCacheUsado] = useState(false);
  const [desvanecer, setDesvanecer] = useState(false);
  const navigate = useNavigate();

  // carga empresa con cache seguro y validacion
  const fetchUserCompany = async (usarCache = true) => {
    const cacheKey = "empresaUsuarioCache";
    const EXPIRACION_MS = 30 * 60 * 1000;

    try {
      if (usarCache) {
        const cache = getSafeCache(cacheKey);
        if (cache && cache.timestamp && cache.data) {
          const expirado = Date.now() - cache.timestamp > EXPIRACION_MS;

          if (!expirado) {
            const validado = EmpresaSchema.safeParse(cache.data);
            if (validado.success) {
              setEmpresa(validado.data);
              setCacheUsado(true);
              setLoading(false);
              setDesvanecer(false);
              setTimeout(() => setDesvanecer(true), 2500);
              setTimeout(() => setCacheUsado(false), 3200);
            } else {
              console.warn("Cache invalido, eliminando...");
              localStorage.removeItem(cacheKey);
            }
          } else {
            console.log("Cache expirado, eliminado.");
            localStorage.removeItem(cacheKey);
          }
        }
      }

      const { data } = await axios.get(`${backendUrl}/api/empresa/usuario`, {
        withCredentials: true,
      });

      if (data.success && data.empresa) {
        const validado = EmpresaSchema.safeParse(data.empresa);
        if (validado.success) {
          setEmpresa(validado.data);
          setSafeCache(cacheKey, validado.data);
        } else {
          console.warn("Datos backend invalidos:", validado.error);
        }
      } else {
        setEmpresa(null);
      }
    } catch (error) {
      console.error("Error al obtener empresa del usuario:", error);
      toast.error("No se pudo obtener empresa del usuario");
      setEmpresa(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) fetchUserCompany();
  }, [userData]);

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Cargando empresa...</p>;

  if (!empresa)
    return (
      <p className="text-center mt-10 text-red-500">
        No tienes empresa registrada
      </p>
    );

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 space-y-6">

      {/* aviso de cache */}
      {cacheUsado && (
        <div
          className={`flex justify-center items-center gap-2 mb-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 shadow-sm transition-all duration-500 ${
            desvanecer ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
          }`}
        >
          <RefreshCcw className="w-4 h-4 animate-spin-slow text-emerald-600/80" />
          <span className="italic font-medium">
            Datos cargados rapidamente Actualizando informacion de la empresa...
          </span>
        </div>
      )}

      <Card className="shadow-xl rounded-xl border border-gray-200 overflow-hidden">
        {/* encabezado */}
        <div className="bg-green-700 text-white p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* foto empresa */}
          <div
            className={`w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 ${
              empresa.foto ? "border-white" : "border-emerald-400 bg-emerald-50"
            } shadow-lg flex-shrink-0 transition-transform duration-300 hover:scale-105 cursor-pointer flex items-center justify-center`}
            onClick={() => setShowModal(true)}
          >
            <img
              src={empresa.foto || assets.logoempresas}
              alt={`Foto de ${empresa.nombre}`}
              className={`${
                empresa.foto ? "object-cover" : "object-contain w-[85%] h-[85%]"
              } transition-transform duration-300`}
            />
          </div>

            {/* info */}
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold">{empresa.nombre}</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  Estado de Solicitud:
                </span>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-200 text-green-800">
                  Finalizado
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate(`/editar-empresa/${empresa.id}`)}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Editar Empresa
          </Button>
        </div>

        {/* contenido */}
        <CardContent className="p-6 space-y-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-gray-700">
                <strong>RUT:</strong> {empresa.rut}
              </p>
              <p className="text-gray-700">
                <strong>Nombre Fantasia:</strong>{" "}
                {empresa.nombre_fantasia || "—"}
              </p>
              <p className="text-gray-700">
                <strong>Tipo de Empresa:</strong> {empresa.tipo_empresa || "—"}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                <strong>Telefono:</strong> {empresa.telefono || "—"}
              </p>
              <p className="text-gray-700 break-words">
                <strong>Direccion:</strong> {empresa.direccion_texto || "—"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <h2 className="font-semibold text-lg">Descripcion</h2>
            <p className="text-gray-700">{empresa.descripcion || "Sin descripcion"}</p>
          </div>
        </CardContent>
      </Card>

      {/* modal de foto */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative p-4 max-w-md w-full animate-fadeInScale"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              className="absolute -top-4 -right-4 text-white text-3xl font-bold bg-emerald-600 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>

            {/* Imagen */}
            <div className="rounded-xl overflow-hidden shadow-2xl bg-white/10 border border-white/20">
              <img
                src={empresa.foto || assets.logoempresas}
                alt={`Foto de ${empresa.nombre}`}
                className="w-full h-auto rounded-xl transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
