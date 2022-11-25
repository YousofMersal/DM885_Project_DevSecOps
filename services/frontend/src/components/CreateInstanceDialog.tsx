import React, { useEffect, useRef } from "react";

interface ICreateInstanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInstanceDialog: React.FC<ICreateInstanceDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const ref = useRef<HTMLDialogElement>(null);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      ref.current?.show();
    } else {
      ref.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog ref={ref}>
      <form onSubmit={handleSubmit}>
        <p>
          <label>
            Select type:
            <select>
              <option value="default">Choose…</option>
              <option>DZN</option>
              <option>MZN</option>
            </select>
          </label>
        </p>
        <div>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">Create</button>
        </div>
      </form>
    </dialog>
  );
};
