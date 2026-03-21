interface RoleProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const RoleSelect = ({ value, onChange }: RoleProps) => (
  <div className="w-full">
    <label className="block text-sm font-bold text-black mb-1">Rol en el Sistema</label>
    <select 
      value={value}
      onChange={onChange}
      required
      className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-black outline-none focus:ring-2 focus:ring-green-500"
    >
      <option value="Aprendiz">Aprendiz</option>
      <option value="Administrador">Administrador</option>
      <option value="Coordinador">Coordinador</option>
    </select>
  </div>
);