  import { useNavigate, useLocation } from "react-router-dom";
  import { toast } from "react-toastify";
  import axios from "axios";
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import * as z from "zod";
  import { useContext, useEffect, useState } from "react";
  import { AppContext } from "../../context/AppContext";
  import { assets } from "../../assets/assets";

  // esquema zod
  const resetPasswordSchema = z
    .object({
      otp: z.string().min(1, { message: "El código es requerido" }),
      newPassword: z
        .string()
        .min(8, { message: "Debe tener al menos 8 caracteres" })
        .regex(/[A-Z]/, { message: "Debe contener al menos una mayúscula" })
        .regex(/[a-z]/, { message: "Debe contener al menos una minúscula" })
        .regex(/[0-9]/, { message: "Debe contener al menos un número" })
        .regex(/[^A-Za-z0-9]/, { message: "Debe contener al menos un símbolo" }),
      confirmPassword: z
        .string()
        .min(8, { message: "Confirma la contraseña" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    });

  export const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const { backendUrl } = useContext(AppContext);

    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const [timer, setTimer] = useState(15);

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(resetPasswordSchema),
    });

    // temporizador para reenviar OTP
    useEffect(() => {
      if (!canResend && timer > 0) {
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
      } else if (timer <= 0) {
        setCanResend(true);
      }
    }, [timer, canResend]);

    // enviar nueva contraseña
    const onSubmitHandler = async (values) => {
      setLoading(true);
      try {
        const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
          email,
          otp: values.otp,
          password: values.newPassword,
        });

        toast.success(data.message || "Contraseña actualizada correctamente");
        navigate("/login");
      } catch (error) {
        toast.error(error.response?.data?.message || "Error al actualizar la contraseña");
      } finally {
        setLoading(false);
      }
    };

    // reenviar OTP
    const resendOtp = async () => {
      if (!email) return toast.error("No se encontró el correo del usuario");
      setResending(true);
      try {
        await axios.post(`${backendUrl}/api/auth/enviar-reset-otp`, { email });
        toast.success("Código reenviado correctamente");
        setTimer(15);
        setCanResend(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error al reenviar el código");
      } finally {
        setResending(false);
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen px-6 bg-gradient-to-br from-white via-green-50 to-amber-100 relative">
        {/* logo StartSeed */}
        <img
          onClick={() => navigate("/")}
          className="absolute bottom-5 left-5 w-28 sm:w-32 cursor-pointer transition-transform duration-300 hover:scale-105"
          src={assets.logo}
          alt="logo"
        />

        {/* contenedor principal */}
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full sm:w-96 text-gray-700 text-sm animate-fade-in">
          <h2 className="text-3xl font-bold text-green-700 text-center mb-2">
            Restablecer Contraseña
          </h2>
          <p className="text-center text-sm mb-6 text-gray-500 leading-relaxed">
            Ingresa el código que enviamos a tu correo y tu nueva contraseña
          </p>

          <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
            {/* Codigo OTP */}
            <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-green-100 border border-green-200 focus-within:ring-2 focus-within:ring-green-400 transition-all">
              <img
                src={assets.mail_icon}
                alt="OTP"
                className="w-5 h-5 opacity-70"
              />
              <input
                {...register("otp")}
                className="bg-transparent outline-none text-gray-700 placeholder-gray-500 flex-1"
                type="text"
                placeholder="Código de verificación"
              />
            </div>
            {errors.otp && (
              <p className="text-red-500 text-xs -mt-2">{errors.otp.message}</p>
            )}

            {/* Nueva contraseña */}
            <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-green-100 border border-green-200 focus-within:ring-2 focus-within:ring-green-400 transition-all">
              <img
                src={assets.lock_icon}
                alt="lock"
                className="w-5 h-5 opacity-70"
              />
              <input
                {...register("newPassword")}
                className="bg-transparent outline-none text-gray-700 placeholder-gray-500 flex-1"
                type="password"
                placeholder="Nueva contraseña"
                autoComplete="new-password"
              />
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-xs -mt-2">
                {errors.newPassword.message}
              </p>
            )}

            {/* Confirmar contraseña */}
            <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-green-100 border border-green-200 focus-within:ring-2 focus-within:ring-green-400 transition-all">
              <img
                src={assets.lock_icon}
                alt="lock"
                className="w-5 h-5 opacity-70"
              />
              <input
                {...register("confirmPassword")}
                className="bg-transparent outline-none text-gray-700 placeholder-gray-500 flex-1"
                type="password"
                placeholder="Confirmar contraseña"
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs -mt-2">
                {errors.confirmPassword.message}
              </p>
            )}

            {/* Boton principal */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-full text-white font-semibold transition-all duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md"
              }`}
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>

          {/* Boton reenvío OTP */}
          <button
            onClick={resendOtp}
            disabled={!canResend || resending}
            className={`mt-4 w-full py-2.5 rounded-full font-medium transition-all duration-300 ${
              canResend && !resending
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {resending
              ? "Reenviando..."
              : canResend
              ? "Reenviar código"
              : `Reenviar en ${timer}s`}
          </button>

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
