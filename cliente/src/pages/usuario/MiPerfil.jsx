import { useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AppContext } from "../../context/AppContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ShieldCheck, Globe } from "lucide-react";

export const MiPerfil = () => {
  const { userData } = useContext(AppContext);

  if (!userData)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Cargando perfil...
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-white via-green-50 to-amber-100">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="overflow-hidden shadow-2xl border border-gray-200 rounded-2xl">
          {/* Encabezado con el gradiente StartSeed */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-amber-400 h-36 relative">
            <div className="absolute left-1/2 -bottom-16 transform -translate-x-1/2">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                {userData.url_img_perfil ? (
                  <AvatarImage src={userData.url_img_perfil} alt="Avatar" />
                ) : (
                  <AvatarFallback className="bg-green-100 text-green-700 text-2xl font-bold">
                    {userData.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </div>

          <CardContent className="pt-24 pb-10 px-8">
            {/* Nombre y rol */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-800">
                {userData.nombre || "Usuario"} {userData.apellido || ""}
              </h2>
              <p className="text-gray-500 text-sm mt-1">@{userData.username}</p>

              <div className="flex items-center justify-center gap-2 mt-4">
                <Badge
                  className={`text-white text-sm px-3 py-1 ${
                    userData.role === "admin"
                      ? "bg-red-500"
                      : userData.role === "empresa"
                      ? "bg-blue-500"
                      : "bg-green-600"
                  }`}
                >
                  {userData.role}
                </Badge>

                {userData.estado && (
                  <Badge
                    className={`text-white text-sm px-3 py-1 ${
                      userData.estado === "activa"
                        ? "bg-emerald-500"
                        : userData.estado === "suspendida"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                  >
                    {userData.estado}
                  </Badge>
                )}
              </div>
            </div>

            {/* Datos personales */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Email */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-3 bg-gradient-to-br from-white to-green-50 p-4 rounded-xl border border-gray-100 shadow-sm"
              >
                <Mail className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Correo electrónico</p>
                  <p className="font-semibold break-words">{userData.email}</p>
                </div>
              </motion.div>

              {/* Telefono */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-3 bg-gradient-to-br from-white to-green-50 p-4 rounded-xl border border-gray-100 shadow-sm"
              >
                <Phone className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-semibold">
                    {userData.telefono || "No registrado"}
                  </p>
                </div>
              </motion.div>

              {/* Direccion */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-3 bg-gradient-to-br from-white to-green-50 p-4 rounded-xl border border-gray-100 shadow-sm md:col-span-2"
              >
                <MapPin className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Dirección</p>
                  {userData.calle ||
                  userData.numero ||
                  userData.comuna ||
                  userData.region ? (
                    <p className="font-semibold leading-snug">
                      {userData.calle ? `${userData.calle} ` : ""}
                      {userData.numero ? `${userData.numero}, ` : ""}
                      {userData.villa ? `${userData.villa}, ` : ""}
                      {userData.comuna ? `${userData.comuna}, ` : ""}
                      {userData.region || ""}
                      {userData.referencia_direccion
                        ? ` (${userData.referencia_direccion})`
                        : ""}
                    </p>
                  ) : (
                    <p className="font-semibold text-gray-400">
                      No registrada
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Region */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-3 bg-gradient-to-br from-white to-green-50 p-4 rounded-xl border border-gray-100 shadow-sm"
              >
                <Globe className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Región</p>
                  <p className="font-semibold">
                    {userData.region || "No especificada"}
                  </p>
                </div>
              </motion.div>

              {/* Verificacion */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-3 bg-gradient-to-br from-white to-green-50 p-4 rounded-xl border border-gray-100 shadow-sm md:col-span-2"
              >
                <ShieldCheck className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Verificación</p>
                  <p className="font-semibold">
                    {userData.email_verificado
                      ? "Correo electrónico verificado "
                      : "Correo electrónico no verificado "}
                  </p>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
