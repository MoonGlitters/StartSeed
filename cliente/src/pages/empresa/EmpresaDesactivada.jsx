import React from "react";
import { Link } from "react-router-dom";
import { Ban } from "lucide-react";

const EmpresaDesactivada = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <Ban className="w-16 h-16 text-amber-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Tu empresa ha sido desactivada
      </h1>
      <p className="text-gray-600 max-w-md mb-6">
        Un administrador ha desactivado temporalmente tu empresa. 
        Mientras esté inactiva, no podrás acceder al panel de gestión ni publicar productos.
      </p>
      <Link
        to="/"
        className="bg-emerald-600 text-white px-5 py-2 rounded hover:bg-emerald-700 transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
};

export default EmpresaDesactivada;
