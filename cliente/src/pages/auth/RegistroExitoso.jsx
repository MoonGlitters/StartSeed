import React, { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const RegistroExitoso = () => {
  const navigate = useNavigate();
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSaliendo(true); // activa la animación fade-out
      setTimeout(() => navigate("/"), 600); // redirige tras la animación (0.6s)
    }, 3000); // espera 5 segundos antes de iniciar salida

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="registro-exitoso"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="min-h-screen relative"
      >
        {/* Contenido principal con animación de salida */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: saliendo ? 0 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Header />
        </motion.div>

        {/* Mensaje de redirección */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-10 left-0 right-0 text-center text-gray-600 text-sm"
        >
          Serás redirigido al inicio en unos segundos...
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RegistroExitoso;
