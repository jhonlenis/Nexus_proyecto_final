"use client";
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ChatBot from '@/app/components/ChatBot';
import Searchbar from "@/app/components/SearchBar";

interface Inscripcion {
  id: number;
  programa: string;
  fecha: string;
  id_usuario: number;
}

interface Categoria {
  id: number;
  nombre: string;
  label: string;
  cursos: string[];
}

interface Programa {
  id: number;
  nombre: string;
  sector: string;
}

export default function DashboardPage() {
  // ESTADOS
  const [busqueda, setBusqueda] = useState(''); // ✅ Estado corregido
  const [sectorActivo, setSectorActivo] = useState('Todos');
  const [programaSeleccionado, setProgramaSeleccionado] = useState<string | null>(null);
  const [inscritoExitoso, setInscritoExitoso] = useState(false);
  const [misInscripciones, setMisInscripciones] = useState<Inscripcion[]>([]);
  const [nombreUsuario, setNombreUsuario] = useState('Aprendiz');
  const [accesoEspecial, setAccesoEspecial] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // OBTENER PROGRAMAS
  const obtenerProgramas = async (): Promise<Programa[] | undefined> => {
    try {
      const res = await fetch('http://localhost:9000/api/programas');
      if (res.ok) return await res.json();
    } catch (error) {
      console.error("Error al obtener programas:", error);
    }
    return undefined;
  };

  // CARGAR CATEGORÍAS (Agrupamiento por sector)
  useEffect(() => {
    const cargarCategorias = async () => {
      const programasData = await obtenerProgramas();
      if (programasData) {
        const categoriasMap: { [key: string]: Categoria } = {};
        programasData.forEach((prog) => {
          const sector = prog.sector || "General";
          if (categoriasMap[sector]) {
            categoriasMap[sector].cursos.push(prog.nombre);
          } else {
            categoriasMap[sector] = {
              id: Math.random(),
              nombre: sector,
              label: sector,
              cursos: [prog.nombre]
            };
          }
        });
        setCategorias(Object.values(categoriasMap));
      }
    };
    cargarCategorias();
  }, []);

  // REFRESCAR INSCRIPCIONES
  const refrescarInscripciones = useCallback(async (id: number) => {
    try {
      const res = await fetch(`http://localhost:9000/api/inscripciones?usuario_id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setMisInscripciones(data);
      }
    } catch (e) {
      console.error("Error al refrescar inscripciones", e);
    }
  }, []);

  // INICIALIZAR SESIÓN
  useEffect(() => {
    const userString = localStorage.getItem('usuario');
    if (userString) {
      const user = JSON.parse(userString);
      setNombreUsuario(user.nombre);
      setUserId(user.id);
      if (user.rol === 'Administrador' || user.rol === 'Coordinador') {
        setAccesoEspecial(true);
      }
      refrescarInscripciones(user.id);
    }
  }, [refrescarInscripciones]);

  // MANEJAR INSCRIPCIÓN
  const manejarInscripcion = async () => {
    if (!programaSeleccionado || !userId) return;
    try {
      const response = await fetch('http://localhost:9000/api/inscripciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programa: programaSeleccionado,
          usuario_id: userId
        }),
      });

      if (response.ok) {
        setInscritoExitoso(true);
        await refrescarInscripciones(userId);
        setTimeout(() => {
          setInscritoExitoso(false);
          setProgramaSeleccionado(null);
        }, 2000);
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const nombresSectores = ["Todos", ...categorias.map(c => c.nombre)];

  return (
    <div className="min-h-screen w-full bg-white text-black font-sans">
      <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)' }} />

      <ChatBot nombreUsuario={nombreUsuario} userId={userId || 0} />

      {/* NAVBAR */}
      <nav className="w-full bg-white/95 border-b border-green-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Image src="/Sena Logo.png" alt="Sena Logo" width={45} height={45} />
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">SENA <span className="text-green-600">UN CLIC</span></h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase italic">Sesión de: {nombreUsuario}</p>
          </div>
        </div>

        {/* SEARCHBAR CONECTADA */}
        <div className="hidden md:flex bg-gray-50 border border-green-200 rounded-full px-5 py-2 items-center">
          <Searchbar onResultados={(texto) => setBusqueda(texto)} />
        </div>

        <Link href="/" onClick={() => localStorage.removeItem('usuario')} className="text-[10px] font-black text-red-600 uppercase border-2 border-red-600 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all">
          Cerrar Sesión
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-12">
        
        {/* TABLA DE INSCRIPCIONES (Solo si hay datos) */}
        {misInscripciones.length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-700">
             <h2 className="text-4xl font-black uppercase italic mb-8">Mis <span className="text-green-600">Programas</span></h2>
             <div className="bg-white border-2 border-black rounded-[2rem] overflow-hidden shadow-lg">
               <table className="w-full text-left">
                 <thead className="bg-black text-white text-[10px] uppercase font-black">
                   <tr>
                     <th className="p-5">ID</th>
                     <th className="p-5">Programa</th>
                     <th className="p-5 text-center">Estado</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 font-bold">
                   {misInscripciones.map((ins) => (
                     <tr key={ins.id} className="hover:bg-green-50 transition-colors">
                       <td className="p-5 text-gray-400 text-xs">#00{ins.id}</td>
                       <td className="p-5 text-sm uppercase italic">{ins.programa}</td>
                       <td className="p-5 text-center">
                         <span className="bg-green-600 text-white px-3 py-1 rounded-full text-[9px] uppercase font-black">Matriculado</span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </section>
        )}

        {/* FILTRO DE SECTORES */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-center">
          {nombresSectores.map((n) => (
            <button
              key={n}
              onClick={() => setSectorActivo(n)}
              className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border-2 ${sectorActivo === n ? "bg-green-600 border-green-600 text-white" : "bg-white border-green-100 text-black hover:border-green-400"}`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* LISTADO DE CURSOS DINÁMICO */}
        {categorias.map((cat) => {
          // FILTRAR POR TEXTO
          const coincidencias = cat.cursos.filter(c => 
            c.toLowerCase().includes(busqueda.toLowerCase())
          );

          // Lógica de visualización
          const mostrarSeccion = (sectorActivo === "Todos" || sectorActivo === cat.nombre) && coincidencias.length > 0;
          if (!mostrarSeccion) return null;

          return (
            <section key={cat.nombre} className="animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-3xl font-black uppercase italic mb-6 text-gray-800">{cat.label}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {coincidencias.map((curso, idx) => (
                  <div
                    key={idx} 
                    onClick={() => setProgramaSeleccionado(curso)}
                    className="cursor-pointer bg-white border-2 border-green-200 rounded-[2rem] p-6 flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
                    <h4 className="text-lg font-bold text-green-600 uppercase italic mb-4">{curso}</h4>
                    <p className="text-gray-400 text-[10px] font-black uppercase">Sector: {cat.nombre}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* MODAL DE INSCRIPCIÓN (Igual al tuyo pero limpio) */}
      {programaSeleccionado && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-4 border-green-600 rounded-[3rem] p-10 max-w-lg w-full animate-in zoom-in-95">
            {!inscritoExitoso ? (
              <>
                <h3 className="text-3xl font-black uppercase italic mb-6 text-center">Confirmar Inscripción</h3>
                <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-dashed border-gray-300 text-center">
                  <p className="text-green-600 text-xl font-black uppercase italic">{programaSeleccionado}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setProgramaSeleccionado(null)} className="flex-1 py-4 border-2 border-black rounded-2xl font-black uppercase text-xs">Cancelar</button>
                  <button onClick={manejarInscripcion} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg">Confirmar</button>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 animate-bounce">✓</div>
                <h4 className="text-2xl font-black uppercase italic">¡Inscrito con éxito!</h4>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}