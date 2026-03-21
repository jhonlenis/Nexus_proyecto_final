"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-4">
            <Image src="/Sena Logo.png" alt="Sena Logo" width={50} height={50} className="hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 leading-none">SENA</span>
              <span className="text-xs font-bold text-green-600 tracking-widest uppercase">Un Clic</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-green-600 flex items-center gap-2 transition-colors">
              🏠 Inicio
            </Link>
            <Link href="/cursos" className="text-sm font-bold text-slate-600 hover:text-green-600 flex items-center gap-2 transition-colors">
              📚 Programas
            </Link>
            <Link href="/chatbot" className="text-sm font-bold text-slate-600 hover:text-green-600 flex items-center gap-2 transition-colors">
              🤖 ChatBot
            </Link>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            <button className="bg-red-50 text-red-600 px-5 py-2 rounded-full text-xs font-black uppercase hover:bg-red-100 transition-all">
              Salir
            </button>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 text-2xl">
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-xl">
          <Link href="/dashboard" className="block text-sm font-bold p-2 text-slate-600">🏠 Inicio</Link>
          <Link href="/cursos" className="block text-sm font-bold p-2 text-slate-600">📚 Programas</Link>
          <Link href="/chatbot" className="block text-sm font-bold p-2 text-slate-600">🤖 ChatBot</Link>
          <button className="w-full text-left text-sm font-black text-red-600 p-2">SALIR</button>
        </div>
      )}
    </nav>
  );
};