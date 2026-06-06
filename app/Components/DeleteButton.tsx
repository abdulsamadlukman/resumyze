import React from "react";

type DeleteButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

const DeleteButton = ({ onClick, disabled = false }: DeleteButtonProps) => {
  return (
    <button
      type="button"
      className="absolute -top-3 -right-3 z-10 h-10 w-10 rounded-full bg-purple-600 text-white shadow-lg transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      aria-label="Delete resume"
      title="Delete resume"
    >
      <span className="text-xl leading-none">×</span>
    </button>
  );
};

export default DeleteButton;
