import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import { NavBar } from "./NavBar.jsx";
import { Footer } from "./Footer.jsx";
import { MaintenancePage } from "../pages/sistema/MaintenancePage.jsx";

export const AppContainer = ({
  loading,
  configCargada,
  configGlobal,
  ignorarMantenimiento,
  sinNavYFooter,
  children,
}) => {
  return (
    <AnimatePresence mode="wait">
      {/*  Estado de carga */}
      {loading || !configCargada ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="flex flex-col items-center justify-center min-h-screen bg-gradient-natural text-center"
        >
          <motion.div
            className="relative mb-6"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full" />
            <span className="absolute inset-0 flex items-center justify-center font-bold text-green-700 text-2xl">
              S
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl font-extrabold text-green-700"
          >
            <span className="animate-pulse">Start</span>
            <span className="text-gray-800 ml-1">Seed</span>
          </motion.div>

          <p className="text-sm text-gray-500 mt-2">Cargando plataforma...</p>
        </motion.div>
      ) : !ignorarMantenimiento && configGlobal?.sitio_en_mantenimiento ? (
        //  Modo mantenimiento
        <motion.div
          key="maintenance"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <MaintenancePage />
        </motion.div>
      ) : (
        //  Aplicación normal
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="flex flex-col min-h-screen bg-gradient-natural w-screen overflow-x-hidden"
          style={{ margin: 0, padding: 0 }}
        >
          {!sinNavYFooter && <NavBar />}
     <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        className="pointer-events-auto z-[9999]"
        />
          <main className="flex-grow">{children}</main>
          {!sinNavYFooter && <Footer />}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
