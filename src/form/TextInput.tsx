"use client";

import React, { useState } from "react";
import styles from "./TextInput.module.scss";

interface TextInputProps {
  name: string | null;
  value?: string | null;
  label: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validate?: (value: string) => string | null;
}

const TextInput: React.FC<TextInputProps> = ({
  name,
  value,
  label,
  onChange,
  validate,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validate) {
      const validationError = validate(e.target.value);
      setError(validationError);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div>
      <label className={styles.label}>{label}</label>
      <input
        type="text"
        className={styles.input}
        name={name || "text-input"}
        value={value || ""}
        onChange={handleChange}
      />

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default TextInput;
