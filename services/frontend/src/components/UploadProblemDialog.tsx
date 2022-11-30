import React, { useEffect, useRef } from "react";
import { createProblemPayload } from "../utils/common";
import { OutlinedButton } from "./OutlinedButton";

interface IUploadProblemDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadProblemDialog: React.FC<IUploadProblemDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const ref = useRef<HTMLDialogElement>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const fields = createProblemPayload.parse({
      data: fd.get("mdn"),
      model: fd.get("mzn"),
      name: fd.get("name"),
    });

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
        <label>Name</label>
        <input type="text" required={true} name="name" />
        <div>
          <label>Model (.mzn file)</label>
          <input type="file" name="mzn" required={true} accept=".mzn" />
        </div>
        <div>
          <label>Data (.mdn file)</label>
          <input type="file" name="mdn" accept=".mdn" />
        </div>
        <div></div>
        <button type="submit">Submit</button>
        <OutlinedButton onClick={onClose}>Cancel</OutlinedButton>
      </form>
    </dialog>
  );
};
