import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import { CompanyContext } from "../../context/CompanyContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Loader2,
  DollarSign,
  Wallet,
  TrendingUp,
  BarChart3,
  PiggyBank,
  Clock,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const DashboardEmpresa = () => {
  const { backendUrl } = useContext(AppContext);
  const { empresaUsuario, loadingEmpresa } = useContext(CompanyContext);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const [ganancias, setGanancias] = useState(null);
  const [loadingGanancias, setLoadingGanancias] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loadingSolicitud, setLoadingSolicitud] = useState(false);

  // Estado para datos bancarios
  const [cuenta, setCuenta] = useState({
    banco_nombre: "",
    tipo_cuenta: "",
    numero_cuenta: "",
    rut_titular: "",
    nombre_titular: "",
  });

  const [loadingCuenta, setLoadingCuenta] = useState(false);
  const [loadingGuardar, setLoadingGuardar] = useState(false);

  // Cargar dashboard principal
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/empresa/dashboard`, {
        withCredentials: true,
      });
      console.log( data );
      
      if (data.success) setDashboard(data.data);
      else toast.error(data.message || "No se pudo cargar el dashboard");
    }catch (error) {
      console.error("Error al obtener ganancias pendientes:", error.response?.data?.message);
      toast.error(error.response?.data?.message || "Error al obtener ganancias pendientes");
    }finally {
        setLoading(false);
        }
      };

  // Cargar ganancias pendientes
  const fetchGananciasPendientes = async () => {
    try {
      setLoadingGanancias(true);
      const { data } = await axios.get(
        `${backendUrl}/api/empresa/ganancias-pendientes`,
        { withCredentials: true }
      );
      if (data.success) setGanancias(data.data);
      else toast.error(data.message || "No se pudo obtener ganancias");
    } catch (error) {
      console.error("Error al obtener ganancias pendientes:", error.response?.data?.message);
      toast.error(error.response?.data?.message || "Error al obtener ganancias pendientes");
    } finally {
      setLoadingGanancias(false);
    }
  };

  // Cargar datos bancarios
  const fetchCuentaBancaria = async () => {
    try {
      setLoadingCuenta(true);
      const { data } = await axios.get(`${backendUrl}/api/empresa/banco`, {
        withCredentials: true,
      });

    if (data.success) {
      setCuenta({
        banco_nombre: data.data?.banco_nombre || "",
        tipo_cuenta: data.data?.tipo_cuenta || "",
        numero_cuenta: data.data?.numero_cuenta || "",
        rut_titular: data.data?.rut_titular || "",
        nombre_titular: data.data?.nombre_titular || "",
      });
    } else {
      toast.warn(data.message || "No hay datos bancarios registrados.");
    }

    } catch (error) {
      toast.error(error.response?.data?.message || "Error al cargar datos bancarios");
    } finally {
      setLoadingCuenta(false);
    }
  };

  // Guardar o actualizar cuenta bancaria
  const handleGuardarCuenta = async (e) => {
    e.preventDefault();
    setLoadingGuardar(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/empresa/banco`,
        cuenta,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || "Datos bancarios guardados correctamente.");
      } else {
        toast.warn(data.message || "No se pudieron guardar los datos.");
      }
    } catch (error) {
      const backendMsg = error.response?.data?.message || error.message;
      if (backendMsg.includes("obligatorios") || backendMsg.includes("no válido")) {
        toast.warn(` ${backendMsg}`);
      } else if (backendMsg.includes("Empresa")) {
        toast.error(` ${backendMsg}`);
      } else {
        toast.error(` ${backendMsg}`);
      }
    }
  };


  const handleCuentaChange = (e) =>
    setCuenta({ ...cuenta, [e.target.name]: e.target.value });

  // Solicitar desembolso
  const solicitarDesembolso = async () => {
    try {
      setLoadingSolicitud(true);
      const { data } = await axios.post(
        `${backendUrl}/api/empresa/solicitar-desembolso`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || "Solicitud de desembolso enviada correctamente.");
        setShowConfirmModal(false);
        fetchGananciasPendientes();
      } else {
        toast.warn(data.message || "No se pudo crear la solicitud.");
      }
    } catch (error) {
      const backendMsg = error.response?.data?.message || error.message;
      console.error("Error al solicitar desembolso:", backendMsg);

      // errores
      if (backendMsg.includes("mínimo")) {
        toast.info(` ${backendMsg}`);
      } else if (backendMsg.includes("pendiente")) {
        toast.warn(` ${backendMsg}`);
      } else if (backendMsg.includes("Empresa no encontrada")) {
        toast.error(` ${backendMsg}`);
      } else {
        toast.error(` ${backendMsg}`);
      }
    } finally {
      setLoadingSolicitud(false);
    }
  };


  useEffect(() => {
    if (empresaUsuario) {
      fetchDashboard();
      fetchGananciasPendientes();
      fetchCuentaBancaria();
    }
  }, [empresaUsuario]);

  if (loadingEmpresa || loading) {
    return (
      <div className="flex justify-center items-center h-screen text-green-600">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="ml-3 text-lg font-medium">Cargando dashboard...</span>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        No hay datos disponibles para esta empresa.
      </div>
    );
  }

  const resumen = dashboard?.sumario || {};
  const ventasPorMes = dashboard?.ventas_por_mes || {};
  const ventasDetalladas = dashboard?.ventas_detalladas || [];

  const dataGrafico = Object.entries(ventasPorMes).map(([mes, val]) => ({
    mes,
    total: val?.total || 0,
    neto: val?.neto || 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 px-6 py-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-10">
          <header className="text-center space-y-1">
            <h1 className="text-4xl font-extrabold text-green-700 tracking-tight">
              Dashboard de {dashboard?.empresaNombre || "tu empresa"}
            </h1>
            <p className="text-gray-600">
              Resumen general de ventas y rendimiento
            </p>
          </header>

          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              icon={<DollarSign className="text-green-600 w-6 h-6" />}
              title="Ventas Totales"
              value={`$${resumen.ventas_totales?.toLocaleString("es-CL") || 0}`}
              subtitle="Total de ventas completadas"
            />
            <Card
              icon={<Wallet className="text-green-600 w-6 h-6" />}
              title="Ingresos Netos"
              value={`$${resumen.ingresos_netos?.toLocaleString("es-CL") || 0}`}
              subtitle="Después de comisiones"
            />
            <Card
              icon={<TrendingUp className="text-green-600 w-6 h-6" />}
              title="Comisión Total"
              value={`$${resumen.comision_total?.toLocaleString("es-CL") || 0}`}
              subtitle="Retenida por StartSeed"
            />
            <Card
              icon={<BarChart3 className="text-green-600 w-6 h-6" />}
              title="IVA Total"
              value={`$${resumen.iva_total?.toLocaleString("es-CL") || 0}`}
              subtitle="Impuestos sobre ventas"
            />
          </section>

          <section className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" /> Ventas por mes
            </h2>
            {dataGrafico.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" stroke="#4b5563" />
                  <YAxis stroke="#4b5563" />
                  <Tooltip
                    formatter={(v) => `$${Number(v).toLocaleString("es-CL")}`}
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Bar dataKey="total" fill="#10b981" name="Total vendido" />
                  <Bar dataKey="neto" fill="#84cc16" name="Ingresos netos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-10">
                No hay ventas registradas aún.
              </p>
            )}
          </section>

          <VentasRecientes ventasDetalladas={ventasDetalladas} />
        </div>

        <aside className="w-full lg:w-[30%] space-y-6">
          <Desembolsos
            ganancias={ganancias}
            dashboard={dashboard}
            loadingGanancias={loadingGanancias}
            setShowConfirmModal={setShowConfirmModal}
          />
          <CuentaBancaria
            cuenta={cuenta}
            loadingCuenta={loadingCuenta}
            loadingGuardar={loadingGuardar}
            handleCuentaChange={handleCuentaChange}
            handleGuardarCuenta={handleGuardarCuenta}
          />
        </aside>
      </div>

      {showConfirmModal && (
        <ModalDesembolso
          ganancias={ganancias}
          loadingSolicitud={loadingSolicitud}
          solicitarDesembolso={solicitarDesembolso}
          cerrar={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
};

// --- Subcomponentes ---
const Card = ({ icon, title, value, subtitle }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-gray-700 font-semibold">{title}</h3>
      {icon}
    </div>
    <p className="text-3xl font-bold text-green-700">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
  </div>
);

const VentasRecientes = ({ ventasDetalladas }) => (
  <section className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-lg">
    <h2 className="text-lg font-semibold text-gray-700 mb-4">Ventas recientes</h2>
    {(ventasDetalladas?.length || 0) > 0 ? (
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full text-sm text-gray-700 border-collapse">
          <thead>
            <tr className="bg-green-100 text-green-700 font-semibold">
              <th className="px-4 py-2 rounded-l-lg">Fecha</th>
              <th className="px-4 py-2">Producto</th>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2 text-right rounded-r-lg">Total</th>
            </tr>
          </thead>
          <tbody>
            {ventasDetalladas.slice(0, 8).map((v, i) => (
              <tr key={i} className="border-b hover:bg-green-50 transition">
                <td className="px-4 py-2">
                  {new Date(v.fecha).toLocaleDateString("es-CL")}
                </td>
                <td className="px-4 py-2">{v.producto}</td>
                <td className="px-4 py-2">{v.cantidad}</td>
                <td className="px-4 py-2 text-right font-semibold text-green-700">
                  ${v.total_producto.toLocaleString("es-CL")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-gray-500 text-center py-4">No hay ventas recientes.</p>
    )}
  </section>
);

const Desembolsos = ({ ganancias, dashboard, loadingGanancias, setShowConfirmModal }) => (
  <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg p-6">
    <h2 className="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
      <PiggyBank className="w-6 h-6 text-green-600" /> Desembolsos
    </h2>

    {loadingGanancias ? (
      <div className="flex items-center justify-center py-10 text-green-600">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando...
      </div>
    ) : (
      <>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">Ganancias pendientes</p>
          <p className="text-3xl font-extrabold text-green-700 mt-1">
            ${ganancias?.montoPendiente?.toLocaleString("es-CL") || 0}
          </p>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Últimos desembolsos
          </h3>
          {dashboard?.pagos_empresa?.ultimos_desembolsos?.length ? (
            <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              {dashboard.pagos_empresa.ultimos_desembolsos.map((p, i) => (
                <li key={i} className="flex justify-between border-b border-gray-100 pb-1">
                  <span>{new Date(p.fecha_pago).toLocaleDateString("es-CL")}</span>
                  <span className="font-semibold text-green-700">
                    ${p.monto.toLocaleString("es-CL")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm text-center py-2">
              No hay desembolsos registrados aún.
            </p>
          )}
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Clock className="w-5 h-5" /> Solicitar desembolso
        </button>
      </>
    )}
  </div>
);

const CuentaBancaria = ({
    cuenta,
    loadingCuenta,
    loadingGuardar,
    handleCuentaChange,
    handleGuardarCuenta,
  }) => {
    // Lista oficial de bancos chilenos
    const bancosDeChile = [
      "Banco de Chile",
      "Banco Estado",
      "Banco BCI",
      "Banco Santander",
      "Banco Itaú",
      "Scotiabank Chile",
      "Banco Security",
      "Banco Falabella",
      "Banco Ripley",
      "Banco Consorcio",
      "Banco Internacional",
      "Banco BICE",
      "Banco CrediChile",
      "Banco BTG Pactual Chile",
      "Banco del Desarrollo",
      "Banco Edwards Citi",
      "Banco Paris",
      "Banco Cooperativo",
      "Banco de la Nación Argentina (Sucursal Chile)",
      "Banco de Inversión Global",
    ];

    return (
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-green-600" /> Cuenta Bancaria
        </h2>

        {loadingCuenta ? (
          <div className="flex items-center justify-center py-10 text-green-600">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando datos bancarios...
          </div>
        ) : (
          <form onSubmit={handleGuardarCuenta} className="space-y-4">
            {/* Banco */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Banco
              </label>
              <select
                name="banco_nombre"
                value={cuenta.banco_nombre}
                onChange={handleCuentaChange}
                className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Seleccionar banco</option>
                {bancosDeChile.map((banco) => (
                  <option key={banco} value={banco}>
                    {banco}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de cuenta */}
            <Select
              label="Tipo de cuenta"
              name="tipo_cuenta"
              value={cuenta.tipo_cuenta}
              onChange={handleCuentaChange}
            >
              <option value="">Seleccionar tipo</option>
              <option value="Corriente">Corriente</option>
              <option value="Vista">Vista</option>
              <option value="Ahorro">Ahorro</option>
            </Select>

            {/* Número de cuenta */}
            <Input
              label="Número de cuenta"
              name="numero_cuenta"
              value={cuenta.numero_cuenta}
              onChange={handleCuentaChange}
              placeholder="Ej: 123456789"
            />

            {/* Titular */}
            <Input
              label="Nombre del titular"
              name="nombre_titular"
              value={cuenta.nombre_titular}
              onChange={handleCuentaChange}
              placeholder="Ej: Gonzalo Prieto"
            />

            {/* RUT del titular */}
            <Input
              label="RUT del titular"
              name="rut_titular"
              value={cuenta.rut_titular}
              onChange={handleCuentaChange}
              placeholder="Ej: 20.123.456-7"
            />

            {/* Botón */}
            <button
              type="submit"
              disabled={loadingGuardar}
              className={`w-full mt-3 flex items-center justify-center gap-2 font-medium py-3 rounded-xl transition text-white shadow-md ${
                loadingGuardar
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loadingGuardar ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              {loadingGuardar ? "Guardando..." : "Guardar datos bancarios"}
            </button>
          </form>
        )}
      </div>
    );
  };

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <input
      {...props}
      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <select
      {...props}
      className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
    >
      {children}
    </select>
  </div>
);

const ModalDesembolso = ({
  ganancias,
  loadingSolicitud,
  solicitarDesembolso,
  cerrar,
}) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-lg p-8 w-[90%] max-w-md text-center">
      <PiggyBank className="w-12 h-12 text-green-600 mx-auto mb-3" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Confirmar solicitud
      </h3>
      <p className="text-gray-600 mb-6">
        ¿Deseas solicitar tu desembolso de{" "}
        <span className="font-semibold text-green-700">
          ${ganancias?.montoPendiente?.toLocaleString("es-CL") || 0}
        </span>{" "}
        ahora?
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={cerrar}
          className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium transition"
        >
          <XCircle className="w-5 h-5" /> Cancelar
        </button>
        <button
          onClick={solicitarDesembolso}
          disabled={loadingSolicitud}
          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition disabled:opacity-70"
        >
          {loadingSolicitud ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          Confirmar
        </button>
      </div>
    </div>
  </div>
);
