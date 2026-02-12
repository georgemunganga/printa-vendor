import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

export const BackButton = ({ onClick, className = "", ariaLabel = "Go back" }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`flex w-10 h-10 items-center justify-center rounded-xl bg-printa-red text-white hover:bg-printa-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-printa-red focus-visible:ring-offset-2 focus-visible:ring-offset-white ${className}`}
    >
      <ArrowLeft size={18} />
    </button>
  );
};
