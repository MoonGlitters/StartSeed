import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";

export const Header = () => {
  const { userData } = useContext(AppContext);
  const nombre = userData?.username || "Usuario";

  return (
    <motion.section
    className="flex flex-col items-center justify-center h-screen w-full px-6 text-center bg-gradient-to-br from-white via-green-50 to-amber-100 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Imagen principal */}
      <motion.img
        src={assets.header_img}
        alt="StartSeed Header"
        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full shadow-lg border-4 border-white mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Título de bienvenida */}
      <motion.h1
        className="flex items-center justify-center gap-2 text-2xl sm:text-4xl font-semibold text-emerald-700 mb-3"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        ¡Hola, {nombre}!{" "}
        <Sprout className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 animate-grow" />
      </motion.h1>

      {/* Subtítulo */}
      <motion.h2
        className="text-3xl sm:text-5xl font-bold text-gray-800 mb-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Bienvenido a <span className="text-emerald-700">StartSeed</span>
      </motion.h2>

      {/* Descripción */}
      <motion.p
        className="text-gray-700 max-w-lg mb-8 leading-relaxed text-sm sm:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        StartSeed es el punto de encuentro entre emprendedores.
        Crea tu empresa, muestra tus productos e impulsa tu crecimiento junto a una comunidad que cree en tus ideas 
      </motion.p>

      {/* Botón principal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <Link
          to="/"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 font-medium"
        >
          Empecemos 
        </Link>
      </motion.div>
    </motion.section>
  );
};

export default Header;
