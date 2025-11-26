import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { z } from "zod";
import { RefreshCcw } from "lucide-react";
import { getSafeCache, setSafeCache } from "../../helpers/safeCache.js";
import { ComentariosProducto } from "../../components/ComentariosProducto.jsx";
import { assets } from "@/assets/assets.js"; 


// Esquema de validacion Zod
const ProductoDetalleSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  precio: z.coerce.number(),
  url_imagen_principal: z.string().nullable().optional(),
  inventario: z
    .object({
      stock_actual: z.coerce.number().optional(),
    })
    .nullable()
    .optional(),
  empresa: z
    .object({
      id: z.string().uuid(),
      nombre: z.string().optional(),
      nombre_fantasia: z.string().optional(),
      direccion_texto: z.string().nullable().optional(),
      telefono: z.string().nullable().optional(),
      tipo_empresa: z.string().nullable().optional(),
      rut: z.string().nullable().optional(),
      slug: z.string().optional(),
      descripcion: z.string().nullable().optional(),
      estado: z.string().optional(),
    })
    .nullable()
    .optional(),
});

export const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, refreshCartCount } = useContext(AppContext);

  const [prod, setProd] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [desvanecer, setDesvanecer] = useState(false);

  // formato CLP con IVA
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

  const fetchDetail = async (usarCache = true) => {
    const cacheKey = `productoCache_${id}`;
    const EXPIRACION_MS = 5 * 60 * 1000;

    try {
      if (usarCache) {
        const cache = getSafeCache(cacheKey);
        if (cache && cache.timestamp && cache.data) {
          const expirado = Date.now() - cache.timestamp > EXPIRACION_MS;
          if (!expirado) {
            const validado = ProductoDetalleSchema.safeParse(cache.data);
            if (validado.success) {
              setProd(validado.data);
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

      const { data } = await axios.get(`${backendUrl}/api/productos/${id}`);
      const validado = ProductoDetalleSchema.safeParse(data?.data);

      if (validado.success) {
        setProd(validado.data);
        setSafeCache(cacheKey, validado.data);
      } else {
        toast.error("Error al validar datos del producto");
      }
    } catch (error) {
      console.error("Error al cargar producto:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!prod?.inventario?.stock_actual) {
      toast.error("Este producto no tiene stock disponible");
      return;
    }

    if (cantidad > prod.inventario.stock_actual) {
      toast.warn("No hay suficiente stock disponible");
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/productos/${id}`);
      const stockActualizado = data?.data?.inventario?.stock_actual ?? 0;

      if (stockActualizado < cantidad) {
        toast.warn("El stock cambió, ajusta la cantidad");
        return;
      }

      await axios.post(
        `${backendUrl}/api/carrito/items`,
        { id_producto: id, cantidad },
        { withCredentials: true }
      );

      toast.success("Producto agregado al carrito");
      refreshCartCount();
    } catch (e) {
      const msg = e?.response?.data?.message || "No se pudo agregar al carrito";
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading)
    return (
      <div className="bg-gradient-natural flex justify-center items-center text-gray-700 h-screen">
        Cargando producto...
      </div>
    );

  if (!prod)
    return (
      <div className="bg-gradient-natural flex justify-center items-center text-gray-700 h-screen">
        No se encontró el producto.
      </div>
    );

  const precioFinal = formatPriceCLP(prod.precio);

  return (
    <div className="bg-gradient-natural min-h-screen flex justify-center items-center py-10 px-6">
      <div className="max-w-6xl w-full bg-white/90 rounded-2xl shadow-2xl backdrop-blur-sm grid md:grid-cols-2 gap-10 p-8 md:p-12 animate-fadeIn relative">
        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold shadow-md hover:from-emerald-700 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.03] active:scale-95"
        >
          ← Volver
        </button>

        {/* Aviso cache */}
        {mostrarAviso && (
          <div
            className={`absolute top-4 right-6 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 shadow-sm transition-all duration-500 ${
              desvanecer ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
            }`}
          >
            <RefreshCcw className="w-4 h-4 animate-spin-slow text-emerald-600/80" />
            <span className="italic font-medium">
              Mostrando datos guardados. Actualizando información...
            </span>
          </div>
        )}

        {/* Imagen principal*/}
        <div className="flex justify-center items-center mt-4">
          <img
            src={prod.url_imagen_principal}
            alt={prod.nombre}
            className="w-full max-w-md h-[400px] object-cover rounded-xl shadow-md hover:scale-[1.02] transition-transform duration-300 border border-emerald-100"
          />
        </div>

        {/* Detalles del producto */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">{prod.nombre}</h1>
          <p className="text-gray-700 mb-4 text-lg leading-relaxed">{prod.descripcion}</p>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-3xl font-semibold text-amber-600">{precioFinal}</p>
              <p className="text-xs text-gray-500">(IVA incluido)</p>
            </div>
            {prod.inventario?.stock_actual !== undefined && (
              <p className="text-sm text-gray-600">
                Stock disponible:{" "}
                <span className="font-semibold text-gray-800">
                  {prod.inventario.stock_actual}
                </span>
              </p>
            )}
          </div>

          {/* Agregar al carrito */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl shadow-inner px-5 py-6 mt-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label htmlFor="cantidad" className="text-gray-600 font-medium whitespace-nowrap">
                  Cantidad:
                </label>
                <Input
                  id="cantidad"
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
                  className="w-24 border-emerald-300 focus:ring-emerald-500"
                />
              </div>

              <Button
                onClick={addToCart}
                className="w-full sm:w-auto px-8 py-3 rounded-lg text-white text-base font-semibold shadow-md bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.03] active:scale-95"
              >
                <div className="flex items-center justify-center gap-2">
                  <img
                    src="https://img.icons8.com/ios-filled/24/ffffff/add-shopping-cart.png"
                    alt="carrito"
                    className="w-5 h-5"
                  />
                  Agregar al Carrito
                </div>
              </Button>
            </div>
          </div>

          {/* Info de la empresa */}
          {prod.empresa && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                <img
                  src={assets.logoempresas}
                  alt="Empresa"
                  className="w-5 h-5"
                />
                Información de la empresa
              </h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-semibold text-emerald-700">Nombre Fantasía: </span>
                  {prod.empresa.nombre_fantasia}
                </p>
                <p>
                  <span className="font-semibold text-emerald-700">Razón Social: </span>
                  {prod.empresa.nombre}
                </p>
                <p>
                  <span className="font-semibold text-emerald-700">Tipo: </span>
                  {prod.empresa.tipo_empresa}
                </p>
                <p>
                  <span className="font-semibold text-emerald-700">Dirección: </span>
                  {prod.empresa.direccion_texto}
                </p>
                <p>
                  <span className="text-emerald-700 font-medium">
                    {prod.empresa.telefono || "No disponible"}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comentarios */}
      <div className="w-full flex justify-center mt-10">
        <ComentariosProducto id_producto={prod.id} />
      </div>
    </div>
  );
};
