import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";


export const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-natural text-gray-800">
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-emerald-700"
        >
          Contáctanos
        </motion.h1>

        <p className="text-lg text-center text-gray-600 max-w-2xl mx-auto mb-12">
          ¿Tienes una idea, empresa o proyecto?  
          ¡Hablemos! En <strong>StartSeed</strong> queremos ayudarte a dar el siguiente paso.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Formulario */}
          <motion.form
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-emerald-100"
          >
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre completo"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Correo electrónico</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Mensaje</label>
              <textarea
                rows="4"
                placeholder="Cuéntanos en qué podemos ayudarte..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
              ></textarea>
            </div>

            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full rounded-xl mt-4">
              Enviar mensaje
            </Button>
          </motion.form>

          {/* Info de contacto */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center gap-6"
          >
            <div className="flex items-center gap-4">
              <Mail className="w-7 h-7 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-gray-800">Correo</h3>
                <p className="text-gray-600"> startseed@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="w-7 h-7 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-gray-800">Teléfono</h3>
                <p className="text-gray-600">+56 9 4222 288</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-7 h-7 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-gray-800">Ubicación</h3>
                <p className="text-gray-600">Chillán, Ñuble, Chile</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

