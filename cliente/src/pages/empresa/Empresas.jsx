import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { z } from "zod";
import { RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { getSafeCache, setSafeCache } from "../../helpers/safeCache.js";
import { assets } from '../../assets/assets.js'
// esquema de validacion
const EmpresaSchema = z.array(
  z.object({
    id: z.string().uuid(),
    nombre: z.string(),
    nombre_fantasia: z.string().nullable().optional(),
    tipo_empresa: z.string().nullable().optional(),
    descripcion: z.string().nullable().optional(),
    foto: z.string().nullable().optional(),
  })
);

export const Empresas = () => {
  const { backendUrl } = useContext(AppContext);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [cacheUsado, setCacheUsado] = useState(false);
  const [desvanecer, setDesvanecer] = useState(false);

  // carga empresas con cache seguro
  const fetchEmpresas = async (usarCache = true) => {
    const cacheKey = "empresasCache";
    const EXPIRACION_MS = 5 * 60 * 1000;


    try {
      if (usarCache) {
        const cache = getSafeCache(cacheKey);
        if (cache && cache.timestamp && cache.data) {
          const expirado = Date.now() - cache.timestamp > EXPIRACION_MS;
          if (!expirado) {
            const validado = EmpresaSchema.safeParse(cache.data);
            if (validado.success) {
              setEmpresas(validado.data);
              setCacheUsado(true);
              setLoading(false);
              setDesvanecer(false);
              setTimeout(() => setDesvanecer(true), 2500);
              setTimeout(() => setCacheUsado(false), 3200);
            } else {
              localStorage.removeItem(cacheKey);
            }
          } else {
            localStorage.removeItem(cacheKey);
          }
        }
      }

      const { data } = await axios.get(`${backendUrl}/api/empresa/activas`);
      const lista =
        data?.empresas || data?.data || (Array.isArray(data) ? data : null);
      if (Array.isArray(lista)) {
        const validado = EmpresaSchema.safeParse(lista);
        if (validado.success) {
          setEmpresas(validado.data);
          setSafeCache(cacheKey, validado.data);          
        } else {
          console.warn("Datos backend invalidos:", validado.error);
        }
      } else {
        console.error("Estructura inesperada del backend:", data);
        toast.error("Error al cargar empresas (estructura inesperada)");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const filtradas = empresas.filter((e) =>
  e.nombre?.toLowerCase().includes(filtro.toLowerCase())
);

 
  return (
    <div className="bg-gradient-to-br from-white via-green-50 to-amber-100 min-h-screen py-10 px-6">
      <div className="max-w-6xl mx-auto">

        {/* encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-4 sm:mb-0">
            Empresas Registradas
          </h1>
          <Input
            placeholder="Buscar empresa..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="sm:w-72"
          />
        </div>

        {/* aviso cache */}
        {cacheUsado && (
          <div
            className={`flex justify-center items-center gap-2 mb-6 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 shadow-sm transition-all duration-500 ${
              desvanecer ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
            }`}
          >
            <RefreshCcw className="w-4 h-4 animate-spin-slow text-emerald-600/80" />
            <span className="italic font-medium">
              Datos cargados rapidamente Actualizando lista de empresas...
            </span>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Cargando empresas...</p>
        ) : filtradas.length === 0 ? (
          <p className="text-center text-gray-600">
            No se encontraron empresas.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtradas.map((e) => (
              <Card
                key={e.id}
                className="border border-emerald-200 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:scale-[1.02] transition duration-200"
              >
                <CardContent className="p-5 flex flex-col items-center text-center">
               <img
                  loading="lazy"
                  src={assets.logoempresas}
                  alt={e.nombre}
                  className="w-full h-48 object-cover rounded-lg mb-4 border border-emerald-100 shadow-sm transition-transform duration-300 hover:scale-[1.03]"
                />
                  <h2 className="text-lg font-semibold text-gray-800">{e.nombre}</h2>
                  <p className="text-sm text-gray-500">
                    {e.nombre_fantasia || "Sin nombre comercial"}
                  </p>
                  <p className="mt-2 text-emerald-700 font-medium">
                    {e.tipo_empresa || "Categoria no especificada"}
                  </p>
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {e.descripcion || "Esta empresa aun no tiene descripcion."}
                  </p>

                  <Link to={`/empresa/${e.id}`} className="mt-4 w-full">
                    <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                      Ver Detalles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
