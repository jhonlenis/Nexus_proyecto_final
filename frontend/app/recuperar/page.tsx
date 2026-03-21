// cspell:disable
"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function RecuperarPage() {
  const [paso, setPaso] = useState(1); // 1: Correo, 2: Código y Nueva Clave
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // PASO 1: Solicitar código 2FA
  const solicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/recuperar", {
        method: "POST",
        body: JSON.stringify({ correo }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje({ texto: "Código generado. Revisa la consola de VS Code", tipo: "exito" });
        setPaso(2);
      } else {
        setMensaje({ texto: data.error, tipo: "error" });
      }
    } catch (e) { setMensaje({ texto: "Error de conexión", tipo: "error" }); }
  };

  // PASO 2: Verificar 2FA y cambiar clave
  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/reset", {
        method: "PATCH",
        body: JSON.stringify({ correo, codigo, nuevaPassword }),
      });
      if (res.ok) {
        setMensaje({ texto: "Contraseña actualizada. Ya puedes iniciar sesión", tipo: "exito" });
        setTimeout(() => window.location.href = "/login", 2000);
      } else {
        const data = await res.json();
        setMensaje({ texto: data.error, tipo: "error" });
      }
    } catch (e) { setMensaje({ texto: "Error al actualizar", tipo: "error" }); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#111] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
        
        {/* Decoración Neón */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-600/10 rounded-full blur-[80px]"></div>

        <div className="text-center mb-10">
          <Image src="/Sena Logo.png" alt="Sena" width={60} height={60} className="invert mx-auto mb-4" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
            Seguridad <span className="text-green-500">2FA</span>
          </h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase mt-2 tracking-widest">
            {paso === 1 ? "Verificación de Identidad" : "Establecer nueva contraseña"}
          </p>
        </div>

        {mensaje.texto && (
          <div className={`mb-6 p-4 rounded-xl text-[10px] font-black uppercase text-center border ${
            mensaje.tipo === "exito" ? "bg-green-600/10 border-green-600 text-green-500" : "bg-red-600/10 border-red-600 text-red-500"
          }`}>
            {mensaje.texto}
          </div>
        )}

        {paso === 1 ? (
          <form onSubmit={solicitarCodigo} className="space-y-4">
            <input 
              type="email" placeholder="TU CORREO REGISTRADO" required
              className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-green-500 text-white text-sm"
              value={correo} onChange={(e) => setCorreo(e.target.value)}
            />
            <button className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-xs hover:bg-green-500 transition-all shadow-xl">
              Enviar Código
            </button>
          </form>
        ) : (
          <form onSubmit={cambiarPassword} className="space-y-4">
            <input 
              type="text" placeholder="CÓDIGO DE 6 DÍGITOS" required
              className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-yellow-500 text-white text-center font-mono text-xl tracking-[0.5em]"
              value={codigo} onChange={(e) => setCodigo(e.target.value)}
            />
            <input 
              type="password" placeholder="NUEVA CONTRASEÑA" required
              className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-green-500 text-white text-sm"
              value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)}
            />
            <button className="w-full bg-green-600 text-white py-4 rounded-xl font-black uppercase text-xs shadow-xl active:scale-95">
              Confirmar Cambio
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="text-[10px] font-black text-gray-600 uppercase hover:text-white transition-all">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}