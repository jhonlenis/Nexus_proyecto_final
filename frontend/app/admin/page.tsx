// cspell:disable
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  correo_personal: string;
  rol: string;
}

interface Programa {
  id: number;
  nombre: string;
  sector: string;
}

export default function AdminControlPanel() {
  const [seccion, setSeccion] = useState<"usuarios" | "programas">("programas");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [cargando, setCargando] = useState(true);

  // NOTIFICACIONES
  const [notificacion, setNotificacion] = useState<{ msg: string; tipo: "exito" | "error" | "info" } | null>(null);

  // ESTADOS FORMULARIO
  const [nombreP, setNombreP] = useState("");
  const [sectorP, setSectorP] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const mostrarMensaje = (msg: string, tipo: "exito" | "error" | "info" = "exito") => {
    setNotificacion({ msg, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  const cargarInformacion = useCallback(async () => {
    try {
      setCargando(true);
      const [resU, resP] = await Promise.all([
        fetch("/api/admin/usuarios"),
        fetch("/api/admin/programas") 
      ]);
      if (resU.ok) setUsuarios(await resU.json());
      if (resP.ok) setProgramas(await resP.json());
    } catch (e) {
      mostrarMensaje("Error de sincronización", "error");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarInformacion();
  }, [cargarInformacion]);

  // GESTIÓN DE ROLES
  const cambiarRol = async (id: number, nuevoRol: string) => {
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nuevoRol })
      });
      if (res.ok) {
        mostrarMensaje(`Rol actualizado: ${nuevoRol}`, "exito");
        cargarInformacion();
      }
    } catch (e) {
      mostrarMensaje("Error al cambiar rol", "error");
    }
  };

  // GESTIÓN DE PROGRAMAS
  const manejarEnvioPrograma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreP || !sectorP) return mostrarMensaje("Faltan datos", "error");

    const metodo = editandoId ? "PUT" : "POST";
    const cuerpo = editandoId ? { id: editandoId, nombre: nombreP, sector: sectorP } : { nombre: nombreP, sector: sectorP };

    try {
      const res = await fetch("/api/admin/programas", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo)
      });

      if (res.ok) {
        mostrarMensaje(editandoId ? "Cambios guardados" : "Programa creado");
        setNombreP(""); setSectorP(""); setEditandoId(null);
        cargarInformacion();
      }
    } catch (e) { mostrarMensaje("Error en MySQL", "error"); }
  };

  const eliminarPrograma = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/programas?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        mostrarMensaje("Registro eliminado", "info");
        cargarInformacion();
      }
    } catch (e) { mostrarMensaje("Error al borrar", "error"); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex font-sans relative">
      
      {/* TOAST NOTIFICATION */}
      {notificacion && (
        <div className={`fixed top-10 right-10 z-[200] px-6 py-4 rounded-2xl font-black uppercase text-[10px] shadow-2xl animate-in slide-in-from-right duration-300 border ${
          notificacion.tipo === "exito" ? "bg-green-600 border-green-400 text-white" : 
          notificacion.tipo === "error" ? "bg-red-600 border-red-400 text-white" : 
          "bg-blue-600 border-blue-400 text-white"
        }`}>
          {notificacion.tipo === "exito" && "✅ "}
          {notificacion.tipo === "error" && "❌ "}
          {notificacion.tipo === "info" && "🗑️ "}
          {notificacion.msg}
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#111] border-r border-green-900/30 p-6 flex flex-col shadow-2xl">
        <div className="flex items-center gap-3 mb-10">
          <Image src="/Sena Logo.png" alt="Sena" width={40} height={40} className="invert" />
          <span className="font-black text-xl tracking-tighter uppercase leading-none">ADMIN <span className="text-green-500 block">CONTROL</span></span>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setSeccion("programas")} className={`w-full text-left p-4 rounded-xl font-black transition-all ${seccion === "programas" ? "bg-green-600 text-white shadow-lg shadow-green-900/40" : "text-gray-400 hover:bg-white/5"}`}>📦 Programas</button>
          <button onClick={() => setSeccion("usuarios")} className={`w-full text-left p-4 rounded-xl font-black transition-all ${seccion === "usuarios" ? "bg-green-600 text-white shadow-lg shadow-green-900/40" : "text-gray-400 hover:bg-white/5"}`}>👥 Usuarios</button>
        </nav>
        <Link href="/dashboard" className="mt-auto block text-center p-3 text-[10px] font-black uppercase border border-gray-800 rounded-lg hover:bg-white hover:text-black transition-all">Regresar</Link>
      </aside>

      {/* MAIN */}
      <main className="ml-64 flex-1 p-10">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">Panel <span className="text-green-500">Administrativo</span></h1>
            <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold italic">Alexander Holguín • ADSO 2026</p>
          </div>
          <div className="bg-[#151515] px-5 py-2 rounded-full border border-green-500/20 text-[10px] font-black text-green-500 uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Sistema Online
          </div>
        </header>

        {/* SECCIÓN USUARIOS (RESTABLECIDA) */}
        {seccion === "usuarios" && (
          <div className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in">
            <table className="w-full text-left text-sm text-white">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Aprendiz / Usuario</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Rol Actual</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <div className="font-bold uppercase text-xs">{u.nombres} {u.apellidos}</div>
                      <div className="text-gray-500 text-[10px]">{u.correo_personal}</div>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${
                        u.rol === "Administrador" ? "bg-green-500 text-black shadow-lg shadow-green-500/20" : 
                        u.rol === "Coordinador" ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" : 
                        "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>{u.rol}</span>
                    </td>
                    <td className="p-6 text-right">
                      <select 
                        onChange={(e) => cambiarRol(u.id, e.target.value)} 
                        className="bg-black border border-white/10 rounded-lg p-2 text-[10px] font-black text-white cursor-pointer outline-none focus:border-green-500" 
                        defaultValue={u.rol}
                      >
                        <option value="Aprendiz">Aprendiz</option>
                        <option value="Coordinador">Coordinador</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SECCIÓN PROGRAMAS */}
        {seccion === "programas" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            <form onSubmit={manejarEnvioPrograma} className={`bg-[#111] p-8 rounded-[2.5rem] border shadow-2xl transition-all ${editandoId ? 'border-yellow-500' : 'border-white/5 border-t-green-600 border-t-4'}`}>
              <h3 className="text-[10px] font-black uppercase mb-6 text-gray-500 tracking-widest">{editandoId ? "⚠️ Editando Programa..." : "Publicar nuevo programa"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nombre" className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-green-500 text-sm" value={nombreP} onChange={(e) => setNombreP(e.target.value)} />
                <select className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-green-500 text-sm font-bold" value={sectorP} onChange={(e) => setSectorP(e.target.value)}>
                  <option value="">Seleccione Sector...</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Salud">Salud</option>
                  <option value="Agro / Ambiental">Agro / Ambiental</option>
                  <option value="Gastronomía">Gastronomía</option>
                  <option value="Idiomas">Idiomas</option>
                </select>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className={`flex-1 py-4 rounded-xl font-black uppercase text-[11px] shadow-xl ${editandoId ? 'bg-yellow-500 text-black' : 'bg-white text-black hover:bg-green-600 hover:text-white transition-all'}`}>
                  {editandoId ? "Actualizar Registro" : "Guardar en MySQL"}
                </button>
                {editandoId && (
                  <button type="button" onClick={() => { setEditandoId(null); setNombreP(""); setSectorP(""); }} className="px-8 bg-white/5 text-white rounded-xl font-black uppercase text-[10px] hover:bg-red-600">Cancelar</button>
                )}
              </div>
            </form>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programas.map((p) => (
                <div key={p.id} className={`bg-[#111] border rounded-[2rem] p-8 transition-all shadow-xl group ${editandoId === p.id ? 'border-yellow-500' : 'border-white/5'}`}>
                  <h3 className="font-black text-xl mb-3 uppercase italic text-white leading-tight">{p.nombre}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Sector: {p.sector}</p>
                  <div className="flex gap-2 pt-4 border-t border-white/5">
                    <button onClick={() => { setEditandoId(p.id); setNombreP(p.nombre); setSectorP(p.sector); window.scrollTo({top:0, behavior:'smooth'}); }} className="flex-1 py-2 bg-yellow-500/10 text-yellow-500 rounded-xl hover:bg-yellow-500 hover:text-black transition-all font-black text-[9px] uppercase">Editar ✏️</button>
                    <button onClick={() => eliminarPrograma(p.id)} className="flex-1 py-2 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all font-black text-[9px] uppercase">Borrar 🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}