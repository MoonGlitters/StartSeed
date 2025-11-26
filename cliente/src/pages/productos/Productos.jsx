import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { RefreshCcw } from "lucide-react";
import { getSafeCache, setSafeCache } from "../../helpers/safeCache.js";

// Esquema de validacion Zod
const ProductoSchema = z.array(
  z.object({
    id: z.string().uuid(),
    nombre: z.string(),
    descripcion: z.string().nullable().optional(),
    precio: z.coerce.number(),
    url_imagen_principal: z.string().nullable().optional(),
  })
);

export const Productos = () => {
  const { backendUrl } = useContext(AppContext);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [desvanecer, setDesvanecer] = useState(false);

  // Formateo de precio CLP con IVA incluido
  const formatPriceCLP = (basePrice) => {
    const precio = parseFloat(basePrice);
    if (isNaN(precio)) return "—";
    const precioConIVA = precio * 1.19;
    return precioConIVA.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    });
  };

  // Carga productos con cache seguro y validacion
  const fetchAll = async (usarCache = true) => {
    const cacheKey = "productosCache";
    const EXPIRACION_MS = 5 * 60 * 1000;

    try {
      if (usarCache) {
        const cache = getSafeCache(cacheKey);
        if (cache && cache.timestamp && Array.isArray(cache.data)) {
          const expirado = Date.now() - cache.timestamp > EXPIRACION_MS;

          if (!expirado) {
            const validado = ProductoSchema.safeParse(cache.data);
            if (validado.success) {
              setItems(validado.data);
              setLoading(false);
              setMostrarAviso(true);
              setDesvanecer(false);
              setTimeout(() => setDesvanecer(true), 2500);
              setTimeout(() => setMostrarAviso(false), 3200);
            } else {
              localStorage.removeItem(cacheKey);
            }
          } else {
            localStorage.removeItem(cacheKey);
          }
        }
      }

      const { data } = await axios.get(`${backendUrl}/api/productos`);
      if (data?.success !== false && Array.isArray(data?.data)) {
        const validado = ProductoSchema.safeParse(data.data);
        if (validado.success) {
          setItems(validado.data);
          setSafeCache(cacheKey, validado.data);
        } else {
          console.warn("Datos backend inválidos:", validado.error);
        }
      } else {
        toast.error("Error al cargar productos");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      toast.error("Error de conexión al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = items.filter((p) =>
    p.nombre.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="bg-gradient-natural px-6 py-10 min-h-screen">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-4 sm:mb-0">
            Productos
          </h1>
          <Input
            placeholder="Buscar producto..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="sm:w-72"
          />
        </div>

        {mostrarAviso && (
          <div
            className={`flex justify-center items-center gap-2 mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 shadow-sm transition-all duration-500 ${
              desvanecer ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
            }`}
          >
            <RefreshCcw className="w-4 h-4 animate-spin-slow text-emerald-600/80" />
            <span className="italic font-medium">
              Datos cargados rápidamente. Actualizando catálogo...
            </span>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Cargando productos...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-600">
            No se encontraron productos.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <Card
                key={p.id}
                className="border border-emerald-200 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:scale-[1.02] transition duration-300"
              >
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <Link to={`/producto/${p.id}`} className="w-full">
                    <img
                      src={
                        p.url_imagen_principal ||
                        "https://placehold.co/300x200?text=Sin+imagen"
                      }
                      alt={p.nombre}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  </Link>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {p.nombre}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {p.descripcion || "Sin descripción disponible"}
                  </p>
                  <p className="mt-1 text-amber-600 font-bold text-lg">
                    {formatPriceCLP(p.precio)}{" "}
                    <span className="text-xs text-gray-500">(IVA incluido)</span>
                  </p>
                  <div className="mt-4 w-full">
                    <Link to={`/producto/${p.id}`} className="flex-1">
                      <Button className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                        Ver más
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
