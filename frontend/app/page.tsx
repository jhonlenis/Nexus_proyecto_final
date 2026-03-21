import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-4">
      {/* Decoración de fondo */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="relative bg-white shadow-2xl rounded-3xl p-8 md:p-12 max-w-2xl w-full border border-green-100 text-center">
        
        {/* Logo del proyecto */}
        <div className="flex justify-center mb-6">
          <Image 
            src="/Sena Logo.png" 
            alt="Logo SENA a un Clic"
            width={120}    
            height={120}
            className="drop-shadow-md object-contain"
            priority       
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          SENA a un <span className="text-green-600">Clic</span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
          La solución inteligente para orientarte en tus trámites académicos. 
          Pregúntale a nuestro asistente y optimiza tu tiempo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/nosotros" 
            className="flex items-center justify-center px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 hover:shadow-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Conócenos
          </Link>
          
          <Link 
            href="/registro" 
            className="flex items-center justify-center px-8 py-4 bg-white text-green-700 font-bold rounded-xl border-2 border-green-600 hover:bg-green-50 transition-all duration-300 transform hover:-translate-y-1"
          >
            Crear Cuenta
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-400">
          Proyecto desarrollado por aprendices del CTMA
        </p>
      </div>
      
      <footer className="mt-12 text-gray-500 text-sm">
        © 2026 - Derechos reservados. SENA
      </footer>
    </main>
  );
}