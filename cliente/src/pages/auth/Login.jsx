import axios from "axios";
import { toast } from "react-toastify";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";
import { assets } from "../../assets/assets.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";

// Esquema de validación con Zod
const loginSchema = z.object({
  email: z.string().email({ message: "Ingresa un correo válido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

export const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, getUserData, isLoggedin } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirigir si ya está logueado
  useEffect(() => {
    if (isLoggedin) navigate("/");
  }, [isLoggedin, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  // Login
  const onSubmitHandler = async (values) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/login`,
        values,
        { withCredentials: true }
      );

      if (!data.success) {
        toast.error(data.message || "Correo o contraseña inválidos");
        return;
      }

      // Si inicia sesión correctamente, AppContext validará su estado
      await getUserData();
      toast.success("¡Bienvenido de nuevo!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Correo o contraseña inválidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-gradient-to-br from-white via-green-50 to-amber-100 relative">
      {/* Logo StartSeed */}
      <img
        onClick={() => navigate("/")}
        className="absolute bottom-5 left-5 w-28 sm:w-32 cursor-pointer transition-transform duration-300 hover:scale-105"
        src={assets.logo}
        alt="logo"
      />

      {/* Contenedor principal */}
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full sm:w-96 text-gray-700 text-sm animate-fade-in">
        <h2 className="text-3xl font-bold text-green-700 text-center mb-2">
          Iniciar Sesión
        </h2>
        <p className="text-center text-sm mb-6 text-gray-500">
          Ingresa a tu cuenta de StartSeed
        </p>

        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-green-100 border border-green-200 focus-within:ring-2 focus-within:ring-green-400 transition-all">
            <input
              {...register("email")}
              className="bg-transparent outline-none text-gray-700 placeholder-gray-500 flex-1"
              type="email"
              placeholder="Correo electrónico"
              autoComplete="username"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs -mt-2">{errors.email.message}</p>
          )}

          {/* Password con ícono */}
          <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-green-100 border border-green-200 focus-within:ring-2 focus-within:ring-green-400 transition-all relative">
            <input
              {...register("password")}
              className="bg-transparent outline-none text-gray-700 placeholder-gray-500 flex-1"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs -mt-2">{errors.password.message}</p>
          )}

          {/* Olvidé mi contraseña */}
          <p
            onClick={() => navigate("/nueva-contraseña")}
            className="text-green-600 text-sm font-medium cursor-pointer hover:underline text-right"
          >
            ¿Olvidaste tu contraseña?
          </p>

          {/* Botón login */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-full text-white font-semibold transition-all duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md"
            }`}
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Enlace registro */}
        <p className="text-gray-500 text-center text-xs mt-5">
          ¿No tienes una cuenta?{" "}
          <span
            onClick={() => navigate("/registro")}
            className="text-green-600 cursor-pointer font-medium hover:underline"
          >
            Regístrate aquí
          </span>
        </p>
      </div>
    </div>
  );
};
