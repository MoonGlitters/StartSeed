import { useState, useEffect, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { CheckCircle, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const EditarPerfil = () => {
  const { userData, backendUrl, getUserData } = useContext(AppContext);
  const [form, setForm] = useState({});
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [modo, setModo] = useState(null);
  const [timer, setTimer] = useState(0);
  const [emailVerificado, setEmailVerificado] = useState(false);

  useEffect(() => {
    if (userData) {
      setForm({});
      setEmailVerificado(!!(userData.is_email_verified || userData.email_verificado));
    }
  }, [userData]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  if (!userData)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Cargando perfil...
      </div>
    );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const normalizarTelefono = (telefono) => telefono.replace(/\s|-/g, "");

  const validarTelefonoChileno = (telefono) => /^\+569\d{8}$/.test(telefono);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.telefono?.trim()) {
      const telefonoLimpio = normalizarTelefono(form.telefono);
      if (!validarTelefonoChileno(telefonoLimpio)) {
        toast.warn("Formato incorrecto (+569XXXXXXXX)");
        return;
      }
      form.telefono = telefonoLimpio;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      if (imagen) {
        formData.append("img_perfil", imagen);
      }

      await axios.patch(`${backendUrl}/api/user/editar`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      await getUserData();
      toast.success("Perfil actualizado");
      setForm({});
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  const enviarOtp = async () => {
    try {
      setModo("email");
      setTimer(30);

      await axios.post(
        `${backendUrl}/api/auth/enviar-email-otp`,
        { email: userData.email },
        { withCredentials: true }
      );

      toast.info("OTP enviado a tu correo");
    } catch (error) {
      toast.error("Error al enviar OTP");
    }
  };

  const verificarOtp = async () => {
    try {
      if (!otp.trim()) return toast.warn("Ingresa el OTP");

      const { data } = await axios.post(
        `${backendUrl}/api/auth/verificar-email-otp`,
        { otp },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Correo verificado");
        setEmailVerificado(true);
        setModo(null);
        getUserData();
      } else {
        toast.error("OTP incorrecto");
      }
    } catch {
      toast.error("Error al verificar OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-white via-green-50 to-amber-100">
      <Card className="w-full max-w-lg shadow-xl border border-gray-200">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-8 text-green-700 text-center">
            Editar Perfil
          </h2>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <Avatar className="w-28 h-28 border-4 border-green-200 shadow-md">
                {imagen ? (
                  <AvatarImage src={URL.createObjectURL(imagen)} />
                ) : userData.url_img_perfil ? (
                  <AvatarImage src={userData.url_img_perfil} />
                ) : (
                  <AvatarFallback className="bg-green-100 text-green-700 text-xl font-semibold">
                    {userData.nombre?.[0]?.toUpperCase() || "?"}
                    {userData.apellido?.[0]?.toUpperCase() || ""}
                  </AvatarFallback>
                )}
              </Avatar>

              <Label
                htmlFor="imagen"
                className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-2 py-1 rounded-full cursor-pointer"
              >
                Cambiar
              </Label>
              <input
                id="imagen"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImagen(e.target.files[0])}
              />
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {imagen ? "Previsualización" : "Haz clic en 'Cambiar' para actualizar tu foto"}
            </p>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <Label>Correo electrónico</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={userData.email}
                  disabled
                  className="bg-gray-100 text-gray-600 border-gray-200 flex-1"
                />

                {emailVerificado ? (
                  <div className="flex items-center bg-green-100 text-green-700 px-3 py-2 rounded-lg">
                    <CheckCircle className="w-4 h-4 mr-1" /> Verificado
                  </div>
                ) : (
                  <Button onClick={enviarOtp} className="bg-green-600 text-white">
                    Verificar
                  </Button>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <Label>Nombre de usuario</Label>
              <Input
                name="username"
                placeholder={userData.username || ""}
                defaultValue={userData.username || ""}
                onChange={handleChange}
              />
            </div>

            {/* Nombre */}
            <div>
              <Label>Nombre</Label>
              <Input
                key={userData.nombre}    
                name="nombre"
                defaultValue={userData.nombre || ""}
                placeholder={userData.nombre || ""}
                onChange={handleChange}
              />
            </div>

            {/* Apellido */}
            <div>
              <Label>Apellido</Label>
              <Input
                key={userData.apellido}
                name="apellido"
                defaultValue={userData.apellido || ""}
                placeholder={userData.apellido || ""}
                onChange={handleChange}
              />
            </div>

            {/* Telefono */}
            <div>
              <Label>Teléfono</Label>
              <Input
                name="telefono"
                placeholder={userData.telefono || "+569XXXXXXXX"}
                defaultValue={userData.telefono || ""}
                onChange={handleChange}
              />
            </div>

            {/* DIRECCIÓN */}
            <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3 border-b pb-1">
              Dirección
            </h3>

            <div>
              <Label>Calle</Label>
              <Input
                name="calle"
                placeholder={userData.calle || ""}
                defaultValue={userData.calle || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Número</Label>
              <Input
                name="numero"
                placeholder={userData.numero || ""}
                defaultValue={userData.numero || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Villa / Condominio</Label>
              <Input
                key={userData.villa}
                name="villa"
                defaultValue={userData.villa || ""}
                placeholder={userData.villa || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Comuna</Label>
              <Input
                name="comuna"
                placeholder={userData.comuna || ""}
                defaultValue={userData.comuna || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Región</Label>
              <Input
                name="region"
                placeholder={userData.region || ""}
                defaultValue={userData.region || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Referencia</Label>
              <Input
                name="referencia_direccion"
                placeholder={userData.referencia || ""}
                defaultValue={userData.referencia || ""}
                onChange={handleChange}
              />
            </div>

            {/* Botón */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* MODAL OTP */}
      <AnimatePresence>
        {modo === "email" && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div className="bg-white p-6 rounded-xl w-80">
              <h3 className="text-lg font-bold text-green-700 mb-3">Verificar correo</h3>

              <Input
                placeholder="Código OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mb-4"
              />

              <div className="flex gap-3">
                <Button onClick={verificarOtp} className="bg-green-600 text-white">
                  Verificar
                </Button>
                <Button onClick={() => setModo(null)} className="bg-gray-300">
                  Cancelar
                </Button>
              </div>

              <div className="mt-5 text-center">
                {timer > 0 ? (
                  <p className="text-gray-500 text-sm">
                    Reenviar en <span className="text-green-600">{timer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={() => setTimer(0) || enviarOtp()}
                    className="flex items-center gap-2 text-green-600"
                  >
                    <RotateCw className="w-4 h-4" /> Reenviar código
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
