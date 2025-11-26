import { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import axios from "axios";
import { z } from "zod";
import { RefreshCcw, Loader2 } from "lucide-react";
import { getSafeCache, setSafeCache } from "../../helpers/safeCache.js";


// esquema de validacion zod
const ProductoSchema = z.array(
  z.object({
    id: z.string().uuid(),
    nombre: z.string(),
    descripcion: z.string().nullable().optional(),
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
  })
);

export const MisProductos = () => {
  const { backendUrl } = useContext(AppContext);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [productoEditando, setProductoEditando] = useState(null);
  const [cacheUsado, setCacheUsado] = useState(false);
  const [desvanecer, setDesvanecer] = useState(false);

  const enviandoRef = useRef(false);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    archivo: null,
    stock_inicial: "",
    stock_minimo: "",
    descuento: "",
  });

  // cargar productos con cache y validacion
  const fetchProductos = async (usarCache = true) => {
    const cacheKey = "misProductosCache";
    const EXPIRACION_MS = 5 * 60 * 1000; // 5 minutos

    try {
      if (usarCache) {
        const cache = getSafeCache(cacheKey);  // cache seguro, sin dejar al usuario modificarlo

        if (cache && cache.timestamp && Array.isArray(cache.data)) {
          const expirado = Date.now() - cache.timestamp > EXPIRACION_MS;

          if (!expirado) {
            const validado = ProductoSchema.safeParse(cache.data);
            if (validado.success) {
              // usa los datos validados del cache
              setProductos(validado.data);
              setCacheUsado(true);
              setLoading(false);

              // animación visual suave de “cargando desde cache”
              setDesvanecer(false);
              setTimeout(() => setDesvanecer(true), 2500);
              setTimeout(() => setCacheUsado(false), 3200);
            } else {
              console.warn("Datos del cache inválidos, limpiando...");
              localStorage.removeItem(cacheKey);
            }
          } else {
            console.log("Cache expirado, borrando...");
            localStorage.removeItem(cacheKey);
          }
        }
      }

    
      const { data } = await axios.get(`${backendUrl}/api/productos/mis-productos`, {
        withCredentials: true,
      });

      if (data.success) {
        const validado = ProductoSchema.safeParse(data.data);
        if (validado.success) {
          setProductos(validado.data);
          setSafeCache(cacheKey, validado.data); // guarda de forma segura
        } else {
          console.warn("Datos backend inválidos:", validado.error);
        }
      } else {
        toast.error("Error al cargar productos");
      }
    } catch (error) {
      console.error("Error de conexión o cache:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Bloquea muchos clicks
    if (enviandoRef.current) return;
    enviandoRef.current = true;

    setLoading(true);

    try {
      const datosActualizados = {};

      for (const [key, value] of Object.entries(form)) {
        if (value !== "" && value !== null) datosActualizados[key] = value;
      }

      if (editMode && productoEditando) {
        await axios.patch(
          `${backendUrl}/api/productos/editar/${productoEditando.id}`,
          datosActualizados,
          { withCredentials: true }
        );
        toast.success("Producto actualizado correctamente");
      } else {
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => {
          if (v !== "" && v !== null) formData.append(k, v);
        });

        await axios.post(`${backendUrl}/api/productos/crear`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Producto creado con éxito");
      }

      setShowForm(false);
      setEditMode(false);
      setProductoEditando(null);

      setForm({
        nombre: "",
        descripcion: "",
        precio: "",
        archivo: null,
        stock_inicial: "",
        stock_minimo: "",
        descuento: "",
      });

      await fetchProductos(false);
    } catch (error) {
      console.error("Error al guardar producto:", error);
      toast.error("Error al guardar el producto");
    } finally {
      setLoading(false);
      enviandoRef.current = false; // permite nuevo envio recien aca
    }
  };

  const handleEdit = (producto) => {
    setEditMode(true);
    setShowForm(true);
    setProductoEditando(producto);
    setForm({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio || "",
      archivo: null,
      stock_inicial: producto.inventario?.stock_actual || "",
      stock_minimo: producto.inventario?.stock_minimo || "",
      descuento: producto.inventario?.descuento || "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Seguro que deseas eliminar este producto")) return;
    try {
      await axios.patch(`${backendUrl}/api/productos/editar/${id}/desactivar`, {}, { withCredentials: true });
      toast.info("Producto eliminado correctamente");
      fetchProductos(false);
    } catch {
      toast.error("Error al eliminar el producto");
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-amber-100 py-10 px-6">
      <div className="max-w-6xl mx-auto">

        {/* encabezado */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-green-700">Mis Productos</h1>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Buscar producto..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-60"
            />
            <Button
              onClick={() => {
                setShowForm(true);
                setEditMode(false);
                setForm({
                  nombre: "",
                  descripcion: "",
                  precio: "",
                  archivo: null,
                  stock_inicial: "",
                  stock_minimo: "",
                  descuento: "",
                });
              }}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              + Nuevo Producto
            </Button>
          </div>
        </div>

        {/* aviso de cache debajo del encabezado */}
        {cacheUsado && (
          <div
            className={`flex justify-center items-center gap-2 mb-6 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 shadow-sm transition-all duration-500 ${
              desvanecer ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
            }`}
          >
            <RefreshCcw className="w-4 h-4 animate-spin-slow text-emerald-600/80" />
            <span className="italic font-medium">
              Datos cargados rapidamente Actualizando lista de productos...
            </span>
          </div>
        )}

        {showForm && (
          <Card className="mb-8 border border-gray-200 shadow-md">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-green-700 mb-4">
                {editMode ? "Editar Producto" : "Agregar Nuevo Producto"}
              </h2>

              <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                
                {/* Nombre */}
                <div>
                  <label className="block font-medium mb-1">Nombre</label>
                  <Input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Descripcion */}
                <div>
                  <label className="block font-medium mb-1">Descripción</label>
                  <Textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Precio */}
                <div>
                  <label className="block font-medium mb-1">Precio</label>
                  <Input
                    name="precio"
                    type="number"
                    step="0.01"
                    value={form.precio}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Inventario */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Stock inicial</label>
                    <Input
                      name="stock_inicial"
                      type="number"
                      value={form.stock_inicial}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Stock mínimo</label>
                    <Input
                      name="stock_minimo"
                      type="number"
                      value={form.stock_minimo}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Descuento (%)</label>
                    <Input
                      name="descuento"
                      type="number"
                      step="0.01"
                      value={form.descuento}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Imagen */}
                <div>
                  <label className="block font-medium mb-1">Imagen del producto</label>
                  <Input
                    name="archivo"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="border-gray-300"
                  />
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-2">

                  {/* Cancelar */}
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setShowForm(false);
                      setEditMode(false);
                    }}
                    className={`text-black ${
                      loading
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  >
                    Cancelar
                  </Button>

                  {/* Guardar / Crear  */}
                 <Button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center justify-center gap-2 text-white ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                  {loading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {loading
                    ? editMode
                      ? "Guardando..."
                      : "Creando..."
                    : editMode
                    ? "Guardar Cambios"
                    : "Crear Producto"}
                </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Cargando productos...</p>
        ) : productosFiltrados.length === 0 ? (
          <p className="text-center text-gray-600">Aun no has agregado productos</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((p) => (
              <Card
                key={p.id}
                className="shadow-lg border border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-transform duration-300"
              >
                <CardContent className="p-4">
                  <img
                    src={p.url_imagen_principal}
                    alt={p.nombre}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-800">{p.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-2">{p.descripcion}</p>
                  <p className="text-green-700 font-semibold mb-2">${p.precio}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Stock {p.inventario?.stock_actual ?? 0} | Minimo {p.inventario?.stock_minimo ?? 0}
                  </p>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => handleEdit(p)}
                      className="bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-600 text-white hover:bg-red-700 text-sm"
                    >
                      Eliminar
                    </Button>
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
