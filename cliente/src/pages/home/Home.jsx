import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Rocket, Users, Globe, Lightbulb, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import { AppContext } from "@/context/AppContext";
// Imágenes
import hero1 from "@/assets/home/hero-cover.png";
import hero2 from "@/assets/home/hero-cover-1.jpg";
import hero3 from "@/assets/home/gal-2.jpg";
import gal1 from "@/assets/home/gal-1.jpg";
import gal2 from "@/assets/home/gal-2.jpg";
import gal3 from "@/assets/home/gal-3.jpg";
import gal4 from "@/assets/home/gal-4.jpg";
import gal5 from "@/assets/home/gal-5.jpg";

export const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-natural text-gray-800 overflow-x-hidden">
      <Hero />
      <About />
      <MissionVision />
      <WhatWeDo />
      <Gallery />
      <JoinCTA />
    </div>
  );
};

/* ================================
   HERO SECCION
================================ */
const Hero = () => {
  const images = [hero1, hero2, hero3];
  const [index, setIndex] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 100]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () => setIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <section className="relative w-screen h-[85vh] overflow-hidden flex items-center justify-center select-none z-[5]">
      {/* Fondo */}
      <div className="absolute inset-0 z-[0] pointer-events-none">
        {images.map((src, i) => (
          <motion.img
            key={i}
            src={src}
            alt={`Hero ${i}`}
            style={{ y }}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: i === index ? 1 : 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 pointer-events-none" />
      </div>

      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-[20] text-center w-full px-6 pointer-events-auto"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg">
          Bienvenido a <span className="text-emerald-400">StartSeed</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
          Impulsamos el crecimiento de emprendedores y startups en Ñuble, Chile,
          conectándolos con oportunidades reales.
        </p>

        <div className="mt-8 flex justify-center gap-4 pointer-events-auto">
          <Link to="/sobre-nosotros">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 h-11 shadow-md cursor-pointer">
              Conócenos
            </Button>
          </Link>
          <Link to="/contact">
            <Button className="bg-white text-emerald-700 border border-emerald-100 hover:bg-emerald-50 rounded-xl px-6 h-11 shadow-md cursor-pointer">
              Contáctanos
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Flechas */}
      <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-4 md:px-8 z-[30] pointer-events-none">
        <button
          onClick={prevImage}
          className="p-2 md:p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all cursor-pointer pointer-events-auto"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextImage}
          className="p-2 md:p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all cursor-pointer pointer-events-auto"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-[30] pointer-events-auto">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
              i === index ? "bg-emerald-400 scale-110" : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

/* ================================
   ABOUT SECTION
================================ */
const About = () => (
  <section className="max-w-6xl mx-auto px-6 py-20 text-center">
    <motion.h2
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="text-3xl font-bold text-gray-900 mb-6"
    >
      ¿Quiénes somos?
    </motion.h2>
    <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
      StartSeed nació en Ñuble con la visión de fortalecer el ecosistema emprendedor de Chile,
      brindando herramientas digitales que conecten, inspiren y potencien a las nuevas generaciones de innovadores.
    </p>

    <div className="mt-10 grid md:grid-cols-3 gap-8">
      {[
        { icon: <Rocket className="w-8 h-8 text-emerald-600 mx-auto" />, title: "Innovación", desc: "Promovemos la tecnología y la creatividad como motor del cambio." },
        { icon: <Users className="w-8 h-8 text-emerald-600 mx-auto" />, title: "Comunidad", desc: "Construimos una red de apoyo entre emprendedores y mentores." },
        { icon: <Globe className="w-8 h-8 text-emerald-600 mx-auto" />, title: "Proyección", desc: "Ayudamos a startups a escalar y llegar a nuevos mercados." },
      ].map((item, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.05 }}
          className="bg-white shadow-md border border-emerald-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
        >
          {item.icon}
          <h3 className="mt-4 font-semibold text-gray-900 text-lg">{item.title}</h3>
          <p className="mt-2 text-gray-600 text-sm">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ================================
   MISSION / VISION
================================ */
const MissionVision = () => (
  <section className="bg-emerald-50 py-20 px-6">
    <div className="max-w-6xl mx-auto text-center">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-gray-900 mb-10"
      >
        Nuestra misión y visión
      </motion.h2>
      <div className="grid md:grid-cols-2 gap-10 text-left">
        <Card title="Misión" text="Impulsar a emprendedores y startups entregando herramientas tecnológicas que faciliten la gestión, el crecimiento y la conexión con inversionistas." />
        <Card title="Visión" text="Convertirnos en la plataforma líder de apoyo al emprendimiento digital en Latinoamérica, potenciando ideas con impacto social y económico." />
      </div>
    </div>
  </section>
);

const Card = ({ title, text }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-2xl shadow-md border border-emerald-100 p-8 hover:shadow-lg hover:-translate-y-1 transition-all"
  >
    <h3 className="font-bold text-emerald-700 text-xl mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{text}</p>
  </motion.div>
);

/* ================================
   WHAT WE DO
================================ */
const WhatWeDo = () => (
  <section className="max-w-6xl mx-auto px-6 py-20 text-center">
    <h2 className="text-3xl font-bold text-gray-900 mb-6">
      ¿Qué hacemos en StartSeed?
    </h2>
    <p className="max-w-3xl mx-auto text-gray-600 mb-10">
      Conectamos emprendedores y startups mediante una plataforma digital que promueve la innovación, visibilización y el desarrollo económico.
    </p>

    <div className="grid md:grid-cols-3 gap-8">
      {[
        { icon: <Lightbulb className="w-8 h-8 text-emerald-600 mx-auto" />, title: "Apoyo a ideas", desc: "Ayudamos a transformar ideas en proyectos reales y sostenibles." },
        { icon: <Users className="w-8 h-8 text-emerald-600 mx-auto" />, title: "Red de contactos", desc: "Fomentamos la colaboración y alianzas entre empresas." },
        { icon: <ArrowRight className="w-8 h-8 text-emerald-600 mx-auto" />, title: "Crecimiento", desc: "Brindamos visibilidad, orientación y acompañamiento constante." },
      ].map((item, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.05 }}
          className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-md hover:shadow-lg transition-all duration-300"
        >
          {item.icon}
          <h3 className="mt-3 font-semibold text-gray-900 text-lg">{item.title}</h3>
          <p className="mt-2 text-gray-600 text-sm">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ================================
   GALLERY SECTION
================================ */
const Gallery = () => {
  const imgs = [gal1, gal2, gal3, gal4, gal5];
  return (
    <section className="px-6 py-20 bg-emerald-50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Galería</h2>
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
          {imgs.map((src, i) => (
            <motion.div
              key={i}
              className="snap-start shrink-0 w-[300px] h-[200px] rounded-2xl overflow-hidden shadow-md border border-emerald-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <img src={src} alt={`StartSeed galería ${i}`} className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ================================
   CTA FINAL
================================ */
const JoinCTA = () => {
  const { userData } = useContext(AppContext); 

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 text-center">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl text-white p-10 shadow-lg"
      >
        <h2 className="text-3xl font-extrabold mb-4">
          Sé parte de la comunidad StartSeed
        </h2>
        <p className="text-emerald-50 mb-6">
          Únete a nuestra red de innovación y descubre nuevas oportunidades para
          crecer junto a otros emprendedores.
        </p>

        {userData ? (
          //  Si está logueado
          <Link to="/mi-perfil">
            <Button className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl px-8 py-3 font-semibold shadow cursor-pointer">
              Ir a mi perfil
            </Button>
          </Link>
        ) : (
          //  Si NO esta logueado
          <Link to="/registro">
            <Button className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl px-8 py-3 font-semibold shadow cursor-pointer">
              Unirme ahora
            </Button>
          </Link>
        )}
      </motion.div>
    </section>
  );
};
