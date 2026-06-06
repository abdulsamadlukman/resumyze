import React from "react";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal = ({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmLabel = "Yes",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        <p className="mt-3 text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
