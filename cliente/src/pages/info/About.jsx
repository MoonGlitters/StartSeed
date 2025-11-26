import { motion } from "framer-motion";
import { Users, Target, Lightbulb, Globe } from "lucide-react";

export const About = () => {
  return (
    <div className="min-h-screen bg-gradient-natural text-gray-800">
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-6 text-emerald-700"
        >
          Sobre Nosotros
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-700 text-center max-w-3xl mx-auto leading-relaxed"
        >
          En <strong>StartSeed</strong> creemos en el poder de las ideas. 
          Somos una plataforma nacida en <strong>Ñuble, Chile</strong>, 
          dedicada a conectar emprendedores con oportunidades reales 
          de crecimiento, innovación y colaboración. 
        </motion.p>

        <div className="mt-16 grid md:grid-cols-2 gap-10">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-emerald-100"
          >
            <Target className="w-10 h-10 text-emerald-600 mb-3" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Nuestra Misión</h2>
            <p className="text-gray-600 leading-relaxed">
              Impulsar a emprendedores, startups y pequeñas empresas 
              entregándoles herramientas tecnológicas, visibilidad 
              y redes de colaboración que potencien su impacto.
            </p>
          </motion.div>

          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-emerald-100"
          >
            <Globe className="w-10 h-10 text-emerald-600 mb-3" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Nuestra Visión</h2>
            <p className="text-gray-600 leading-relaxed">
              Ser una plataforma líder en innovación y apoyo al 
              emprendimiento digital en Latinoamérica, con base en 
              valores de comunidad, colaboración y desarrollo sostenible.
            </p>
          </motion.div>
        </div>

        <div className="mt-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Nuestro Equipo
          </motion.h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            Somos un grupo diverso de emprendedores y desarrolladores, 
            que comparten una misma meta: 
            impulsar el ecosistema de innovación desde el sur de Chile.
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl shadow-md p-6 w-[230px] text-center border border-emerald-100"
              >
                <Users className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800">Integrante {i}</h3>
                <p className="text-sm text-gray-500">Rol / especialidad</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

