import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

export const Pending = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 text-center px-6">
    <Clock className="w-20 h-20 text-yellow-500 mb-6 animate-pulse" />
    <h1 className="text-4xl font-extrabold text-yellow-600 mb-3">Pago pendiente</h1>
    <p className="text-gray-700 mb-8 max-w-md">
      Tu pago está siendo procesado. Te avisaremos por correo cuando se confirme.
    </p>
    <Link
      to="/"
      className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md transition cursor-pointer"
    >
      Volver al inicio
    </Link>
  </div>
);
