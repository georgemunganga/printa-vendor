import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface LiveFeedTopBarProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const TRACK_WIDTH = 130;
const KNOB_WIDTH = 62;
const PADDING = 3;
const MAX_X = TRACK_WIDTH - KNOB_WIDTH - PADDING * 2;

export const LiveFeedTopBar: React.FC<LiveFeedTopBarProps> = ({
  isOnline,
  onToggleOnline,
  soundEnabled,
  onToggleSound,
}) => {
  const x = useMotionValue(isOnline ? MAX_X : 0);
  const [isDragging, setIsDragging] = useState(false);
  const wasOnlineRef = useRef(isOnline);
  const dragStartXRef = useRef(0);
  const [knobLabel, setKnobLabel] = useState(isOnline ? "Online" : "Offline");

  // Update knob label in real-time as it crosses midpoint
  useEffect(() => {
    const midpoint = MAX_X / 2;
    const unsubscribe = x.on("change", (latest) => {
      setKnobLabel(latest > midpoint ? "Online" : "Offline");
    });
    return unsubscribe;
  }, [x]);

  // Progress 0→1 from knob position
  const progress = useTransform(x, [0, MAX_X], [0, 1]);

  // Track color interpolation: red → neutral gray → green
  const trackBg = useTransform(
    progress,
    [0, 0.4, 0.6, 1],
    [
      "rgb(255, 28, 28)",
      "rgb(209, 213, 219)",
      "rgb(209, 213, 219)",
      "rgb(16, 185, 61)",
    ]
  );

  // Track border follows same color
  const trackBorder = useTransform(
    progress,
    [0, 0.4, 0.6, 1],
    [
      "rgb(255, 0, 0)",
      "rgb(229, 235, 233)",
      "rgb(229, 235, 233)",
      "rgb(25, 158, 63)",
    ]
  );

  // Knob text color based on position
  const knobTextColor = useTransform(
    progress,
    [0, 0.45, 0.55, 1],
    ["rgb(255, 0, 0)", "rgb(107, 114, 128)", "rgb(107, 114, 128)", "rgb(16, 185, 58)"]
  );

  // Knob shadow based on position
  const knobShadow = useTransform(
    progress,
    [0, 0.5, 1],
    [
      "0 2px 8px rgba(239,68,68,0.2)",
      "0 2px 10px rgba(0,0,0,0.12)",
      "0 2px 8px rgba(16,185,129,0.2)",
    ]
  );

  const snapTo = (target: number, shouldToggle: boolean) => {
    animate(x, target, {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.8,
      onComplete: () => {
        if (shouldToggle) {
          onToggleOnline();
        }
      },
    });
  };

  const handleDragStart = () => {
    setIsDragging(true);
    dragStartXRef.current = x.get();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const currentX = x.get();
    const midpoint = MAX_X / 2;

    if (currentX > midpoint) {
      const shouldToggle = !wasOnlineRef.current;
      wasOnlineRef.current = true;
      snapTo(MAX_X, shouldToggle);
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
    snapTo(newOnline ? MAX_X : 0, true);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Draggable toggle switch */}
      <motion.div
        onClick={handleClick}
        style={{
          backgroundColor: trackBg,
          borderColor: trackBorder,
          width: TRACK_WIDTH,
        }}
        className="relative flex items-center h-[42px] rounded-xl border cursor-pointer select-none overflow-hidden"
      >
        <div className="relative flex items-center w-full h-full" style={{ padding: PADDING }}>
          {/* Draggable knob */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: MAX_X }}
            dragElastic={0.03}
            dragMomentum={false}
            style={{ x, width: KNOB_WIDTH, boxShadow: knobShadow }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="relative z-10 flex items-center justify-center h-9 rounded-[10px] bg-white cursor-grab active:cursor-grabbing"
          >
            <motion.span
              style={{ color: knobTextColor }}
              className="text-[10px] font-bold select-none pointer-events-none uppercase tracking-wide"
            >
              {knobLabel}
            </motion.span>
          </motion.div>
        </div>
      </motion.div>

      {/* Sound toggle */}
      <button
        onClick={onToggleSound}
        className="flex items-center justify-center h-9 w-9 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95 transition-all bg-white"
        aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </div>
  );
};
