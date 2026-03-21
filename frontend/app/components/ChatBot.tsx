'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface ChatBotProps {
  nombreUsuario: string;
}

export default function ChatBot({ nombreUsuario }: ChatBotProps) {
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState<{ yo: boolean, texto: string, conBoton?: boolean }[]>([]);
  const [cargando, setCargando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChat([
      { yo: false, texto: `👋 ¡Hola! Soy el asistente de SENA a un Clic.\n\n¿En qué te puedo ayudar hoy, ${nombreUsuario}?` }
    ]);
  }, [nombreUsuario]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const enviar = async (mensajeForzado?: string) => {
    const textoAEnviar = mensajeForzado || msg;
    if (!textoAEnviar.trim() || cargando) return;
    
    const nuevoChatConUsuario = [...chat, { yo: true, texto: textoAEnviar }];
    setChat(nuevoChatConUsuario);
    setMsg('');
    setCargando(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            mensaje: textoAEnviar,
            usuarioActual: nombreUsuario 
        }),
      });
      
      const data = await res.json();
      
      setChat([...nuevoChatConUsuario, { 
        yo: false, 
        texto: data.respuesta, 
        conBoton: data.mostrarBoton 
      }]);
    } catch (e) {
      setChat([...nuevoChatConUsuario, { yo: false, texto: '❌ Error de conexión.' }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100]">
      <button 
        onClick={() => setAbierto(!abierto)}
        className={`${abierto ? 'bg-red-500 rotate-90' : 'bg-green-600'} text-white w-14 h-14 rounded-full shadow-2xl transition-all flex items-center justify-center text-2xl hover:scale-110`}
      >
        {abierto ? '✕' : '💬'}
      </button>

      {abierto && (
        <div className="absolute bottom-16 right-0 w-[320px] md:w-[380px] bg-white border border-gray-100 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          
          <div className="bg-green-600 p-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
            <div>
              <h3 className="text-white font-black text-xs uppercase tracking-widest leading-none">Asistente Virtual</h3>
              <p className="text-green-100 text-[10px] font-bold uppercase mt-1 italic">{nombreUsuario}</p>
            </div>
          </div>

          <div ref={scrollRef} className="h-[400px] p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
            {chat.map((c, i) => (
              <div key={i} className={`flex ${c.yo ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-[1.5rem] max-w-[85%] text-sm font-medium shadow-sm ${
                  c.yo ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-line leading-relaxed">{c.texto}</p>
                  
                  {/* CORRECCIÓN: El botón solo aparece si conBoton es true Y es el ÚLTIMO mensaje */}
                  {!c.yo && c.conBoton && i === chat.length - 1 && (
                    <Link 
                      href="/dashboard" 
                      onClick={() => setAbierto(false)} 
                      className="block mt-4 text-center bg-black text-white py-3 rounded-xl font-black text-[10px] uppercase hover:bg-green-700 transition-colors"
                    >
                      🚀 Inscribirme ahora
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {cargando && (
              <div className="text-left animate-pulse text-gray-400 text-[10px] font-bold uppercase ml-2">
                Buscando en Sofía Plus...
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
            <button 
              onClick={() => enviar('menu')}
              disabled={cargando}
              className="bg-gray-100 p-3 rounded-2xl hover:bg-green-100 transition-colors text-lg shadow-sm"
              title="Volver al menú"
            >
              🏠
            </button>

            <input 
              value={msg} 
              onChange={e => setMsg(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && enviar()} 
              className="flex-1 outline-none text-xs font-bold bg-gray-50 p-4 rounded-2xl text-black border border-transparent focus:border-green-200" 
              placeholder="Escribe el programa o área..." 
            />
            
            <button 
              onClick={() => enviar()} 
              disabled={cargando}
              className="bg-green-600 text-white px-5 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-black transition-all"
            >
              Ir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}