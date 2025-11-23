import React, { useEffect } from "react";

export default function CustomModal({
  open,
  title,
  description,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmVariant = "primary", // primary | danger | default
  showClose = true,
  size = "md", // sm | md | lg
  hideFooter = false,
  extraActions,
}) {
  useEffect(() => {
    const onKey = (e) => { if (open && e.key === "Escape") onCancel?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClasses =
    confirmVariant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : confirmVariant === "primary"
        ? "bg-slate-900 hover:bg-black text-white"
        : "border bg-white hover:bg-slate-50";

  const maxWidthClass =
    size === "lg" ? "max-w-3xl" : size === "sm" ? "max-w-sm" : "max-w-md";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/40 px-3 sm:px-4 py-4 sm:py-6"
      onClick={onCancel}
    >
      <div
        className={`bg-white w-full ${maxWidthClass} max-h-[95vh] sm:max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center bg-slate-50/60 flex-shrink-0">
          <div className="font-semibold text-slate-800">{title}</div>
          {showClose && (
            <button
              onClick={onCancel}
              className="px-2 py-1 rounded-md border text-sm hover:bg-slate-50"
            >
              Close
            </button>
          )}
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          {description && <p className="text-slate-600 text-sm">{description}</p>}
          {children}
        </div>
        {!hideFooter && (
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 p-4 border-t bg-slate-50/60 flex-shrink-0">
            {extraActions}
            <button
              onClick={onCancel}
              className="px-3 py-2 rounded-md border bg-white text-sm hover:bg-slate-50 w-full sm:w-auto flex items-center justify-center"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-3 py-2 rounded-md shadow-sm text-sm w-full sm:w-auto flex items-center justify-center ${confirmClasses}`}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
