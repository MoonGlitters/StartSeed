import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  RefreshCcw,
  Save,
  Wrench,
  DollarSign,
  Truck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

export const AdminConfiguracionGlobal = () => {
  const { backendUrl, userData, loading } = useContext(AppContext);
  const [config, setConfig] = useState(null);
  const [recargando, setRecargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editado, setEditado] = useState(false);

  // Obtener configuracion global
  const fetchConfig = async () => {
    try {
      setRecargando(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/conf`, {
        withCredentials: true,
      });
      if (data.success) {
        setConfig(data.config);
        setEditado(false);
      } else {
        toast.error("Error al obtener la configuración.");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor.");
    } finally {
      setRecargando(false);
    }
  };

  // Guardar cambios
  const handleGuardar = async () => {
    try {
      setGuardando(true);
      const { id, created_at, updated_at, ...valores } = config;
      const { data } = await axios.put(
        `${backendUrl}/api/admin/conf/update`,
        valores,
        { withCredentials: true }
      );

      if (data.success) {
        setConfig(data.config);
        setEditado(false);
        toast.success("Configuración actualizada correctamente ");
      } else {
        toast.error(data.message || "Error al guardar cambios.");
      }
    } catch (error) {
      toast.error("Error al guardar la configuración.");
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    if (!loading && userData?.role === "admin") fetchConfig();
  }, [loading, userData]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Cargando sesión...
      </div>
    );

  if (!userData || userData.role !== "admin")
    return (
      <div className="text-center text-gray-600 py-10">
        No tienes permiso para acceder a este panel.
      </div>
    );

  if (!config)
    return (
      <div className="flex justify-center items-center py-10 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Cargando configuración...
      </div>
    );

  const handleChange = (campo, valor) => {
    setConfig({ ...config, [campo]: valor });
    setEditado(true);
  };

  return (
    <motion.div
      className="w-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-green-700">
            Configuración Global
          </h2>
          <p className="text-gray-600 text-sm">
            Ajusta los parámetros generales del sistema StartSeed.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={fetchConfig}
            disabled={recargando}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            {recargando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            Recargar
          </Button>
        </div>
      </div>

      {/* Card principal */}
      <Card className="p-6 border border-gray-200 shadow-sm space-y-6">
        {/* Seccion Finanzas */}
        <Section icon={DollarSign} titulo="Finanzas del sistema">
          <InputRow
            label="IVA (%)"
            value={config.iva_porcentaje}
            onChange={(v) => handleChange("iva_porcentaje", v)}
          />
          <InputRow
            label="Comisión (%)"
            value={config.comision_porcentaje}
            onChange={(v) => handleChange("comision_porcentaje", v)}
          />
        </Section>

        {/* Seccion Envios */}
        <Section icon={Truck} titulo="Configuración de envíos">
          <InputRow
            label="Costo envío base ($)"
            value={config.costo_envio_base}
            onChange={(v) => handleChange("costo_envio_base", v)}
          />
          <InputRow
            label="Monto mínimo envío gratis ($)"
            value={config.monto_minimo_envio_gratis}
            onChange={(v) => handleChange("monto_minimo_envio_gratis", v)}
          />
        </Section>

        {/* Seccion Desembolsos / Devoluciones */}
        <Section icon={RotateCcw} titulo="Desembolsos y devoluciones">
          <InputRow
            label="Monto mínimo desembolso ($)"
            value={config.monto_minimo_desembolso}
            onChange={(v) => handleChange("monto_minimo_desembolso", v)}
          />
          <InputRow
            label="Días máximos para devolución"
            value={config.dias_max_devolucion}
            onChange={(v) => handleChange("dias_max_devolucion", v)}
          />
        </Section>

        {/* Seccion Mantenimiento */}
        <Section icon={Wrench} titulo="Modo mantenimiento">
          <div className="flex items-center gap-3 mt-1 mb-3">
            <Switch
              checked={config.sitio_en_mantenimiento}
              onCheckedChange={(checked) =>
                handleChange("sitio_en_mantenimiento", checked)
              }
            />
            <span className="text-sm text-gray-700">
              {config.sitio_en_mantenimiento
                ? "Sitio en mantenimiento"
                : "Sitio activo"}
            </span>
          </div>

          <InputRow
            label="Mensaje de mantenimiento"
            placeholder="Ej: Estamos realizando mejoras, vuelve pronto."
            value={config.mensaje_mantenimiento}
            onChange={(v) => handleChange("mensaje_mantenimiento", v)}
          />
        </Section>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={handleGuardar}
            disabled={!editado || guardando}
            className={`flex items-center gap-2 ${
              editado
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {guardando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {editado ? "Guardar cambios" : "Sin cambios"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

// componentes de ayuda
const Section = ({ icon: Icon, titulo, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-50 border border-gray-200 p-4 rounded-xl"
  >
    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
      <Icon className="w-5 h-5 text-green-600" /> {titulo}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </motion.div>
);

const InputRow = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-600 mb-1">{label}</label>
    <Input
      type="text"
      value={value ?? ""}
      placeholder={placeholder || ""}
      onChange={(e) => onChange(e.target.value)}
      className="border-gray-300 focus:ring-green-500"
    />
  </div>
);

export default AdminConfiguracionGlobal;
