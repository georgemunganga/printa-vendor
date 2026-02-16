import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface LiveFeedTopBarProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const PADDING = 3;

// Desktop
const TRACK_LG = 130;
const KNOB_LG = 62;
const MAX_LG = TRACK_LG - KNOB_LG - PADDING * 2;

// Mobile
const TRACK_SM = 90;
const KNOB_SM = 42;
const MAX_SM = TRACK_SM - KNOB_SM - PADDING * 2;

const MD_BREAKPOINT = 768;

export const LiveFeedTopBar: React.FC<LiveFeedTopBarProps> = ({
  isOnline,
  onToggleOnline,
  soundEnabled,
  onToggleSound,
}) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MD_BREAKPOINT : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MD_BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const trackWidth = isMobile ? TRACK_SM : TRACK_LG;
  const knobWidth = isMobile ? KNOB_SM : KNOB_LG;
  const maxX = isMobile ? MAX_SM : MAX_LG;

  const x = useMotionValue(isOnline ? maxX : 0);
  const [isDragging, setIsDragging] = useState(false);
  const wasOnlineRef = useRef(isOnline);
  const [knobLabel, setKnobLabel] = useState(isOnline ? "Online" : "Offline");

  // Snap to correct position when breakpoint changes
  useEffect(() => {
    const target = wasOnlineRef.current ? maxX : 0;
    animate(x, target, { type: "spring", stiffness: 500, damping: 40 });
  }, [maxX, x]);

  // Update knob label as it crosses midpoint
  useEffect(() => {
    const unsubscribe = x.on("change", (latest) => {
      setKnobLabel(latest > maxX / 2 ? "Online" : "Offline");
    });
    return unsubscribe;
  }, [x, maxX]);

  const progress = useTransform(x, [0, maxX], [0, 1]);

  const trackBg = useTransform(
    progress,
    [0, 0.4, 0.6, 1],
    ["rgb(255, 28, 28)", "rgb(209, 213, 219)", "rgb(209, 213, 219)", "rgb(16, 185, 61)"]
  );

  const trackBorder = useTransform(
    progress,
    [0, 0.4, 0.6, 1],
    ["rgb(255, 0, 0)", "rgb(229, 235, 233)", "rgb(229, 235, 233)", "rgb(25, 158, 63)"]
  );

  const knobTextColor = useTransform(
    progress,
    [0, 0.45, 0.55, 1],
    ["rgb(255, 0, 0)", "rgb(107, 114, 128)", "rgb(107, 114, 128)", "rgb(16, 185, 58)"]
  );

  const knobShadow = useTransform(
    progress,
    [0, 0.5, 1],
    [
      "0 2px 8px rgba(239,68,68,0.2)",
      "0 2px 10px rgba(0,0,0,0.12)",
      "0 2px 8px rgba(16,185,129,0.2)",
    ]
  );

  const snapTo = useCallback(
    (target: number, shouldToggle: boolean) => {
      animate(x, target, {
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
        onComplete: () => {
          if (shouldToggle) onToggleOnline();
        },
      });
    },
    [x, onToggleOnline]
  );

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = () => {
    setIsDragging(false);
    const currentX = x.get();
    if (currentX > maxX / 2) {
      const shouldToggle = !wasOnlineRef.current;
      wasOnlineRef.current = true;
      snapTo(maxX, shouldToggle);
    } else {
      const shouldToggle = wasOnlineRef.current;
      wasOnlineRef.current = false;
      snapTo(0, shouldToggle);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    e.stopPropagation();
    const newOnline = !isOnline;
    wasOnlineRef.current = newOnline;
    snapTo(newOnline ? maxX : 0, true);
  };

  return (
    <div className="flex items-center gap-2 md:gap-3">
      {/* Draggable toggle switch */}
      <motion.div
        onClick={handleClick}
        style={{ backgroundColor: trackBg, borderColor: trackBorder, width: trackWidth }}
        className="relative flex items-center h-[36px] md:h-[42px] rounded-xl border cursor-pointer select-none overflow-hidden"
      >
        <div className="relative flex items-center w-full h-full" style={{ padding: PADDING }}>
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: maxX }}
            dragElastic={0.03}
            dragMomentum={false}
            style={{ x, width: knobWidth, boxShadow: knobShadow }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="relative z-10 flex items-center justify-center h-[30px] md:h-9 rounded-[10px] bg-white cursor-grab active:cursor-grabbing"
          >
            <motion.span
              style={{ color: knobTextColor }}
              className="text-[9px] md:text-[10px] font-bold select-none pointer-events-none uppercase tracking-wide"
            >
              {knobLabel}
            </motion.span>
          </motion.div>
        </div>
      </motion.div>

      {/* Sound toggle */}
      <button
        onClick={onToggleSound}
        className="flex items-center justify-center h-[36px] w-[36px] md:h-9 md:w-9 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95 transition-all bg-white shrink-0"
        aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
      >
        {soundEnabled ? <Volume2 size={14} className="md:w-4 md:h-4" /> : <VolumeX size={14} className="md:w-4 md:h-4" />}
      </button>
    </div>
  );
};
