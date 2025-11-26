

import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

export const MaintenancePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-emerald-50 to-white text-center px-4 select-none">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Wrench className="w-24 h-24 text-emerald-600" />
          </motion.div>
          <div className="w-32 h-32 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin opacity-70" />
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-700 mt-10">
          Sitio en mantenimiento
        </h1>
        <p className="text-gray-600 mt-3 text-lg max-w-lg">
          Estamos realizando mejoras para ofrecerte una mejor experiencia  
          Por favor, vuelve a intentarlo más tarde.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition"
        >
          Reintentar
        </motion.button>
      </motion.div>
    </div>
  );
};

