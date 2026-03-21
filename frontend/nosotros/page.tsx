import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Importamos Link para la navegación

interface Integrante {
  nombre: string;
  rol: string;
  descripcion: string;
  foto: string; 
}

const NosotrosPage = () => {
  const equipo: Integrante[] = [
    {
      nombre: "Jhon Alexander Lenis Holguín",
      rol: "Líder de Proyecto / Frontend & IA",
      descripcion: "Líder encargado de la interfaz conversacional y el diseño de la experiencia del aprendiz.",
      foto: "/jhon.jpeg" 
    },
    {
      nombre: "Juan Andrés Jaramillo García",
      rol: "Desarrollador Backend",
      descripcion: "Responsable de la base de datos de programas y la lógica de seguridad del sistema.",
      foto: "/andres.jpeg" 
    },
    {
      nombre: "Mariana Bastidas Quintero",
      rol: "Analista de Requerimientos",
      descripcion: "Encargada de la documentación técnica y la validación de las necesidades del usuario.",
      foto: "/mariana.jpeg" 
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Botón de Regresar */}
      <div className="max-w-4xl mx-auto mb-6 relative z-20">
        <Link 
          href="/" 
          className="inline-flex items-center text-green-700 font-semibold hover:text-green-900 transition-colors bg-white/50 px-4 py-2 rounded-full border border-green-100 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Regresar al inicio
        </Link>
      </div>

      {/* Elementos Decorativos de Fondo */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Encabezado */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-green-700 sm:text-5xl drop-shadow-sm">
            SENA a un Clic
          </h1>
          <p className="mt-4 text-xl text-gray-600 font-medium">
            Asistente Inteligente para la Gestión Académica - CTMA
          </p>
        </section>

        {/* Sección Sobre el Proyecto */}
        <section className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sobre el Proyecto</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            SENA a un Clic es una plataforma diseñada para orientar a los aprendices en sus procesos administrativos. 
            A través de un ChatBot inteligente, brindamos una guía paso a paso para que el usuario sepa exactamente 
            cómo realizar sus trámites sin perderse en la plataforma oficial.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-gray-700"><strong>Inscripciones:</strong> El ChatBot explica detalladamente cómo solicitar el ingreso a los programas de formación.</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-700"><strong>Programas de Formación:</strong> Ayuda a consultar y entender la oferta educativa disponible.</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-700"><strong>Dudas y Preguntas:</strong> Resuelve inquietudes sobre datos personales o éxito de inscripción.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-gray-700"><strong>Horarios:</strong> Guía al aprendiz sobre cómo consultar sus franjas horarias.</p>
            </div>
          </div>
        </section>

        {/* Sección Nuestro Equipo */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Nuestro Equipo</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {equipo.map((miembro, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border-b-4 border-green-600 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300">
                <div className="relative w-28 h-28 mb-4">
                  <Image 
                    src={miembro.foto}
                    alt={miembro.nombre}
                    fill
                    className="rounded-full object-cover border-4 border-green-50 shadow-inner"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{miembro.nombre}</h3>
                <p className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wider">{miembro.rol}</p>
                <p className="text-sm text-gray-500 italic">&quot;{miembro.descripcion}&quot;</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-16 text-center text-gray-400 text-sm relative z-10">
        © 2026 - Medellín, Antioquia
      </footer>
    </main>
  );
};

export default NosotrosPage;