import axios from "axios";
import { toast } from "react-toastify";
import { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// esquema zod 
const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" })
    .max(20, { message: "El nombre de usuario no puede superar los 20 caracteres" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Solo se permiten letras, números y guiones bajos",
    })
    .transform((val) => val.trim().replace(/\s+/g, "")),
  email: z.string().email({ message: "Ingresa un correo válido" }),
  password: z
    .string()
    .min(8, {
      message:
        "Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo",
    })
    .regex(/[A-Z]/, { message: "Debe contener al menos una mayúscula" })
    .regex(/[a-z]/, { message: "Debe contener al menos una minúscula" })
    .regex(/[0-9]/, { message: "Debe contener al menos un número" })
    .regex(/[^A-Za-z0-9]/, { message: "Debe contener al menos un símbolo" }),
});

export const Registro = () => {
  const { backendUrl, getUserData } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmitHandler = async (values) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/registro`,
        {
          username: values.username,
          email: values.email,
          password: values.password,
        },
        { withCredentials: true }
      );

      if (data.success) {
        await getUserData();
        toast.success("Registro exitoso");
        navigate("/registro-exitoso");
      } else {
        toast.error(data.message || "Error en el registro");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al conectar con el servidor");
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
          Crear cuenta
        </h2>
        <p className="text-center text-sm mb-6 text-gray-500">
          Registra tu nueva cuenta en StartSeed
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
            {/* username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-green-100 border border-green-200 focus-within:ring-2 focus-within:ring-green-400 transition-all">
                    <img src={assets.person_icon} alt="user" className="w-5 h-5 opacity-70" />
                    <FormControl>
                      <Input
                        placeholder="Nombre de usuario"
                        className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-500"
                        {...field}
                        autoComplete="username"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-green-100 border border-green-200 focus-within:ring-2 focus-within:ring-green-400 transition-all">
                    <img src={assets.mail_icon} alt="mail" className="w-5 h-5 opacity-70" />
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Correo electrónico"
                        className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-500"
                        {...field}
                        autoComplete="email"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-green-100 border border-green-200 focus-within:ring-2 focus-within:ring-green-400 transition-all">
                    <img src={assets.lock_icon} alt="lock" className="w-5 h-5 opacity-70" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Contraseña"
                        className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-500"
                        {...field}
                        autoComplete="new-password"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* botón registro */}
            <Button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-full text-white font-semibold transition-all duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md"
              }`}
            >
              {loading ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        </Form>

        {/* login link */}
        <p className="text-gray-500 text-center text-xs mt-4">
          ¿Ya tienes una cuenta?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-600 cursor-pointer font-medium hover:underline"
          >
            Inicia sesión aquí
          </span>
        </p>
      </div>
    </div>
  );
};
