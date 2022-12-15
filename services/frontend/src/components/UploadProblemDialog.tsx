import React, { useEffect, useRef } from "react";
import { apiSaveModel } from "../request";
import { createProblemPayload, handleError } from "../utils/common";
import { OutlinedButton } from "./OutlinedButton";

interface IUploadProblemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const UploadProblemDialog: React.FC<IUploadProblemDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const ref = useRef<HTMLDialogElement>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    try {
      const fields = createProblemPayload.parse({
        content: fd.get("content"),
        name: fd.get("name"),
      });

      await apiSaveModel({
        content: await fields.content.text(),
        name: fields.name,
      });

      onClose();
      onSubmit();
    } catch (e) {
      handleError(e);
    }
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
          <input type="file" name="content" required={true} accept=".mzn" />
        </div>
        <div></div>
        <button type="submit">Submit</button>
        <OutlinedButton onClick={onClose}>Cancel</OutlinedButton>
      </form>
    </dialog>
  );
};
