"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
export default function ScrollDown() {
  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setShowArrow(window.scrollY < 50);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {showArrow && (
        <motion.button
          onClick={() => {
            const el = document.querySelector("#intro");
            if (!el) return;
            const y = el.getBoundingClientRect().top + window.pageYOffset;

            window.scrollTo({
              top: y,
              behavior: "smooth",
            });
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute cursor-pointer bottom-10 left-1/2 -translate-x-1/2 z-20
             flex flex-col items-center text-white/70 hover:text-primary transition"
          aria-label="Scroll down"
        >
          <ArrowDown className="w-6 h-6 animate-bounce" />
        </motion.button>
      )}
    </>
  );
}
