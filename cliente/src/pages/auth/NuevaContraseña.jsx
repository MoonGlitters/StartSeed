import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { useContext, useState } from "react";

// esquema zod
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Ingresa un correo válido" }),
});

export const NuevaContraseña = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmitHandler = async (values) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/enviar-reset-otp",
        values
      );

      if (data.success) {
        toast.success(data.message || "Código enviado a tu correo");
        navigate("/reset-password", { state: { email: values.email } });
      } else {
        toast.error(data.message || "El correo no existe");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-gradient-to-br from-white via-green-50 to-amber-100 relative">
      {/* logo startseed */}
      <img
        onClick={() => navigate("/")}
        className="absolute bottom-5 left-5 w-28 sm:w-32 cursor-pointer transition-transform duration-300 hover:scale-105"
        src={assets.logo}
        alt="logo"
      />

      {/* contenedor principal */}
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full sm:w-96 text-gray-700 text-sm animate-fade-in">
        <h2 className="text-3xl font-bold text-green-700 text-center mb-2">
          Recuperar Contraseña
        </h2>
        <p className="text-center text-sm mb-6 text-gray-500 leading-relaxed">
          Ingresa tu correo electrónico y te enviaremos un código o enlace para
          restablecer tu contraseña
        </p>

        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          {/* email */}
          <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-green-100 border border-green-200 focus-within:ring-2 focus-within:ring-green-400 transition-all">
            <img
              src={assets.mail_icon}
              alt="mail"
              className="w-5 h-5 opacity-70"
            />
            <input
              {...register("email")}
              className="bg-transparent outline-none text-gray-700 placeholder-gray-500 flex-1"
              type="email"
              placeholder="Correo electrónico"
              autoComplete="username"
            />
          </div>

          {errors.email && (
            <p className="text-red-500 text-xs -mt-2">
              {errors.email.message}
            </p>
          )}

          {/* botón enviar */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-full text-white font-semibold transition-all duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md"
            }`}
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <p className="text-gray-500 text-center text-xs mt-5">
          <span
            onClick={() => navigate("/login")}
            className="text-green-600 cursor-pointer font-medium hover:underline"
          >
            Volver al login
          </span>
        </p>
      </div>
    </div>
  );
};
