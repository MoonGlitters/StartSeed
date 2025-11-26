import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext.jsx";
import { Button } from "@/components/ui/button";
import { assets } from "../../assets/assets.js";

export const EmpresaProductos = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [productos, setProductos] = useState([]);
  const [empresaNombre, setEmpresaNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  // formato CLP + IVA
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

  const fetchProductos = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/productos/por-empresa/${id}`);
      const data = response.data;

      if (!data.success) {
        setMensaje(data.message || "No se encontraron productos para esta empresa.");
        setProductos([]);
        return;
      }

      setProductos(data.data || []);
      const nombre = data.message?.match(/empresa (.+) obtenidos/)?.[1];
      setEmpresaNombre(nombre || "la empresa");

      if (data.data.length === 0) {
        setMensaje("Esta empresa aún no tiene productos publicados.");
      } else {
        setMensaje("");
      }
    } catch (error) {
      console.error("Error al obtener productos:", error);
      if (error.response?.status === 404) {
        setMensaje("No se encontró la empresa.");
        toast.warn("No se encontró la empresa.");
      } else {
        setMensaje("Error al conectar con el servidor.");
        toast.error("Error al conectar con el servidor.");
      }
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [id]);

  if (loading)
    return (
      <div className="bg-gradient-natural flex justify-center items-center text-gray-700 h-screen">
        Cargando productos...
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-white via-green-50 to-amber-100 min-h-screen flex flex-col items-center py-10 px-6">
      <div className="max-w-6xl w-full bg-white/90 rounded-2xl shadow-2xl backdrop-blur-sm p-8 md:p-12 animate-fadeIn relative">
        {/* Boton volver */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold shadow-md hover:from-emerald-700 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.03] active:scale-95"
        >
          ← Volver
        </button>

        {/* Titulo */}
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-10 text-center">
          Productos de {empresaNombre}
        </h1>

        {mensaje && (
          <p className="text-center text-gray-600 text-lg mb-6">{mensaje}</p>
        )}

        {/* Grid de productos */}
        {productos.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white/80 border border-green-100 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
              >
                <img
                  src={producto.url_imagen_principal || assets.logoproducto}
                  alt={producto.nombre}
                  className="w-full h-56 object-cover rounded-t-2xl"
                />

                <div className="flex flex-col flex-grow justify-between p-5">
                  <div>
                    <h2 className="text-xl font-semibold text-emerald-700 mb-1">
                      {producto.nombre}
                    </h2>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {producto.descripcion || "Sin descripción disponible"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <span className="text-lg font-bold text-amber-600">
                      {formatPriceCLP(producto.precio)} <span className="text-xs text-gray-500">(IVA incluido)</span>
                    </span>

                    {producto.inventario?.stock_actual !== undefined && (
                      <span
                        className={`text-sm font-medium ${
                          producto.inventario.stock_actual > 0
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {producto.inventario.stock_actual > 0
                          ? `Stock disponible: ${producto.inventario.stock_actual}`
                          : "Sin stock disponible"}
                      </span>
                    )}

                    <Button
                      onClick={() => navigate(`/producto/${producto.id}`)}
                      className="bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold hover:from-green-700 hover:to-emerald-600 transition-all duration-300 mt-2"
                    >
                      Ver detalle
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
