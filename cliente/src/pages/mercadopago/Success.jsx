import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export const Success = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center px-6">
    <CheckCircle className="w-20 h-20 text-green-600 mb-6 animate-bounce" />
    <h1 className="text-4xl font-extrabold text-green-700 mb-3">¡Pago exitoso!</h1>
    <p className="text-gray-700 mb-8 max-w-md">
      Tu compra fue confirmada correctamente. Pronto recibirás un correo con los detalles de tu pedido.
    </p>
    <Link
      to="/"
      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition cursor-pointer"
    >
      Volver al inicio
    </Link>
  </div>
);
