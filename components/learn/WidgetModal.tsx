"use client";

import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export function WidgetModal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Portal to <body> so the modal escapes the gallery's stacking/overflow
  // context and reliably sits above every panel.
  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(4,5,9,0.72)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="glass sheen scroll-fade max-h-[88vh] w-full max-w-[760px] overflow-y-auto rounded-3xl"
        style={{ boxShadow: "0 40px 100px -30px rgba(0,0,0,0.9)" }}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 pb-3 pt-5" style={{ background: "linear-gradient(180deg, var(--panel-solid) 75%, transparent)" }}>
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{title}</h2>
            {subtitle && <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--text-dim)" }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            style={{ color: "var(--text-dim)" }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 pb-6 pt-1">{children}</div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
