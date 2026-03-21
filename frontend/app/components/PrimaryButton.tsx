interface ButtonProps {
  text: string;
  type?: "button" | "submit";
  onClick?: () => void;
}

export const PrimaryButton = ({ text, type = "submit", onClick }: ButtonProps) => (
  <button 
    type={type}
    onClick={onClick}
    className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700 transition-all mt-4 transform hover:-translate-y-1"
  >
    {text}
  </button>
);