import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

export const Failure = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-center px-6">
    <XCircle className="w-20 h-20 text-red-600 mb-6 animate-shake" />
    <h1 className="text-4xl font-extrabold text-red-700 mb-3">Pago fallido</h1>
    <p className="text-gray-700 mb-8 max-w-md">
      Ocurrió un error con tu pago. Por favor, intenta nuevamente o verifica tus datos.
    </p>
    <Link
      to="/"
      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition cursor-pointer"
    >
      Volver al inicio
    </Link>
  </div>
);
