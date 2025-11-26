import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Star, UserCircle } from "lucide-react";

export const ComentariosProducto = ({ id_producto }) => {
  const { backendUrl } = useContext(AppContext);
  const [comentarios, setComentarios] = useState([]);
  const [contenido, setContenido] = useState("");
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [promedio, setPromedio] = useState(null);
  const [loading, setLoading] = useState(true);

  //  Obtener comentarios
  const fetchComentarios = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/comentario/producto/${id_producto}`);
      if (data?.success) setComentarios(data.comentarios);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar comentarios");
    } finally {
      setLoading(false);
    }
  };

  //  Obtener promedio
  const fetchPromedio = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/comentario/promedio_pro/${id_producto}`);
      if (data?.success) setPromedio(data.promedio);
    } catch (err) {
      console.error(err);
    }
  };

  //  Crear comentario
  const enviarComentario = async (e) => {
    e.preventDefault();
    if (!contenido.trim() || calificacion === 0) {
      toast.warn("Completa todos los campos");
      return;
    }

    try {
      await axios.post(`${backendUrl}/api/comentario/comentar_pro`, {
        id_producto,
        contenido,
        calificacion,
      });
      toast.success("Comentario enviado");
      setContenido("");
      setCalificacion(0);
      fetchComentarios();
      fetchPromedio();
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  useEffect(() => {
    fetchComentarios();
    fetchPromedio();
  }, [id_producto]);

  return (
    <div className="max-w-4xl mx-auto mt-16 w-full">
      <h2 className="text-2xl font-bold text-emerald-800 mb-6 text-center">
        Opiniones del producto
      </h2>

      {/* Promedio */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 ${
                promedio && i < Math.round(promedio)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-gray-700 mt-1 text-sm">
        {promedio && !isNaN(parseFloat(promedio))
            ? `${parseFloat(promedio).toFixed(1)} / 5`
            : "Sin calificaciones"}
        </p>
      </div>
      {/* Formulario de nuevo comentario */}
      <form
        onSubmit={enviarComentario}
        className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 mb-8"
      >
        <h3 className="text-lg font-semibold text-emerald-700 mb-3">
          Deja tu reseña
        </h3>

        {/* Estrellas interactivas */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => {
            const value = i + 1;
            return (
              <Star
                key={i}
                onClick={() => setCalificacion(value)}
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                className={`w-7 h-7 cursor-pointer transition-transform duration-200 ${
                  value <= (hover || calificacion)
                    ? "text-yellow-400 fill-yellow-400 scale-110"
                    : "text-gray-300"
                }`}
              />
            );
          })}
        </div>

        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribe tu comentario..."
          className="w-full border border-emerald-200 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-gray-700"
          rows={3}
        />

        <Button
          type="submit"
          className="mt-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-all duration-300"
        >
          Enviar comentario
        </Button>
      </form>

      {/* Lista de comentarios */}
      {loading ? (
        <p className="text-gray-500 italic text-center">Cargando comentarios...</p>
      ) : comentarios.length === 0 ? (
        <p className="text-gray-500 italic text-center">Aún no hay comentarios.</p>
      ) : (
        <div className="space-y-4">
          {comentarios.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex gap-4 items-start hover:shadow-md transition-all"
            >
              {/* Avatar y nombre */}
              <div className="flex-shrink-0">
                <UserCircle className="w-10 h-10 text-emerald-600" />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-emerald-800">
                    {c.usuario?.nombre || "Usuario"}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Estrellas */}
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < c.calificacion
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-700 text-sm">{c.contenido}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
