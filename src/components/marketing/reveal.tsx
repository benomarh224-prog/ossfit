"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, margin: "0px 0px -24px 0px" });
  const reduceMotion = useReducedMotion();
  return <motion.div ref={ref} className={className} initial={false} animate={{ y: reduceMotion || visible ? 0 : 14 }} transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}>{children}</motion.div>;
}
