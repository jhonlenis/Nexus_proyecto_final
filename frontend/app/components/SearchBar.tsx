'use client'

import React, { useState } from 'react'

interface SearchbarProps {
  onResultados: (texto: string) => void;
}

export default function Searchbar({ onResultados }: SearchbarProps) {
  const [buscar, setBuscar] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBuscar(valor);
    onResultados(valor); // Enviamos el texto al padre en cada tecla
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="font-bold text-sm text-green-600">🔍</span>
      <input
        type="text"
        placeholder="Buscar programa..."
        className="bg-transparent outline-none text-sm font-bold w-64 text-black placeholder:text-gray-400"
        value={buscar}
        onChange={handleChange} 
      />
    </div>
  )
}