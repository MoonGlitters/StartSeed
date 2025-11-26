import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

export const Footer = () => {
  return (
    <footer className="mt-28 bg-gradient-to-br from-emerald-700 via-green-700 to-amber-600 text-white py-12 px-6 relative z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 relative z-10">
        
        {/* Columna 1 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={assets.logo} alt="StartSeed" className="w-14 h-14 object-contain" />
            <h1 className="text-2xl font-extrabold tracking-wide text-white">StartSeed</h1>
          </div>
          <p className="text-sm text-green-50 leading-relaxed">
            Un marketplace creado para impulsar el talento local y conectar
            emprendedores con nuevas oportunidades. Creemos en el crecimiento
            sostenible, la innovación y el poder de las pequeñas empresas.
          </p>
        </div>

        {/* Columna 2 - Navegación */}
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Navegación</h2>
          <ul className="flex flex-col gap-2 text-green-50 text-sm">
            <li>
              <Link to="/" className="hover:text-amber-200 transition">Inicio</Link>
            </li>
            <li>
              <Link to="/empresas" className="hover:text-amber-200 transition">Empresas</Link>
            </li>
            <li>
              <Link to="/productos" className="hover:text-amber-200 transition">Productos</Link>
            </li>
            <li>
              <Link to="/sobre-nosotros" className="hover:text-amber-200 transition">Sobre Nosotros</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-amber-200 transition">Contacto</Link>
            </li>
          </ul>
        </div>

        {/* Columna 3 - Contacto */}
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Contáctanos</h2>
          <ul className="flex flex-col gap-2 text-green-50 text-sm">
            <li>📞 +56 9 4222 288</li>
            <li>📧 startseed@gmail.com</li>
            <li>📍 Ñuble, Chile</li>
          </ul>
          <div className="flex gap-3 mt-4">
            <a href="#" className="hover:scale-110 transition-transform">
              <img src="https://img.icons8.com/ios-filled/24/ffffff/facebook-new.png" alt="Facebook" />
            </a>
            <a href="#" className="hover:scale-110 transition-transform">
              <img src="https://img.icons8.com/ios-filled/24/ffffff/instagram-new.png" alt="Instagram" />
            </a>
            <a href="#" className="hover:scale-110 transition-transform">
              <img src="https://img.icons8.com/ios-filled/24/ffffff/linkedin.png" alt="LinkedIn" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-green-200/30 pt-4 text-center text-xs text-green-50 relative z-10">
        © 2025 StartSeed — Todos los derechos reservados.
      </div>
    </footer>
  );
};
