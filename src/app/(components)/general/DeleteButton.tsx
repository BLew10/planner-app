import React, { useEffect, useState } from "react";
import styles from "./DeleteButton.module.scss";
import ActionModal from "./ActionModal";

interface DeleteButtonProps {
  title: string;
  text: string;
  deleteText?: string;
  onDelete: () => void;
}

const DeleteButton = ({ title, text, onDelete, deleteText = "Delete" }: DeleteButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        onAction={() => {
          onDelete();
          setIsOpen(false);
        }}
        title={title}
        text={text}
      />
      <button
        type="submit"
        className={styles.deleteAction}
        onClick={() => setIsOpen(true)}
      >
        {deleteText}
      </button>
    </>
  );
};

export default DeleteButton;
