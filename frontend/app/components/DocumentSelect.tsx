interface DocumentProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}

export const DocumentSelect = ({ value, onChange, required = true }: DocumentProps) => (
  <div className="w-full">
    <label className="block text-sm font-bold text-black mb-1">Tipo de Documento</label>
    <select 
      value={value} // Agregado
      onChange={onChange} // Agregado
      required={required}
      className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-black outline-none focus:ring-2 focus:ring-green-500"
    >
      <option value="" className="text-black">Selecciona una opción</option>
      <option value="Cedula">Cedula</option>
      <option value="Tarjeta de identidad">Tarjeta de identidad</option>
      <option value="Pasaporte">Pasaporte</option>
      <option value="Cedula de extranjeria">Cedula de extranjeria</option>
      <option value="PEP">PEP</option>
      <option value="Permiso por proteccion temporal">Permiso por proteccion temporal</option>
    </select>
  </div>
);