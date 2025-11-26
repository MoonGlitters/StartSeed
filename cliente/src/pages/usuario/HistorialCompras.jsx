import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import {
  ShoppingBag,
  Clock3,
  CheckCircle,
  XCircle,
  DollarSign,
  Package,
  MapPin,
  Truck,
  RotateCcw,
} from "lucide-react";

export const HistorialCompras = () => {
  const { backendUrl } = useContext(AppContext);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fasePorCompra, setFasePorCompra] = useState(() => {
    const guardado = localStorage.getItem("fasePorCompra");
    return guardado ? JSON.parse(guardado) : {};
  });

  // cargar historial
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/compras/historial`, {
          withCredentials: true,
        });
        const comprasData = data?.data || [];
        setCompras(comprasData);

        // inicializar fases (si no existen)
        setFasePorCompra((prev) => {
          const nuevo = { ...prev };
          comprasData.forEach((c) => {
            if (!nuevo[c.id]) nuevo[c.id] = 1; // siempre empieza en fase 1
          });
          return nuevo;
        });
      } catch (err) {
        console.error("Error cargando historial:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [backendUrl]);

  // simular avance de fase (cada minuto)
  useEffect(() => {
    const interval = setInterval(() => {
      setFasePorCompra((prev) => {
        const nuevo = { ...prev };
        Object.keys(nuevo).forEach((id) => {
          if (nuevo[id] < 4) nuevo[id] += 1;
        });
        localStorage.setItem("fasePorCompra", JSON.stringify(nuevo));
        return nuevo;
      });
    }, 60000); // cada 1 minuto
    return () => clearInterval(interval);
  }, []);

  const formatFecha = (iso) => {
    const fecha = new Date(iso);
    return fecha.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBadgeColor = (estado) => {
    switch (estado.toLowerCase()) {
      case "pagado":
        return "text-green-700 bg-green-100 border-green-300";
      case "pendiente":
        return "text-amber-700 bg-amber-100 border-amber-300";
      case "rechazado":
      case "cancelado":
        return "text-red-700 bg-red-100 border-red-300";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado.toLowerCase()) {
      case "pagado":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pendiente":
        return <Clock3 className="w-4 h-4 text-amber-600" />;
      default:
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const handleReiniciar = () => {
    localStorage.removeItem("fasePorCompra"); // por ahora ocmentado, solo es para pruebas
    window.location.reload();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* encabezado principal */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-800">Historial de Compras</h1>
        </div>
        {/* boton de recarga 
        <button
          onClick={handleReiniciar}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-md hover:bg-emerald-100 transition"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar progreso
        </button> */}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">
          Cargando historial...
        </p>
      ) : compras.length === 0 ? (
        <div className="text-center bg-gray-50 py-12 rounded-xl border border-gray-200 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-lg">
            No tienes compras registradas todavía.
          </p>
        </div>
      ) : (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {compras.map((compra) => {
          const pagoConfirmado =
              compra.estado?.toLowerCase() === "pagado" &&
              compra.status_pago?.toLowerCase() === "approved";
          const faseActual = pagoConfirmado ? (fasePorCompra[compra.id] || 1) : 0;

            return (
              <motion.div
                key={compra.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition bg-white p-5"
              >
                {/* encabezado de compra */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
                  <div>
                    <h2 className="font-semibold text-gray-800 text-lg">
                      Compra #{compra.id.slice(0, 8)}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 gap-1">
                      <Clock3 className="w-4 h-4 text-gray-400" />
                      {formatFecha(compra.createdAt)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border font-medium ${getBadgeColor(
                        compra.estado
                      )}`}
                    >
                      {getEstadoIcon(compra.estado)} {compra.estado}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border font-medium ${
                        compra.status_pago === "approved"
                          ? "text-green-700 bg-green-100 border-green-300"
                          : compra.status_pago === "Pendiente"
                          ? "text-amber-700 bg-amber-100 border-amber-300"
                          : "text-gray-700 bg-gray-100 border-gray-300"
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      {compra.status_pago === "approved"
                        ? "Pago aprobado"
                        : compra.status_pago}
                    </span>
                  </div>
                </div>

                {/* detalles del pedido */}
                <div className="border-t border-gray-100 mt-3 pt-3">
                  <ul className="divide-y divide-gray-100">
                    {compra.detalles?.map((d, i) => (
                      <li
                        key={i}
                        className="py-2 flex justify-between items-center text-sm"
                      >
                        <div className="flex items-center gap-2 text-gray-700">
                          <Package className="w-4 h-4 text-gray-400" />
                          {d.nombre_producto} × {d.cantidad_comprada}
                        </div>
                        <span className="font-medium text-gray-800">
                          ${Number(d.precio_unitario_compra).toLocaleString("es-CL")}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* total */}
                  <div className="mt-4 flex justify-between items-center font-semibold text-gray-800">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-700" />
                      <span>Total</span>
                    </div>
                    <span className="text-green-700 text-lg">
                      ${Number(compra.total_compra).toLocaleString("es-CL")}
                    </span>
                  </div>

                  {/* direccion */}
                  {compra.direccion_calle &&
                    compra.direccion_comuna &&
                    compra.direccion_region && (
                      <div className="mt-4 border-t border-gray-100 pt-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          Dirección usada en la compra
                        </h4>
                        <p className="text-sm text-gray-600 leading-snug">
                          {compra.direccion_calle}{" "}
                          {compra.direccion_numero && `#${compra.direccion_numero}`},{" "}
                          {compra.direccion_villa && `${compra.direccion_villa}, `}
                          {compra.direccion_comuna}, {compra.direccion_region}
                        </p>
                        {compra.direccion_referencia && (
                          <p className="text-xs text-gray-500 italic mt-1">
                            Referencia: {compra.direccion_referencia}
                          </p>
                        )}
                      </div>
                    )}

                  {/* línea de progreso */}
                  <div className="mt-8">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600" />
                      Seguimiento del pedido
                    </h4>

                    <div className="relative flex justify-between items-center mb-3">
                      {/* linea base */}
                      <div className="absolute top-1/2 left-0 w-full h-[6px] bg-gray-200 rounded-full -translate-y-1/2" />

                      {/* linea verde que llega desde el primer icono */}
                    <div
                      className={`absolute top-1/2 left-0 h-[6px] rounded-full -translate-y-1/2 transition-all duration-500 ${
                        faseActual === 0 ? "bg-gray-300" : "bg-emerald-500"
                      }`}
                      style={{
                        width:
                          faseActual === 0
                            ? "0%"
                            : faseActual === 1
                            ? "8%"
                            : faseActual === 2
                            ? "33%"
                            : faseActual === 3
                            ? "66%"
                            : "100%",
                      }}
                    />
                      {[
                        { label: "Compra realizada", icon: <ShoppingBag /> },
                        { label: "Empaquetando", icon: <Package /> },
                        { label: "En camino", icon: <Truck /> },
                        { label: "Entregado", icon: <CheckCircle /> },
                      ].map((faseObj, i) => {
                        const faseNumero = i + 1;
                        const completado = faseNumero < faseActual;
                        const actual = faseNumero === faseActual;

                        // Si aún no hay pago confirmado, todos grises
                        if (faseActual === 0) {
                          return (
                            <div
                              key={i}
                              className="relative z-10 flex flex-col items-center text-xs text-gray-400"
                            >
                              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-gray-50 border-gray-300">
                                {faseObj.icon}
                              </div>
                              <span className="mt-1 text-center w-20">{faseObj.label}</span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={i}
                            className={`relative z-10 flex flex-col items-center text-xs ${
                              completado || actual
                                ? "text-emerald-700 font-semibold"
                                : "text-gray-400"
                            }`}
                          >
                            <div
                              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                                completado
                                  ? "bg-emerald-100 border-emerald-500"
                                  : actual
                                  ? "bg-emerald-500 border-emerald-600 text-white shadow-lg"
                                  : "bg-gray-50 border-gray-300"
                              }`}
                            >
                              {faseObj.icon}
                            </div>
                            <span className="mt-1 text-center w-20">{faseObj.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* texto descriptivo */}
                    <div className="text-sm text-gray-600 text-center">
                      {faseActual === 1 && "Tu compra fue registrada correctamente."}
                      {faseActual === 2 && "Estamos preparando y empaquetando tu pedido."}
                      {faseActual === 3 && "Tu pedido está en camino hacia tu dirección."}
                      {faseActual === 4 && (
                        <span className="text-emerald-600 font-medium">
                          ¡Tu pedido fue entregado exitosamente!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};
