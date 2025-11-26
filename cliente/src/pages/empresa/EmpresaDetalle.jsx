import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { getSafeCache, setSafeCache } from "../../helpers/safeCache.js";
import { ComentariosEmpresa } from "../../components/ComentariosEmpresa.jsx";
import { assets } from "../../assets/assets.js";

// validacion de estructura
const EmpresaSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  nombre_fantasia: z.string().nullable().optional(),
  tipo_empresa: z.string().nullable().optional(),
  descripcion: z.string().nullable().optional(),
  direccion_texto: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  foto: z.string().nullable().optional(),
  latitud: z.coerce.number().nullable().optional(),
  longitud: z.coerce.number().nullable().optional(),
});

export const EmpresaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [empresa, setEmpresa] = useState(null);
  const [cacheUsado, setCacheUsado] = useState(false);

  // carga empresa con cache seguro y validacion
  const fetchEmpresa = async (usarCache = true) => {
    const cacheKey = `empresaCache_${id}`;
    const EXPIRACION_MS = 10 * 60 * 1000;

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
            } else {
              localStorage.removeItem(cacheKey);
            }
          } else {
            localStorage.removeItem(cacheKey);
          }
        }
      }

      const { data } = await axios.get(`${backendUrl}/api/empresa/${id}`);
      const parsed = EmpresaSchema.safeParse(data?.empresa || data?.data || data);

      if (parsed.success) {
        setEmpresa(parsed.data);
        setSafeCache(cacheKey, parsed.data);
      } else {
        console.warn("Error de validacion en backend:", parsed.error);
        toast.error("Error al validar datos de la empresa");
      }
    } catch (error) {
      console.error("Error al cargar empresa:", error);
      toast.error("Error al conectar con el servidor");
    }
  };

  useEffect(() => {
    fetchEmpresa();
  }, [id]);

  if (!empresa)
    return (
      <div className="bg-gradient-natural flex justify-center items-center text-gray-700 h-screen">
        Cargando...
      </div>
    );

  const mapaLink =
    empresa.latitud && empresa.longitud
      ? `https://www.google.com/maps?q=${empresa.latitud},${empresa.longitud}`
      : empresa.direccion_texto
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          empresa.direccion_texto
        )}`
      : null;

  return (
    <div className="bg-gradient-to-br from-white via-green-50 to-amber-100 min-h-screen flex flex-col items-center py-10 px-6">
      {/*  Bloque principal de la empresa */}
      <div className="max-w-6xl w-full bg-white/90 rounded-2xl shadow-2xl backdrop-blur-sm grid md:grid-cols-2 gap-10 p-8 md:p-12 animate-fadeIn relative">
        {/* boton volver */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold shadow-md hover:from-emerald-700 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.03] active:scale-95"
        >
          ← Volver
        </button>

        {/* imagen empresa */}
        <div className="flex justify-center items-center mt-4">
          <img
            src={empresa.foto || assets.logoempresas}
            alt={empresa.nombre}
            className="w-full max-w-md h-[400px] object-cover rounded-xl shadow-md hover:scale-[1.02] transition-transform duration-300"
          />
        </div>

        {/* detalles empresa */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">
            {empresa.nombre}
          </h1>
          {empresa.nombre_fantasia && (
            <p className="text-gray-700 mb-3 text-lg italic">
              "{empresa.nombre_fantasia}"
            </p>
          )}

          <p className="text-emerald-700 font-semibold mb-4">
            {empresa.tipo_empresa || "Categoría no especificada"}
          </p>

          {empresa.descripcion && (
            <p className="text-gray-700 mb-6 leading-relaxed">
              {empresa.descripcion}
            </p>
          )}

          <div className="space-y-3 mb-6 text-gray-700">
            {empresa.telefono && (
              <p>
                <strong>Teléfono:</strong> {empresa.telefono}
              </p>
            )}
            {empresa.direccion_texto && (
              <p>
                <strong>Dirección:</strong> {empresa.direccion_texto}
              </p>
            )}
          </div>

          {/* Botones de accion */}
          <div className="flex flex-wrap gap-4">
            {mapaLink && (
              <a
                href={mapaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold shadow-md hover:from-green-700 hover:to-emerald-600 transition-all duration-300">
                  Ver en Google Maps
                </Button>
              </a>
            )}

            {/*  Ver productos de la empresa */}
            <Button
              onClick={() => navigate(`/empresa/${id}/productos`)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-semibold shadow-md hover:from-amber-600 hover:to-yellow-500 transition-all duration-300"
            >
              Ver productos de la empresa
            </Button>
          </div>

          {cacheUsado && (
            <p className="mt-4 text-xs text-gray-500 italic">
              Mostrando datos almacenados en cache, actualizando en segundo
              plano...
            </p>
          )}
        </div>
      </div>

      {/* seccion comentarios */}
      <div className="max-w-6xl w-full mt-10">
        <ComentariosEmpresa id_empresa={empresa.id} />
      </div>
    </div>
  );
};
