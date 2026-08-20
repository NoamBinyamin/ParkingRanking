"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const POOP_COUNT = 18;
const LIFETIME_MS = 1800;

/** A confetti-style burst, but rising 💩 -- for when someone taps the "bad" zone. */
export function PoopRain({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  const poops = useMemo(
    () =>
      Array.from({ length: POOP_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.1 + Math.random() * 0.6,
        size: 22 + Math.random() * 20,
        rotate: (Math.random() - 0.5) * 180,
      })),
    []
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      onDone();
    }, LIFETIME_MS);
    return () => clearTimeout(timeout);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <div className="pointer-events-none fixed inset-0 z-[25] overflow-hidden" aria-hidden>
          {poops.map((poop) => (
            <motion.span
              key={poop.id}
              className="absolute bottom-0"
              style={{ left: `${poop.left}%`, fontSize: poop.size }}
              initial={{ y: "10vh", opacity: 0, rotate: 0 }}
              animate={{ y: "-120vh", opacity: [0, 1, 1, 0], rotate: poop.rotate }}
              transition={{ duration: poop.duration, delay: poop.delay, ease: "easeIn" }}
            >
              💩
            </motion.span>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
