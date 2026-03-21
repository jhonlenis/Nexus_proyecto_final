"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomInput } from '@/components/CustomInput';
import { DocumentSelect } from '@/components/DocumentSelect';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', tipo_documento: '',
    numero_documento: '', correo_personal: '', rol: 'Aprendiz'
  });
  const [password, setPassword] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const onlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, password }),
      });

      if (response.ok) {
        setEnviado(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al crear la cuenta');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6 py-12">
      <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-lg w-full border border-green-100 relative z-10">
        {!enviado ? (
          <>
            <Link href="/" className="text-black text-sm font-bold flex items-center mb-6 hover:text-green-700">
              ← Volver al inicio
            </Link>
            <h2 className="text-3xl font-extrabold text-black mb-6 text-center">Crear Cuenta</h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm font-bold">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput label="Nombres" type="text" placeholder="Tus nombres" value={formData.nombres} onChange={(e) => setFormData({...formData, nombres: e.target.value})} />
                <CustomInput label="Apellidos" type="text" placeholder="Tus apellidos" value={formData.apellidos} onChange={(e) => setFormData({...formData, apellidos: e.target.value})} />
              </div>
              <DocumentSelect value={formData.tipo_documento} onChange={(e) => setFormData({...formData, tipo_documento: e.target.value})} />
              <div>
                <CustomInput label="Número de Documento" type="text" placeholder="Ej: 1023456789" onKeyPress={onlyNumbers} value={formData.numero_documento} onChange={(e) => setFormData({...formData, numero_documento: e.target.value})} />
                <p className="mt-1 text-[10px] font-bold text-black italic text-center">* Solo números, sin puntos.</p>
              </div>
              <CustomInput label="Correo Personal" type="email" placeholder="ejemplo@correo.com" value={formData.correo_personal} onChange={(e) => setFormData({...formData, correo_personal: e.target.value})} />
              <CustomInput label="Contraseña" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              <PrimaryButton text="Registrarse" />
            </form>
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-black">¿Ya tienes cuenta? <Link href="/login" className="text-green-700 font-extrabold hover:underline">Inicia Sesión aquí</Link></p>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <h2 className="text-3xl font-extrabold text-black mb-4">¡Cuenta creada!</h2>
            <p className="text-black font-medium">Redirigiendo al inicio de sesión...</p>
          </div>
        )}
      </div>
    </main>
  );
}