import { type FC } from "react";

interface PreloaderProps {
  visible: boolean;
}

export const Preloader: FC<PreloaderProps> = ({ visible }) => (
  <div
    role="status"
    aria-live="polite"
    aria-hidden={!visible}
    className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${
      visible ? "bg-white opacity-100" : "pointer-events-none opacity-0"
    }`}
  >
    <div className={`flex flex-col items-center gap-3 ${visible ? "pointer-events-auto" : ""}`}>
      <img
        src="/printa-logo-red.webp"
        alt="Printa logo"
        className="h-24 w-auto animate-pulse"
        aria-hidden="true"
      />
    </div>
  </div>
);
