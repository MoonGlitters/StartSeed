import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { z } from "zod";
import { RefreshCcw } from "lucide-react";
import { getSafeCache, setSafeCache } from "../../helpers/safeCache.js";

// esquema de validacion
const InventarioSchema = z.array(
  z.object({
    id: z.string().uuid(),
    nombre: z.string(),
    precio: z.coerce.number(),
    url_imagen_principal: z.string().nullable().optional(),
    inventario: z
      .object({
        stock_actual: z.coerce.number().optional(),
        stock_minimo: z.coerce.number().optional(),
        descuento: z.coerce.number().optional(),
      })
      .nullable()
      .optional(),
    edit: z.object({
      stock_actual: z.union([z.string(), z.number()]),
      stock_minimo: z.union([z.string(), z.number()]),
      descuento: z.union([z.string(), z.number()]),
    }),
  })
);

export const Inventario = () => {
  const { backendUrl } = useContext(AppContext);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [guardandoId, setGuardandoId] = useState(null);
  const [estadoBoton, setEstadoBoton] = useState({});
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [desvanecer, setDesvanecer] = useState(false);

  // carga inventario con validacion y cache seguro
  const fetchInventario = async (usarCache = true) => {
    const cacheKey = "inventarioCache";
    const EXPIRACION_MS = 10 * 60 * 1000;

    try {
      if (usarCache) {
        const cache = getSafeCache(cacheKey);
        if (cache && cache.timestamp && cache.data) {
          const expirado = Date.now() - cache.timestamp > EXPIRACION_MS;
          if (!expirado) {
            const validado = InventarioSchema.safeParse(cache.data);
            if (validado.success) {
              setProductos(validado.data);
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

      const { data } = await axios.get(`${backendUrl}/api/productos/mis-productos`, {
        withCredentials: true,
      });

      if (data.success) {
        const productosConEdit = data.data.map((p) => ({
          ...p,
          edit: {
            stock_actual: p.inventario?.stock_actual || 0,
            stock_minimo: p.inventario?.stock_minimo || 0,
            descuento: p.inventario?.descuento || 0,
          },
        }));

        const validado = InventarioSchema.safeParse(productosConEdit);
        if (validado.success) {
          setProductos(validado.data);
          setSafeCache(cacheKey, validado.data);
        } else {
          console.warn("Datos backend invalidos:", validado.error);
        }
      } else {
        toast.error("Error al cargar inventario");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexion al cargar inventario");
    } finally {
      setLoading(false);
    }
  };

  // actualiza inventario
  const actualizarInventario = async (producto) => {
    setGuardandoId(producto.id);
    setEstadoBoton((prev) => ({ ...prev, [producto.id]: "guardando" }));

    try {
      await axios.patch(
        `${backendUrl}/api/productos/editar/${producto.id}`,
        {
          stock_actual: producto.edit.stock_actual,
          stock_minimo: producto.edit.stock_minimo,
          descuento: producto.edit.descuento,
        },
        { withCredentials: true }
      );

      toast.success(`Inventario de "${producto.nombre}" actualizado`);
      setEstadoBoton((prev) => ({ ...prev, [producto.id]: "guardado" }));

      const nuevos = productos.map((p) =>
        p.id === producto.id ? producto : p
      );

      const validado = InventarioSchema.safeParse(nuevos);
      if (validado.success) {
        setProductos(validado.data);
        setSafeCache("inventarioCache", validado.data);
      }

      setTimeout(() => {
        setEstadoBoton((prev) => ({ ...prev, [producto.id]: null }));
        setGuardandoId(null);
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar inventario");
      setGuardandoId(null);
      setEstadoBoton((prev) => ({ ...prev, [producto.id]: null }));
    }
  };

  // manejar cambios en los inputs
  const handleChange = (id, campo, valor) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, edit: { ...p.edit, [campo]: valor } } : p
      )
    );
  };

  useEffect(() => {
    fetchInventario();
  }, []);

  const filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-amber-100 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-700">Inventario</h1>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Buscar producto..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-60"
            />
            <Button
              onClick={() => fetchInventario(false)}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Recargar
            </Button>
          </div>
        </div>

        {mostrarAviso && (
          <div
            className={`flex justify-center items-center gap-2 mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 shadow-sm transition-all duration-500 ${
              desvanecer ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
            }`}
          >
            <RefreshCcw className="w-4 h-4 animate-spin-slow text-emerald-600/80" />
            <span className="italic font-medium">
              Datos cargados rapidamente Actualizando inventario...
            </span>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Cargando inventario...</p>
        ) : filtrados.length === 0 ? (
          <p className="text-center text-gray-600">
            No hay productos en tu inventario.
          </p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-green-100 text-green-800 font-semibold">
                <tr>
                  <th className="p-3 text-left">Imagen</th>
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Stock</th>
                  <th className="p-3 text-left">Stock minimo</th>
                  <th className="p-3 text-left">Precio</th>
                  <th className="p-3 text-left">Descuento (%)</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">
                      <img
                        src={
                          p.url_imagen_principal ||
                          "https://placehold.co/80x80?text=Sin+img"
                        }
                        alt={p.nombre}
                        className="w-14 h-14 object-cover rounded-md"
                      />
                    </td>
                    <td className="p-3">{p.nombre}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-20 border border-gray-300 rounded p-1"
                        value={p.edit.stock_actual}
                        onChange={(e) =>
                          handleChange(p.id, "stock_actual", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-20 border border-gray-300 rounded p-1"
                        value={p.edit.stock_minimo}
                        onChange={(e) =>
                          handleChange(p.id, "stock_minimo", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-3">${p.precio}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-20 border border-gray-300 rounded p-1"
                        value={p.edit.descuento}
                        onChange={(e) =>
                          handleChange(p.id, "descuento", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        disabled={guardandoId === p.id}
                        onClick={() => actualizarInventario(p)}
                        className={`text-xs text-white ${
                          estadoBoton[p.id] === "guardando"
                            ? "bg-yellow-500"
                            : estadoBoton[p.id] === "guardado"
                            ? "bg-green-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        {estadoBoton[p.id] === "guardando"
                          ? "Guardando..."
                          : estadoBoton[p.id] === "guardado"
                          ? "Guardado ✓"
                          : "Editar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
