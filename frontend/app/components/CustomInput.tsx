interface InputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string; // Agregado
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Agregado
  required?: boolean;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const CustomInput = ({ label, type, placeholder, value, onChange, required = true, onKeyPress }: InputProps) => (
  <div className="w-full">
    <label className="block text-sm font-bold text-black mb-1">{label}</label>
    <input 
      type={type} 
      value={value} // Agregado
      onChange={onChange} // Agregado
      onKeyPress={onKeyPress}
      required={required}
      className="w-full px-4 py-2 rounded-xl border border-gray-300 text-black outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-400 transition-all" 
      placeholder={placeholder} 
    />
  </div>
);